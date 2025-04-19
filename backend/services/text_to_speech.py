import os
import logging
import asyncio
import argparse
from typing import Optional
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_hindi_speech(text: str, output_path: Optional[str] = None) -> str:
    """
    Generate Hindi speech from text using XTTS v2 model
    
    Args:
        text: Hindi text to convert to speech
        output_path: Path to save the generated audio file
        
    Returns:
        Path to the generated audio file
    """
    try:
        logger.info(f"Generating Hindi speech for text: {text[:50]}...")
        
        # Create output path if not provided
        if output_path is None:
            output_dir = os.path.join(os.getcwd(), "hindi_audio")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"hindi_{uuid.uuid4()}.wav")
        else:
            output_path = os.path.abspath(output_path)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Use XTTS v2 model which supports Hindi
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        
        try:
            from TTS.api import TTS
            logger.info("Loading Hindi TTS model...")
            
            # Initialize TTS with the selected model
            tts = TTS(model_name=model_name)
            
            # Generate the audio file with Hindi settings
            tts.tts_to_file(
                text=text,
                file_path=output_path,
                speaker="female",  # You can try different speaker voices
                language="hi"       # Language code for Hindi
            )
            
            logger.info(f"Hindi audio generated at: {output_path}")
            return output_path
            
        except ImportError:
            logger.error("TTS library not installed. Please install with: pip install TTS")
            raise
        except Exception as e:
            logger.error(f"Error in TTS generation: {str(e)}")
            raise
            
    except Exception as e:
        logger.error(f"Error generating Hindi speech: {str(e)}")
        raise

async def main():
    parser = argparse.ArgumentParser(description="Hindi Text-to-Speech")
    parser.add_argument("text", help="Hindi text to convert to speech")
    parser.add_argument("--output", help="Output file path (optional)", default=None)
    
    args = parser.parse_args()
    
    try:
        output_path = await generate_hindi_speech(args.text, args.output)
        logger.info(f"Success! Hindi audio saved to: {output_path}")
    except Exception as e:
        logger.error(f"Failed to generate Hindi speech: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())