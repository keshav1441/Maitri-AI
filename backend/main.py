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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Maitri AI API", description="API for Maitri AI - Women-Centric AI Scheme Advisor")

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

@app.post("/process-audio", response_model=ProcessAudioResponse)
async def process_audio(background_tasks: BackgroundTasks, audio_file: UploadFile = File(...)):
    try:
        # Save uploaded audio file
        temp_file_path = f"temp_uploads/{uuid.uuid4()}.wav"
        with open(temp_file_path, "wb") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
        
        # Process the audio file
        # 1. Transcribe audio to text
        transcribed_text = await transcribe_audio(temp_file_path)
        
        # 2. Classify intent
        intent_data = await classify_intent(transcribed_text)
        
        # 3. Match schemes based on user profile
        matched_schemes = await match_schemes(intent_data.get("user_profile", {}))
        
        # 4. Generate response
        response_text = await generate_response(intent_data, matched_schemes)
        
        # 5. Generate speech from response
        output_audio_path = f"temp_audio/{uuid.uuid4()}.mp3"
        await generate_empathetic_speech(response_text, "neutral", output_audio_path)
        
        # Clean up temporary files in the background
        background_tasks.add_task(lambda: os.remove(temp_file_path) if os.path.exists(temp_file_path) else None)
        
        # Return response
        return {
            "text": transcribed_text,
            "intent": intent_data,
            "schemes": matched_schemes,
            "response": response_text,
            "audio_url": f"/audio/{os.path.basename(output_audio_path)}"
        }
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    file_path = f"temp_audio/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg")

@app.get("/schemes")
async def get_schemes():
    from services.scheme_matching import SCHEMES_DB
    return {"schemes": SCHEMES_DB}

@app.post("/scheme")
async def get_scheme(request: SchemeRequest):
    scheme = await get_scheme_by_id(request.scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"scheme": scheme}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)