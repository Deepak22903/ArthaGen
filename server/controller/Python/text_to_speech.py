import os
from datetime import datetime
from sarvamai import SarvamAI
from sarvamai.play import save
import re
import wave
import struct
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from langdetect import detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    print("Warning: langdetect not available, using fallback language detection", flush=True)

def concatenate_wav_files(input_files, output_file):
    """Concatenate multiple WAV files into a single WAV file"""
    try:
        output_data = []
        output_params = None
        
        for i, file_path in enumerate(input_files):
            if not os.path.exists(file_path):
                print(f"Warning: Audio file {file_path} not found, skipping", flush=True)
                continue
                
            with wave.open(file_path, 'rb') as wav_file:
                if output_params is None:
                    output_params = wav_file.getparams()
                
                # Read all frames from current file
                frames = wav_file.readframes(wav_file.getnframes())
                output_data.append(frames)
                
                print(f"Concatenation: Added {len(frames)} bytes from file {i+1}", flush=True)
        
        if not output_data:
            raise Exception("No valid audio files found for concatenation")
        
        # Write concatenated audio to output file
        with wave.open(output_file, 'wb') as output_wav:
            output_wav.setparams(output_params)
            for data in output_data:
                output_wav.writeframes(data)
        
        print(f"Audio concatenation complete: {output_file}", flush=True)
        return True
        
    except Exception as e:
        print(f"Audio concatenation error: {e}", flush=True)
        return False

def detect_language(text):
    """Detect language from text using simple heuristics and patterns"""
    if LANGDETECT_AVAILABLE:
        try:
            detected = detect(text)
            return detected
        except:
            pass
    
    # Fallback to simple pattern-based detection
    # Hindi: Devanagari script
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
    # Tamil: Tamil script
    elif re.search(r'[\u0B80-\u0BFF]', text):
        return 'ta'
    # Telugu: Telugu script
    elif re.search(r'[\u0C00-\u0C7F]', text):
        return 'te'
    # Gujarati: Gujarati script
    elif re.search(r'[\u0A80-\u0AFF]', text):
        return 'gu'
    # Kannada: Kannada script
    elif re.search(r'[\u0C80-\u0CFF]', text):
        return 'kn'
    # Malayalam: Malayalam script
    elif re.search(r'[\u0D00-\u0D7F]', text):
        return 'ml'
    # Bengali: Bengali script
    elif re.search(r'[\u0980-\u09FF]', text):
        return 'bn'
    # Punjabi: Gurmukhi script
    elif re.search(r'[\u0A00-\u0A7F]', text):
        return 'pa'
    # Marathi: Devanagari script (same as Hindi, but can be contextually different)
    elif re.search(r'[\u0900-\u097F]', text):
        return 'mr'
    # Odia: Odia script
    elif re.search(r'[\u0B00-\u0B7F]', text):
        return 'or'
    # Assamese: Bengali script (similar to Bengali)
    elif re.search(r'[\u0980-\u09FF]', text):
        return 'as'
    else:
        return 'en'  # Default to English

def split_text_into_chunks(text, max_length=500):
    """Split text into chunks while preserving sentence boundaries"""
    if len(text) <= max_length:
        return [text]
    
    chunks = []
    sentences = re.split(r'[।.!?]\s*', text)  # Split on sentence endings (including Hindi/Marathi punctuation)
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # If adding this sentence would exceed max_length, start a new chunk
        if len(current_chunk) + len(sentence) + 2 > max_length and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            if current_chunk:
                current_chunk += ". " + sentence
            else:
                current_chunk = sentence
    
    # Add the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

def text_to_speech(text, language_code=None):
    """Convert text to speech using SarvamAI, save as WAV file, and return file path"""
    try:
        # Ensure audio_response folder exists
        os.makedirs("audio_response", exist_ok=True)

        # Initialize SarvamAI client
        sarvam_api_key = os.getenv('SARVAMAI_API_KEY')
        if not sarvam_api_key:
            raise ValueError("SARVAMAI_API_KEY not found in environment variables")
        
        client = SarvamAI(api_subscription_key=sarvam_api_key)
        
        # Log the input text for debugging
        print(f"TTS Input - Full Text Length: {len(text)} characters", flush=True)
        print(f"TTS Input - Language Code: {language_code}", flush=True)
        print(f"TTS Input - Full Text Content:", flush=True)
        print(f"------- START OF FULL INPUT TEXT -------", flush=True)
        print(text, flush=True)
        print(f"------- END OF FULL INPUT TEXT -------", flush=True)

        # Comprehensive language mapping for SarvamAI
        sarvam_lang_map = {
            'hi': 'hi-IN',    # Hindi
            'en': 'en-IN',    # English (Indian)
            'mr': 'mr-IN',    # Marathi
            'ta': 'ta-IN',    # Tamil
            'te': 'te-IN',    # Telugu
            'gu': 'gu-IN',    # Gujarati
            'kn': 'kn-IN',    # Kannada
            'ml': 'ml-IN',    # Malayalam
            'bn': 'bn-IN',    # Bengali
            'pa': 'pa-IN',    # Punjabi
            'or': 'or-IN',    # Odia
            'as': 'as-IN',    # Assamese
            # Additional language codes that might be detected
            'hindi': 'hi-IN',
            'english': 'en-IN',
            'marathi': 'mr-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN',
            'gujarati': 'gu-IN',
            'kannada': 'kn-IN',
            'malayalam': 'ml-IN',
            'bengali': 'bn-IN',
            'punjabi': 'pa-IN',
            'odia': 'or-IN',
            'assamese': 'as-IN'
        }

        # Split long text into chunks
        text_chunks = split_text_into_chunks(text, max_length=400)  # Keep chunks smaller for API limits
        print(f"TTS: Split text into {len(text_chunks)} chunks", flush=True)
        
        # Process all chunks
        audio_files = []
        processed_length = 0
        target_lang = None
        
        for i, chunk in enumerate(text_chunks):
            print(f"\nTTS: Processing chunk {i+1}/{len(text_chunks)}", flush=True)
            print(f"TTS: Chunk {i+1} length: {len(chunk)} characters", flush=True)
            print(f"------- START OF CHUNK {i+1} BEING SENT TO SARVAM -------", flush=True)
            print(chunk, flush=True)
            print(f"------- END OF CHUNK {i+1} BEING SENT TO SARVAM -------", flush=True)
            
            processed_length += len(chunk)
            
            # Determine the target language for this chunk
            if language_code:
                target_lang = sarvam_lang_map.get(language_code.lower(), None)
                print(f"TTS: Using provided language code '{language_code}' -> '{target_lang}'", flush=True)
            else:
                detected_lang = detect_language(chunk)
                target_lang = sarvam_lang_map.get(detected_lang, None)
                print(f"TTS: Auto-detected language '{detected_lang}' -> '{target_lang}'", flush=True)
            
            if not target_lang:
                target_lang = 'en-IN'
                print(f"TTS: No valid language found, defaulting to 'en-IN'", flush=True)
            
            # Create temporary filename for this chunk
            temp_filename = f"audio_response/temp_chunk_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
            
            try:
                # Convert chunk to speech
                print(f"TTS: Sending to SarvamAI API with parameters:", flush=True)
                print(f"  - target_language_code: {target_lang}", flush=True)
                print(f"  - text: '{chunk[:100]}...' (length: {len(chunk)})", flush=True)
                print(f"  - model: bulbul:v2", flush=True)
                print(f"  - speaker: arya", flush=True)
                print(f"  - pace: 1", flush=True)
                
                audio = client.text_to_speech.convert(
                    target_language_code=target_lang,
                    text=chunk,
                    model="bulbul:v2",
                    speaker="arya",
                    pace=1
                )
                
                # Save chunk audio
                save(audio, temp_filename)
                audio_files.append(temp_filename)
                print(f"TTS: ✅ Chunk {i+1} converted successfully -> {temp_filename}", flush=True)
                
            except Exception as chunk_error:
                print(f"TTS: ❌ Error processing chunk {i+1}: {chunk_error}", flush=True)
                import traceback
                print(f"TTS: Error traceback for chunk {i+1}: {traceback.format_exc()}", flush=True)
                continue
        
        if not audio_files:
            raise Exception("No chunks were successfully processed")
        
        # Create final filename
        final_filename = f"audio_response/tts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        
        if len(audio_files) == 1:
            # Single file, just rename it
            os.rename(audio_files[0], final_filename)
            print(f"TTS: Single chunk processed, saved as {final_filename}", flush=True)
        else:
            # Multiple files, concatenate them
            print(f"TTS: Concatenating {len(audio_files)} audio files", flush=True)
            if concatenate_wav_files(audio_files, final_filename):
                # Clean up temporary files
                for temp_file in audio_files:
                    try:
                        os.remove(temp_file)
                    except:
                        pass
                
                print(f"TTS: All chunks concatenated into {final_filename}", flush=True)
            else:
                # Fallback: use the first chunk if concatenation fails
                print(f"TTS: Concatenation failed, using first chunk only", flush=True)
                os.rename(audio_files[0], final_filename)
                # Clean up remaining files
                for temp_file in audio_files[1:]:
                    try:
                        os.remove(temp_file)
                    except:
                        pass

        # Return the file path relative to server root with detailed info
        return {
            "success": True,
            "audio_file_path": final_filename,
            "language_used": target_lang,
            "original_text_length": len(text),
            "processed_text_length": processed_length,
            "total_chunks": len(text_chunks),
            "processed_chunks": len(audio_files),
            "message": f"Text-to-speech conversion successful using {target_lang}. Processed {processed_length}/{len(text)} characters in {len(audio_files)} chunks."
        }

    except Exception as e:
        # Log error
        print(f"TTS Error: {e}", flush=True)
        import traceback
        print(f"TTS Error traceback: {traceback.format_exc()}", flush=True)
        return {
            "success": False,
            "error": str(e),
            "message": "Text-to-speech conversion failed"
        }
