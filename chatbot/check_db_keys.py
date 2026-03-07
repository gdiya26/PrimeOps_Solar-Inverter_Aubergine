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

response = requests.get(f"{url}/rest/v1/plant1_1?limit=1", headers=headers)
if response.status_code == 200:
    data = response.json()
    if data:
        print(list(data[0].keys()))
else:
    print(response.text)
