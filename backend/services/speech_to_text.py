import os
import logging
import asyncio
import whisper

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Load Whisper model once (you can choose tiny, base, small, medium, large)
whisper_model = whisper.load_model("base")

async def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using Whisper.
    """
    try:
        logger.info(f"Transcribing audio file: {audio_file_path}")

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        # Run actual transcription
        result = whisper_model.transcribe(audio_file_path)
        transcribed_text = result["text"].strip()

        logger.info(f"Transcribed text: {transcribed_text}")
        return transcribed_text

    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise

async def detect_language(audio_file_path: str) -> str:
    """
    Detect the language spoken in the audio file using Whisper.
    """
    try:
        logger.info(f"Detecting language in audio file: {audio_file_path}")

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        # Load and prepare audio
        audio = whisper.load_audio(audio_file_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)

        _, probs = whisper_model.detect_language(mel)
        language_code = max(probs, key=probs.get)

        logger.info(f"Detected language: {language_code}")
        return language_code

    except Exception as e:
        logger.error(f"Error detecting language: {str(e)}")
        return "unknown"

# For testing
if __name__ == "__main__":
    audio_path = "D:\\Cool Projects\\Maitri AI\\backend\\services\\abc.m4a"  # replace this with your actual file

    async def run():
        text = await transcribe_audio(audio_path)
        print(f"\n🗣️ Transcribed: {text}")

        lang = await detect_language(audio_path)
        print(f"🌍 Language: {lang}")

    asyncio.run(run())
