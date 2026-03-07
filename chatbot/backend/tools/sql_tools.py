import requests
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_plant_inverters(plant_id: str) -> dict:
    """Returns information about inverters in a given plant table."""
    try:
        # First, try selecting by MAC address if the schema supports it
        url = f"{SUPABASE_URL}/rest/v1/{plant_id}?select=mac&limit=1000"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            unique_macs = list(set([row.get('mac') for row in data if row.get('mac')]))
            if unique_macs: # If MACs are found, use this schema
                return {
                    "success": True,
                    "plant_id": plant_id,
                    "inverter_count": len(unique_macs),
                    "inverters": unique_macs
                }
                
        # Fallback: Schemas like plant1_1 use transposed column arrays (inverters[0].id)
        url_fallback = f"{SUPABASE_URL}/rest/v1/{plant_id}?limit=1"
        resp_fallback = requests.get(url_fallback, headers=headers, timeout=10)
        
        if resp_fallback.status_code == 200 and len(resp_fallback.json()) > 0:
            data = resp_fallback.json()[0]
            # Extract unique array indexes like "0", "1", "2" from "inverters[X].id"
            import re
            indexes = set()
            for key in data.keys():
                match = re.match(r"inverters\[(\d+)\]", key)
                if match:
                    indexes.add(match.group(1))
                    
            return {
                "success": True,
                "plant_id": plant_id,
                "inverter_count": len(indexes),
                "inverters": [f"Inverter {i}" for i in sorted(list(indexes), key=int)]
            }

        return {
            "success": False,
            "error": f"Failed to query {plant_id}. Ensure it's a valid plant."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def execute_generic_sql_intent(plant_id: str, query_type: str) -> str:
    """A safe wrapper for generic structural reads about plant metadata."""
    if query_type == "count":
        info = get_plant_inverters(plant_id)
        if info['success']:
            return f"There are {info['inverter_count']} active inverters in {plant_id}."
        else:
            return f"I could not retrieve the inverter count for {plant_id} due to an error."
    elif query_type == "list":
        info = get_plant_inverters(plant_id)
        if info['success']:
            if info['inverter_count'] == 0:
                 return f"There are no installed inverters found in {plant_id}."
            return f"Here is the list of {info['inverter_count']} inverters in {plant_id}:\n" + "\n".join([f"- {mac}" for mac in info['inverters']])
        else:
             return f"I could not retrieve the list of inverters for {plant_id}."
    return "I do not have enough data to answer that."
