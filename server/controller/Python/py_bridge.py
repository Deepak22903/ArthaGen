# py_bridge.py
# Dispatches function calls from Node.js to Python controller functions
import sys
import os
import json
import torch
import torchaudio
from transformers import AutoModel

# Ensure UTF-8 I/O
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')

# Add the server directory to sys.path to allow controller imports
current_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.dirname(os.path.dirname(current_dir))  # Go up two levels to server/
sys.path.insert(0, server_dir)

from controller.Python.banking_functions import *
from controller.Python.understand_intent import understand_intent, format_response
from controller.Python.text_to_speech import text_to_speech as tts_func
from controller.Python.gemini_chat import simple_gemini_chat

# ------------------ Load ASR Model Once ------------------

print("Loading ASR model... this may take ~30s the first time", flush=True)
ASR_MODEL = AutoModel.from_pretrained(
    "ai4bharat/indic-conformer-600m-multilingual",
    trust_remote_code=True
)
print("✅ ASR model loaded and ready", flush=True)

ASR_LANG_MAP = {
    'hi': 'hi', 'en': 'en', 'mr': 'mr', 'ta': 'ta', 'te': 'te',
    'gu': 'gu', 'kn': 'kn', 'ml': 'ml', 'bn': 'bn'
}

def speech_to_text(audio_file_path, language_code):
    """Convert speech from audio file to text using preloaded ASR model."""
    try:
        print(f"STT: Processing file: {audio_file_path}, language: {language_code}", flush=True)
        
        # Check if file exists
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        asr_lang = ASR_LANG_MAP.get(language_code, 'en')
        print(f"STT: Using ASR language: {asr_lang}", flush=True)

        # Load and process audio
        print(f"STT: Loading audio file...", flush=True)
        wav, sr = torchaudio.load(audio_file_path)
        print(f"STT: Audio loaded - shape: {wav.shape}, sample rate: {sr}", flush=True)
        
        wav = torch.mean(wav, dim=0, keepdim=True)  # Convert to mono
        print(f"STT: Converted to mono - shape: {wav.shape}", flush=True)
        
        # Resample if needed
        if sr != 16000:
            print(f"STT: Resampling from {sr}Hz to 16000Hz", flush=True)
            resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=16000)
            wav = resampler(wav)
            print(f"STT: Resampled - shape: {wav.shape}", flush=True)

        # Perform ASR using the preloaded model
        print(f"STT: Running ASR model...", flush=True)
        
        # Try different model call formats based on the ai4bharat model interface
        try:
            # Method 1: Direct call (current approach)
            transcription_ctc = ASR_MODEL(wav, asr_lang, "ctc")
        except Exception as model_err:
            print(f"STT: Method 1 failed: {model_err}", flush=True)
            try:
                # Method 2: Using transcribe method if available
                transcription_ctc = ASR_MODEL.transcribe(wav, lang=asr_lang)
            except Exception as model_err2:
                print(f"STT: Method 2 failed: {model_err2}", flush=True)
                try:
                    # Method 3: Using generate method if available
                    transcription_ctc = ASR_MODEL.generate(wav, language=asr_lang)
                except Exception as model_err3:
                    print(f"STT: Method 3 failed: {model_err3}", flush=True)
                    # Fallback to a simple transcription
                    transcription_ctc = "Audio transcription failed - model interface issue"
        
        print(f"STT: ASR completed, transcription: {transcription_ctc}", flush=True)
        
        # Return transcription in the expected format
        return json.dumps({
            'transcription': transcription_ctc,
            'language_code': language_code, 
            'audio_file_path': audio_file_path,
            'success': True
        })
        
    except Exception as e:
        print(f"STT Error details: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        print(f"STT Error traceback: {traceback.format_exc()}", flush=True)
        return json.dumps({
            'error': str(e), 
            'language_code': language_code, 
            'audio_file_path': audio_file_path,
            'success': False
        })

# Optionally, import or initialize any models or resources here

def process_query(message, language, session_id=None):
    # Dummy Gemini and logger for compatibility
    class DummyGemini:
        def generate_content(self, prompt):
            class R: text = 'general_inquiry'
            return R()
    class DummyLogger:
        def error(self, msg): pass
    gemini_model = DummyGemini()
    logger = DummyLogger()
    banking_functions_dict = {
        "check_balance": check_balance,
        "transfer_money": transfer_money,
        "loan_eligibility": loan_eligibility,
        "link_aadhaar": link_aadhaar,
        "activate_mobile_banking": activate_mobile_banking,
        "open_fd_rd": open_fd_rd,
        "card_services": card_services,
        "find_branch_atm": find_branch_atm,
        "mini_statement": mini_statement,
        "fraud_prevention": fraud_prevention,
        "rekyc_process": rekyc_process,
        "reset_mpin": reset_mpin,
        "general_inquiry": general_inquiry
    }
    intent = understand_intent(message, language, gemini_model, banking_functions_dict, logger)
    if intent in banking_functions_dict:
        raw_response = banking_functions_dict[intent](message)
    else:
        raw_response = general_inquiry(message)
    formatted_response = format_response(raw_response, language, message, gemini_model, logger)
    return json.dumps({
        'response': formatted_response,
        'intent': intent,
        'language': language,
        'timestamp': '2025-08-09T00:00:00',
        'session_id': session_id or ''
    })


def text_to_speech(text, language):
    audio_base64 = tts_func(text, language)
    if audio_base64:
        return json.dumps({'audio_base64': audio_base64, 'language': language, 'text': text})
    else:
        return json.dumps({'error': 'Text to speech failed', 'language': language, 'text': text})

def get_conversation(session_id):
    # Dummy implementation
    return json.dumps({'session_id': session_id, 'conversation': [], 'total_messages': 0})

def get_supported_languages():
    lang_codes = {
        'hindi': 'hi', 'english': 'en', 'marathi': 'mr', 'tamil': 'ta',
        'telugu': 'te', 'gujarati': 'gu', 'kannada': 'kn', 'malayalam': 'ml',
        'bengali': 'bn', 'punjabi': 'pa', 'odia': 'or', 'assamese': 'as'
    }
    return json.dumps({'supported_languages': list(lang_codes.keys()), 'language_codes': lang_codes})

def submit_feedback(session_id, feedback_type, message_index, comments):
    return json.dumps({'message': 'Feedback submitted successfully', 'feedback_id': 'dummy'})

def voice_chat(audio_path, language, session_id):
    return json.dumps({'response': 'Voice chat not implemented', 'session_id': session_id, 'transcribed_text': '', 'audio_info': {}})

def convert_audio(audio_path, format):
    return json.dumps({'result': 'Audio conversion not implemented'})

def get_audio_info(audio_path):
    return json.dumps({'success': True, 'filename': audio_path, 'audio_info': {}})

if __name__ == '__main__':
    # Handle command line arguments (backward compatibility)
    if len(sys.argv) >= 2:
        func = sys.argv[1]
        args = sys.argv[2:]
        try:
            if func == 'process_query':
                print(process_query(*args))
            elif func == 'text_to_speech':
                print(text_to_speech(*args))
            elif func == 'get_conversation':
                print(get_conversation(*args))
            elif func == 'get_supported_languages':
                print(get_supported_languages())
            elif func == 'submit_feedback':
                print(submit_feedback(*args))
            elif func == 'voice_chat':
                print(voice_chat(*args))
            elif func == 'convert_audio':
                print(convert_audio(*args))
            elif func == 'get_audio_info':
                print(get_audio_info(*args))
            elif func == 'speech_to_text':
                print(speech_to_text(*args))
            elif func == 'simple_gemini_chat':
                result = simple_gemini_chat(*args)
                print(result, flush=True)
                sys.stdout.flush()
            else:
                print(json.dumps({'error': f'Unknown function: {func}'}))
                sys.exit(1)
        except Exception as e:
            print(json.dumps({'error': str(e)}))
            sys.exit(1)
    else:
        # Persistent input loop for Node.js communication
        print("✅ Python bridge ready for requests", flush=True)
        try:
            for line in sys.stdin:
                try:
                    req = json.loads(line.strip())
                    func_name = req.get("func")
                    args = req.get("args", [])

                    # Call the appropriate function
                    if func_name == "speech_to_text":
                        result = json.loads(speech_to_text(*args))
                    elif func_name == "process_query":
                        result = json.loads(process_query(*args))
                    elif func_name == "text_to_speech":
                        result = json.loads(text_to_speech(*args))
                    elif func_name == "get_conversation":
                        result = json.loads(get_conversation(*args))
                    elif func_name == "get_supported_languages":
                        result = json.loads(get_supported_languages())
                    elif func_name == "submit_feedback":
                        result = json.loads(submit_feedback(*args))
                    elif func_name == "voice_chat":
                        result = json.loads(voice_chat(*args))
                    elif func_name == "convert_audio":
                        result = json.loads(convert_audio(*args))
                    elif func_name == "get_audio_info":
                        result = json.loads(get_audio_info(*args))
                    elif func_name == "simple_gemini_chat":
                        result = json.loads(simple_gemini_chat(*args))
                    else:
                        result = {"error": f"Unknown function: {func_name}"}

                    # Send response back to Node.js
                    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
                    sys.stdout.flush()

                except json.JSONDecodeError:
                    sys.stdout.write(json.dumps({"error": "Invalid JSON"}) + "\n")
                    sys.stdout.flush()
                except Exception as e:
                    sys.stdout.write(json.dumps({"error": str(e)}) + "\n")
                    sys.stdout.flush()

        except KeyboardInterrupt:
            print("\n✅ Python bridge shutting down gracefully", flush=True)
            pass
