import os
import logging
import google.generativeai as genai
from typing import Optional

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError('GEMINI_API_KEY environment variable is not set')

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

async def generate_response(text: str) -> str:
    """
    Generate a response using Gemini API based on user's transcribed text.
    
    Args:
        text: The transcribed text from user's speech
        
    Returns:
        Generated response text
    """
    try:
        logger.info(f"Generating response for: {text[:50]}...")
        
        # Create a context-aware prompt
        prompt = f"""You are Maitri AI, a helpful and empathetic assistant.
        Please provide a natural and helpful response to: {text}
        Keep the response concise and conversational."""
        
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        logger.info(f"Generated response: {response_text[:50]}...")
        return response_text
        
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        raise