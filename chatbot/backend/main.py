from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uuid
from backend.router import process_query

app = FastAPI(title="AI Assistant Modular API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store for conversation context tracking
# Maps session_id -> {"last_plant_id": ..., "last_inverter_idx": ...}
session_store: dict = {}


class ChatRequest(BaseModel):
    query: str
    history: list = []
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


class PredictRequest(BaseModel):
    inverter_id: str = None
    plant_id: str = None
    inverter_idx: str = None


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Resolve or create session
    sid = request.session_id or str(uuid.uuid4())
    session_context = session_store.get(sid, {})

    try:
        result = process_query(request.query, request.history, session_context)
        reply = result["reply"]
        updated_context = result.get("context", {})
        # Persist updated context
        session_store[sid] = updated_context
        return ChatResponse(reply=reply, session_id=sid)
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
    return {"status": "ok", "message": "AI Assistant Backend is running."}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
