import base64
import io
import os
from gtts import gTTS
from datetime import datetime

def text_to_speech(text, language_code):
    """Convert text to speech using gTTS, save .mp3 in audio_response folder, and return base64 encoded audio"""
    try:
        # Ensure folder exists
        os.makedirs("audio_response", exist_ok=True)

        # Map language codes for gTTS
        gtts_lang_map = {
            'hi': 'hi', 'en': 'en', 'mr': 'hi', 'ta': 'ta', 'te': 'te',
            'gu': 'gu', 'kn': 'kn', 'ml': 'ml', 'bn': 'bn'
        }
        gtts_lang = gtts_lang_map.get(language_code, 'en')

        # Generate speech
        tts = gTTS(text=text, lang=gtts_lang)

        # Create unique filename
        filename = f"audio_response/tts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"

        # Save file to folder
        tts.save(filename)

        # Also create base64 output
        with open(filename, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode('utf-8')

        return audio_base64

    except Exception as e:
        # Optionally log error
        print(f"Error: {e}")
        return None
