import os
import json
from groq import Groq
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env'))
load_dotenv(env_path)

from backend.tools.ml_tools import get_risk_assessment, get_top_risky_inverters
from backend.tools.sql_tools import (
    execute_generic_sql_intent,
    get_total_plants,
    get_plant_list,
    get_inverter_count,
    get_total_inverter_count,
    list_inverters,
    get_inverter_telemetry,
    get_all_plants_summary,
    PLANT_LIST,
    PLANTS
)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def process_query(user_query: str, history: list = None, session_context: dict = None) -> dict:
    """Orchestrates query classification, context resolution, and tool dispatch.
    Returns dict with 'reply' and updated 'context'."""
    if not client:
        return {"reply": "Groq LLM Key missing. Cannot process intent.", "context": session_context or {}}

    history = history or []
    session_context = session_context or {}

    # Build context string from history
    context_str = "\n".join([f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}" for msg in history[-6:]])

    # Build session memory string
    mem_parts = []
    if session_context.get("last_plant_id"):
        mem_parts.append(f"Last referenced plant: {session_context['last_plant_id']}")
    if session_context.get("last_inverter_idx") is not None:
        mem_parts.append(f"Last referenced inverter index: {session_context['last_inverter_idx']}")
    session_memory = "\n".join(mem_parts) if mem_parts else "No previous context."

    # ──────────────────────────────────────────────
    # STEP 1: Intent Classification + Entity Extraction
    # ──────────────────────────────────────────────
    routing_prompt = f"""You are an intelligent router for a solar inverter AI Assistant.
Analyze the User Query, Recent Conversation, AND Session Memory to classify the intent and extract entities.

INTENTS (pick exactly one):
1. "failure_prediction" — user asks about risk, failure probability, status of a SPECIFIC inverter
2. "plant_statistics" — user asks about plants (how many, list them)
3. "inverter_statistics" — user asks about inverters (count, list, telemetry) in a plant or total
4. "maintenance_recommendation" — user asks how to fix, maintain, or reduce risk for an inverter
5. "ranking" — user asks about top/highest risk inverters
6. "clarification_needed" — the query is too vague to answer. The user did NOT specify which plant or inverter, AND there is no prior context to resolve from.
7. "general" — greetings, definitions, generic questions

ENTITY EXTRACTION RULES:
- "plant_id": Map to exact table name: "plant1_1", "plant1_2", "plant2_1", "plant3_1", "plant3_2"
  Aliases: "Plant A"/"Block A"/"plant 1_1" -> "plant1_1", "Plant B"/"Block B" -> "plant1_2", "Plant C"/"Block C" -> "plant2_1", "Plant E"/"Block E" -> "plant3_1", "Plant F"/"Block F" -> "plant3_2"
- "inverter_idx": integer index (0-based internally, but user says "inverter 1" meaning index 0, "inverter 2" meaning index 1, etc.). Convert user-facing number to 0-based index.
- PRONOUN RESOLUTION: If user says "it", "its", "that inverter", "the previous one", "this one", resolve from Session Memory.
  If Session Memory has "Last referenced plant: plant1_1" and "Last referenced inverter index: 1", and user says "What should we do about it?", set plant_id="plant1_1" and inverter_idx="1".
- If the user asks "how many inverters" without specifying a plant, and asks about "total" or "all", set intent to "inverter_statistics" with plant_id=null and query_type="total".
- If the user asks about failure risk WITHOUT specifying plant AND inverter, AND Session Memory has no prior context, set intent to "clarification_needed".

Session Memory:
{session_memory}

Recent Conversation:
{context_str}

User Query: "{user_query}"

Reply ONLY in valid raw JSON:
{{"intent": "...", "query_type": "count|list|total|summary|telemetry|null", "plant_id": "string|null", "inverter_idx": "string|null"}}"""

    try:
        routing_response = client.chat.completions.create(
            messages=[{"role": "user", "content": routing_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0,
            response_format={"type": "json_object"}
        )
        route_data = json.loads(routing_response.choices[0].message.content)
    except Exception as e:
        return {"reply": f"Error during intent classification: {e}", "context": session_context}

    intent = route_data.get("intent", "general")
    plant_id = route_data.get("plant_id")
    inverter_idx = route_data.get("inverter_idx")
    query_type = route_data.get("query_type")

    # Normalize null strings
    if plant_id in [None, "null", ""]:
        plant_id = None
    if inverter_idx in [None, "null", ""]:
        inverter_idx = None

    # ──────────────────────────────────────────────
    # STEP 2: Clarification Handling
    # ──────────────────────────────────────────────
    if intent == "clarification_needed":
        return {
            "reply": "Please specify which **plant** and **inverter** you are referring to.\n\nFor example:\n- *\"What is the failure risk for inverter 2 in plant1_1?\"*\n- *\"How many inverters are in plant2_1?\"*\n\nAvailable plants: **plant1_1** (Block A), **plant1_2** (Block B), **plant2_1** (Block C), **plant3_1** (Block E), **plant3_2** (Block F).",
            "context": session_context
        }

    if intent in ["failure_prediction", "maintenance_recommendation"]:
        if not plant_id and not inverter_idx:
            return {
                "reply": "I need more details to run the analysis. Please specify:\n- Which **plant** (e.g., plant1_1, plant2_1)?\n- Which **inverter number** (e.g., inverter 1, inverter 5)?\n\nExample: *\"What is the failure risk for inverter 2 in plant1_1?\"*",
                "context": session_context
            }

    # ──────────────────────────────────────────────
    # STEP 3: Tool Dispatching
    # ──────────────────────────────────────────────
    tool_output = ""

    if intent == "plant_statistics":
        tool_output = execute_generic_sql_intent(plant_id, query_type or "summary", user_query)

    elif intent == "inverter_statistics":
        if query_type == "total" or (not plant_id and any(w in user_query.lower() for w in ["total", "all", "exist"])):
            tool_output = get_total_inverter_count()
        elif query_type == "telemetry" and plant_id and inverter_idx is not None:
            tool_output = get_inverter_telemetry(plant_id, int(inverter_idx))
        elif query_type == "list" and plant_id:
            tool_output = list_inverters(plant_id)
        elif query_type == "count" and plant_id:
            tool_output = get_inverter_count(plant_id)
        elif not plant_id:
            tool_output = execute_generic_sql_intent(None, query_type or "count", user_query)
        else:
            tool_output = execute_generic_sql_intent(plant_id, query_type or "count", user_query)

    elif intent == "ranking":
        result = get_top_risky_inverters(plant_id=plant_id, limit=5)
        if result["success"]:
            tool_output = f"Risk ranking results ({result.get('total_analyzed', 0)} inverters analyzed):\n{json.dumps(result['risky_inverters'], indent=2)}"
        else:
            tool_output = f"Could not retrieve risk rankings: {result.get('error')}"

    elif intent in ["failure_prediction", "maintenance_recommendation"]:
        result = get_risk_assessment(plant_id=plant_id, inverter_idx=inverter_idx)
        if result["success"]:
            pred = result["data"]
            block = PLANTS.get(plant_id, "?")
            inv_label = f"Inverter {int(inverter_idx) + 1}" if inverter_idx is not None else "Unknown"
            tool_output = f"""Prediction for {inv_label} in {plant_id} (Block {block}):
- Status: {"FAILING SOON" if pred['prediction'] == 1 else "NORMAL"}
- Failure Probability: {pred['failure_probability']:.2%}
- Top Contributing Feature: {pred.get('top_contributing_feature', 'Unknown')}
- Key Telemetry: temp={pred['raw_telemetry_used'].get('inverters[0].temp', 'N/A')}, power={pred['raw_telemetry_used'].get('inverters[0].power', 'N/A')}, voltage={pred['raw_telemetry_used'].get('inverters[0].pv1_voltage', 'N/A')}"""
            # Update session context
            if plant_id:
                session_context["last_plant_id"] = plant_id
            if inverter_idx is not None:
                session_context["last_inverter_idx"] = inverter_idx
        else:
            tool_output = f"I do not have enough data to answer that. Error: {result.get('error')}"
            return {"reply": tool_output, "context": session_context}

    elif intent == "general":
        # For general queries, let the LLM respond directly without tools
        pass

    # ──────────────────────────────────────────────
    # STEP 4: Final Answer Generation (Grounded)
    # ──────────────────────────────────────────────
    answer_prompt = f"""You are an expert AI Assistant for solar plant operators.

User Query: "{user_query}"
Detected Intent: {intent}

Retrieved Data (GROUND TRUTH — only use numbers from here):
{tool_output if tool_output else "No tool was called. Respond conversationally."}

STRICT RULES:
1. NEVER fabricate plant names, inverter counts, telemetry values, or risk scores. Only quote numbers from the Retrieved Data above.
2. If Retrieved Data is empty or says "error", say: "I do not have enough data to answer that question."
3. For "failure_prediction": state the status (NORMAL/FAILING), the failure probability %, explain the top contributing feature in simple terms, and give a 1-sentence recommendation.
4. For "maintenance_recommendation": analyze the top contributing feature and give 3 concrete bullet points on what a technician should check/fix.
5. For "ranking": present results as a numbered list with inverter label, risk %, and top feature.
6. For "plant_statistics" or "inverter_statistics": present the data clearly.
7. Format in Markdown. Use **bold** for key values. Use bullet points for lists. Be concise and factual.
8. Do NOT say "The system states" or "According to the tool output". Respond naturally as if you directly know the answer."""

    try:
        final_ans = client.chat.completions.create(
            messages=[{"role": "user", "content": answer_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        reply = final_ans.choices[0].message.content
        return {"reply": reply, "context": session_context}
    except Exception as e:
        return {"reply": f"Error assembling final response: {str(e)}", "context": session_context}
