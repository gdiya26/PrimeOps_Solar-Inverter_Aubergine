from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from backend.router import process_query

app = FastAPI(title="AI Assistant Modular API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    history: list = []

class ChatResponse(BaseModel):
    reply: str
    
class PredictRequest(BaseModel):
    inverter_id: str = None
    plant_id: str = None
    inverter_idx: str = None

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        reply = process_query(request.query, request.history)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_endpoint(request: PredictRequest):
    from backend.tools.ml_tools import get_risk_assessment
    result = get_risk_assessment(request.inverter_id, request.plant_id, request.inverter_idx)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Assistant Backend is running natively."}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
