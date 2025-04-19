import os
import requests
from fastapi import UploadFile, HTTPException
from typing import Optional
from .speech_to_text import transcribe_audio
from .intent_classification import classify_intent
from .scheme_matching import match_schemes
from .text_to_speech import generate_speech

class APIClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
    
    async def process_audio(self, audio_data: dict) -> dict:
        """
        Process audio recording and return response with schemes and audio URL
        
        Args:
            audio_data: Dict containing audio file info (uri, size, duration)
            
        Returns:
            Dict with keys: response, schemes, audio_url
        """
        try:
            # 1. Transcribe audio to text
            transcription = await transcribe_audio(audio_data['uri'])
            
            # 2. Classify intent from transcription
            intent = await classify_intent(transcription)
            
            # 3. Match schemes based on intent
            schemes = await match_schemes(intent)
            
            # 4. Generate TTS response
            response_text = "Here are some schemes that might help you."
            audio_url = await generate_speech(response_text)
            
            return {
                'response': response_text,
                'schemes': schemes,
                'audio_url': audio_url
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error processing audio: {str(e)}"
            )
    
    async def download_audio_response(self, audio_url: str) -> str:
        """
        Download audio response from backend
        
        Args:
            audio_url: URL or path to audio file
            
        Returns:
            Local path to downloaded audio file
        """
        try:
            if audio_url.startswith('http'):
                # Download from external URL
                response = requests.get(audio_url)
                response.raise_for_status()
                
                # Save to temp file
                temp_path = os.path.join('temp_uploads', os.path.basename(audio_url))
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                return temp_path
            else:
                # Local file path
                if not os.path.exists(audio_url):
                    raise FileNotFoundError(f"Audio file not found at {audio_url}")
                return audio_url
                
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error downloading audio: {str(e)}"
            )