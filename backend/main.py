import os
import logging
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uuid

# Import services
from services.speech_to_text import transcribe_audio, detect_language
from services.intent_classification import classify_intent, generate_response
from services.scheme_matching import match_schemes, get_scheme_by_id
from services.text_to_speech import generate_speech, generate_empathetic_speech

# Import routers
from routes.audio import router as audio_router
from routes.schemes import router as schemes_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Maitri AI API", description="API for Maitri AI - Women-Centric AI Scheme Advisor")

# Mount routers
app.include_router(audio_router)
app.include_router(schemes_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directories if they don't exist
os.makedirs("temp_audio", exist_ok=True)
os.makedirs("temp_uploads", exist_ok=True)

# Define request/response models
class ProcessAudioResponse(BaseModel):
    text: str
    intent: Dict[str, Any]
    schemes: List[Dict[str, Any]]
    response: str
    audio_url: str

class SchemeRequest(BaseModel):
    scheme_id: str

@app.get("/")
async def read_root():
    return {"message": "Welcome to Maitri AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)