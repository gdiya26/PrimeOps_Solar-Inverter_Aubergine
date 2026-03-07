import requests
import json

env_vars = {}
with open('backend/.env', 'r') as f:
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env_vars[k] = v

url = env_vars.get("SUPABASE_URL")
key = env_vars.get("SUPABASE_SERVICE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

tables_to_check = ["inverters", "plant1_1", "plant1_2", "telemetry"]

for table in tables_to_check:
    print(f"Checking {table}...")
    response = requests.get(f"{url}/rest/v1/{table}?limit=1", headers=headers)
    if response.status_code == 200:
        print(f"Schema for {table}:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Failed to fetch {table}: {response.text}")
