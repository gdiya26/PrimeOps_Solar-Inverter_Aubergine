import tempfile
import json
import sys
from backend.router import process_query

def trace():
    r1 = process_query("What's the failure risk for inverter 1 in plant1_1?", [])
    r2 = process_query("What's the failure risk for inverter 2 in plant1_1?", [])
    
    with open("trace_output.json", "w") as f:
        json.dump({"INV1": r1, "INV2": r2}, f, indent=2)

if __name__ == "__main__":
    trace()
