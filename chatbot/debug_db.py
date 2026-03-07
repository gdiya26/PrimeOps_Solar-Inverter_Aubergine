import requests
import os
from dotenv import load_dotenv

load_dotenv('.env')

url = f"{os.environ.get('SUPABASE_URL')}/rest/v1/plant1_1?select=mac&limit=10"
headers = {
    'apikey': os.environ.get('SUPABASE_KEY'), 
    'Authorization': 'Bearer ' + os.environ.get('SUPABASE_KEY')
}
r = requests.get(url, headers=headers)
print("Status:", r.status_code)
print("Body:", r.text)
