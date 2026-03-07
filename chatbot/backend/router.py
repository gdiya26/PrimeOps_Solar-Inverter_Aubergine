import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from backend.tools.ml_tools import get_risk_assessment, get_top_risky_inverters
from backend.tools.sql_tools import execute_generic_sql_intent

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def process_query(user_query: str, history: list = None) -> str:
    """Orchestrates query classification and routes to the correct Tool."""
    if not client:
        return "Groq LLM Key missing. Cannot process intent."

    history = history or []
    context_str = "\n".join([f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}" for msg in history[-4:]])
    
    # 1. Intent Routing
    prompt = f"""
    You are an intelligent router for a solar inverter AI Assistant.
    Analyze the User Query AND Recent Context, then classify exactly one intent:
    
    1. 'failure_prediction': User asks about risk of failure, prediction, status, or main reason for failure of a specific inverter.
    2. 'plant_information': User asks about plant metadata (e.g. "How many inverters in plant2_1?", "List all inverters").
    3. 'maintenance_recommendation': User asks for instructions on fixing, maintaining, or reducing risk for an inverter.
    4. 'ranking': User asks about top risky inverters or aggregate risks (e.g. "Show the top 3 risky inverters").
    5. 'general': Default conversation, greetings, or asking for definitions of solar terms (e.g. "what is pv1 voltage?").
    
    Extract entities:
    - 'inverter_id': MAC address strings, or resolve pronouns like "it" from Context.
    - 'plant_id': MUST MAP to one of these tables exactly if present in context/query:
        - "Plant A" or "11" -> "plant1_1"
        - "Plant B" or "12" -> "plant1_2"
        - "Plant C" or "21" -> "plant2_1"
        - "Plant E" or "31" -> "plant3_1"
        - "Plant F" or "32" -> "plant3_2"
    - 'inverter_idx': an integer string "1", "2".
    
    Reply ONLY in valid raw JSON:
    {{"intent": "failure_prediction|plant_information|maintenance_recommendation|ranking|general", "query_type": "count|list|summary|null", "inverter_id": "string|null", "plant_id": "string|null", "inverter_idx": "string|null"}}
    
    Recent Context:
    {context_str}
    User Query: "{user_query}"
    """
    
    try:
        routing_response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0,
            response_format={"type": "json_object"}
        )
        route_data = json.loads(routing_response.choices[0].message.content)
    except Exception as e:
        return f"Error during intent classification: {e}"
        
    intent = route_data.get("intent", "general")
    plant_id = route_data.get("plant_id")
    inverter_id = route_data.get("inverter_id")
    inverter_idx = route_data.get("inverter_idx")
    query_type = route_data.get("query_type")

    # Early Exit Logic for Missing Context
    if intent in ["failure_prediction", "maintenance_recommendation", "ranking"]:
        if not plant_id and not inverter_id and not inverter_idx:
            return "Could you please specify which **Plant (A-F)** or **Inverter** you are referring to? I need a bit more context to run the predictive analytics."
    
    # 2. Tool Dispatching
    tool_output = ""
    
    if intent == "plant_information":
        if not plant_id:
             plant_id = "plant1_1" # Default to avoid complete failure
        tool_output = execute_generic_sql_intent(plant_id, query_type if query_type else "count")
        
    elif intent == "ranking":
        result = get_top_risky_inverters(plant_id=plant_id)
        if result["success"]:
             tool_output = f"Executed Search. System found: {json.dumps(result['risky_inverters'])}"
        else:
             tool_output = f"Action failed: {result.get('error')}"
             
    elif intent in ["failure_prediction", "maintenance_recommendation"]:
        result = get_risk_assessment(inverter_id=inverter_id, plant_id=plant_id, inverter_idx=inverter_idx)
        if result["success"]:
            prediction_data = result["data"]
            tool_output = f"""
            Raw Analytics Run Completed:
            - Prediction: {"FAILING SOON" if prediction_data['prediction'] == 1 else "NORMAL"}
            - Risk Probability: {prediction_data['failure_probability']:.2%}
            - Top Feature mathematically responsible: {prediction_data.get('top_contributing_feature', 'Unknown')}
            - Telemetry sample: {json.dumps({k: prediction_data['raw_telemetry_used'][k] for k in prediction_data['raw_telemetry_used'] if 'power' in k or 'temp' in k or 'alarm' in k or 'voltage' in k})}
            """
        else:
            tool_output = f"I do not have enough data to answer that. Database error: {result.get('error')}"
            return tool_output
            
    # 3. Final Answer Generation (Grounding / Hallucination guardrails)
    answer_prompt = f"""
    You are an expert AI Assistant solving Operational Solar requests for plant operators.
    
    User Query: "{user_query}"
    Detected Intent: {intent}
    
    System Memory / Analytics TRUTH:
    {tool_output}
    
    Instructions for generating the response:
    1. Respond directly to the user in a helpful, conversational, and user-friendly tone. Do not use robotic phrases like "The System Memory states" or "Tool Output Data".
    2. If the Intent is 'maintenance_recommendation', explicitly analyze the "Top Feature mathematically responsible" (like Temperature or Voltage) and provide 3 concrete, simple Bullet Points on how a technician should check/fix it.
    3. If the Intent is 'failure_prediction', clearly state whether the inverter is NORMAL or FAILING SOON, provide the Risk Probability percentage, and explain *why* simply (based on the Top Feature). Give a one-sentence recommendation.
    4. If the System Memory says "I do not have enough data", politely inform the user.
    5. Format elegantly in Markdown. CRITICAL: You MUST use **bold text** for important keywords, values, and entities. MUST use bullet points for lists. Structure the response neatly with headings and line breaks. Keep it concise, actionable, and visually appealing.
    """
    
    try:
        final_ans = client.chat.completions.create(
            messages=[{"role": "user", "content": answer_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3
        )
        return final_ans.choices[0].message.content
    except Exception as e:
        return f"Error assembling final response: {str(e)}"
