import requests
import json

try:
    print("Testing /health...")
    r = requests.get("http://127.0.0.1:8001/health", timeout=3)
    print("Health:", r.status_code, r.text)
    
    print("Testing /chat...")
    r = requests.post("http://127.0.0.1:8001/chat", json={"query": "Hello", "history": []}, timeout=10)
    print("Chat:", r.status_code, r.text)
except Exception as e:
    print("Error:", e)
