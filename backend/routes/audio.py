from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
import logging

from services.speech_to_text import transcribe_audio
from services.text_to_speech import generate_speech, generate_empathetic_speech

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audio", tags=["audio"])

@router.post("/text-to-speech")
async def text_to_speech(text: str):
    try:
        output_path = await generate_speech(text)
        return FileResponse(output_path, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speech-to-text")
async def speech_to_text(audio_file: UploadFile = File(...)):
    try:
        temp_file_path = f"temp_uploads/{uuid.uuid4()}.wav"
        with open(temp_file_path, "wb") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
        
        text = await transcribe_audio(temp_file_path)
        os.remove(temp_file_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process")
async def process_audio(background_tasks: BackgroundTasks, audio_file: UploadFile = File(...)):
    try:
        temp_file_path = f"temp_uploads/{uuid.uuid4()}.wav"
        with open(temp_file_path, "wb") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
        
        text = await transcribe_audio(temp_file_path)
        
        output_audio_path = f"temp_audio/{uuid.uuid4()}.mp3"
        await generate_empathetic_speech(text, "neutral", output_audio_path)
        
        background_tasks.add_task(lambda: os.remove(temp_file_path) if os.path.exists(temp_file_path) else None)
        
        return {"text": text, "audio_url": f"/audio/{os.path.basename(output_audio_path)}"}
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{filename}")
async def get_audio(filename: str):
    file_path = f"temp_audio/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/mpeg")