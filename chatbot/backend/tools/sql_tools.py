import requests
import os
import re
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../backend/.env'))
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Canonical mapping of plants
PLANTS = {
    "plant1_1": "A",
    "plant1_2": "B",
    "plant2_1": "C",
    "plant3_1": "E",
    "plant3_2": "F"
}

PLANT_LIST = list(PLANTS.keys())


def get_total_plants() -> str:
    """Returns the total number of plants in the system."""
    return f"There are **{len(PLANT_LIST)} plants** in the system."


def get_plant_list() -> str:
    """Returns a formatted list of all plants with their block letters."""
    lines = [f"- **{pid}** (Block {blk})" for pid, blk in PLANTS.items()]
    return f"Available plants ({len(PLANT_LIST)} total):\n" + "\n".join(lines)


def _count_inverters_in_plant(plant_id: str) -> int:
    """Fetches the latest row from a plant table and counts inverter columns."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/{plant_id}?limit=1&order=timestamp.desc"
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200 and response.json():
            row = response.json()[0]
            indexes = set()
            for key in row.keys():
                match = re.search(r"inverters\[(\d+)\]", key)
                if match:
                    indexes.add(match.group(1))
            return len(indexes)
    except Exception:
        pass
    return 0


def get_inverter_count(plant_id: str) -> str:
    """Returns the number of inverters in a specific plant."""
    if plant_id not in PLANT_LIST:
        return f"**{plant_id}** is not a valid plant. Valid plants are: {', '.join(PLANT_LIST)}."
    count = _count_inverters_in_plant(plant_id)
    block = PLANTS.get(plant_id, "?")
    return f"**{plant_id}** (Block {block}) contains **{count} inverters**."


def get_total_inverter_count() -> str:
    """Returns the total number of inverters across all plants."""
    total = 0
    details = []
    for pid in PLANT_LIST:
        count = _count_inverters_in_plant(pid)
        total += count
        details.append(f"- {pid} (Block {PLANTS[pid]}): {count}")
    return f"There are **{total} inverters** across all plants:\n" + "\n".join(details)


def list_inverters(plant_id: str) -> str:
    """Returns a list of inverter identifiers in a specific plant."""
    if plant_id not in PLANT_LIST:
        return f"**{plant_id}** is not a valid plant. Valid plants are: {', '.join(PLANT_LIST)}."
    count = _count_inverters_in_plant(plant_id)
    block = PLANTS.get(plant_id, "?")
    if count == 0:
        return f"No inverters found in **{plant_id}**."
    lines = [f"- Inverter {i + 1}" for i in range(count)]
    return f"**{plant_id}** (Block {block}) has {count} inverters:\n" + "\n".join(lines)


def get_inverter_telemetry(plant_id: str, inverter_idx: int) -> str:
    """Returns raw telemetry data for a specific inverter in a plant."""
    if plant_id not in PLANT_LIST:
        return f"**{plant_id}** is not a valid plant."
    try:
        url = f"{SUPABASE_URL}/rest/v1/{plant_id}?limit=1&order=timestamp.desc"
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200 and response.json():
            row = response.json()[0]
            idx = str(inverter_idx)
            prefix = f"inverters[{idx}]."
            telemetry = {}
            for k, v in row.items():
                if k.startswith(prefix):
                    short_key = k.replace(prefix, "")
                    telemetry[short_key] = v

            if not telemetry:
                return f"No telemetry data found for inverter {inverter_idx + 1} in {plant_id}. The plant has {_count_inverters_in_plant(plant_id)} inverters (0-indexed)."

            block = PLANTS.get(plant_id, "?")
            lines = [f"- **{k}**: {v}" for k, v in telemetry.items()]
            return f"Telemetry for **Inverter {inverter_idx + 1}** in **{plant_id}** (Block {block}):\n" + "\n".join(lines)
    except Exception as e:
        return f"Error retrieving telemetry: {str(e)}"
    return "I do not have enough data to answer that."


def get_all_plants_summary() -> str:
    """Gets total plants and their respective inverter counts."""
    total = 0
    lines = []
    for pid, blk in PLANTS.items():
        count = _count_inverters_in_plant(pid)
        total += count
        lines.append(f"- **{pid}** (Block {blk}): {count} inverters")
    return f"There are **{len(PLANT_LIST)} plants** with a total of **{total} inverters**:\n" + "\n".join(lines)


def execute_generic_sql_intent(plant_id: str, query_type: str, user_query: str = "") -> str:
    """Dispatcher that routes to the appropriate structured tool based on query type and user query."""
    q = user_query.lower()

    # Detect if the user is asking about total/all plants
    if any(w in q for w in ["how many plants", "total plants", "number of plants"]):
        return get_total_plants()

    if any(w in q for w in ["list all plants", "list plants", "list the plants", "show plants", "available plants"]):
        return get_plant_list()

    if any(w in q for w in ["total inverters", "inverters in total", "how many inverters exist", "all inverters"]) and not plant_id:
        return get_total_inverter_count()

    # Plant-specific queries
    if query_type == "summary":
        return get_all_plants_summary()

    if query_type == "count":
        if not plant_id:
            return get_total_inverter_count()
        return get_inverter_count(plant_id)

    if query_type == "list":
        if not plant_id:
            return get_plant_list()
        return list_inverters(plant_id)

    return "I do not have enough data to answer that question."
