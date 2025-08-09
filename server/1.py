from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
    from transformers import AutoModel
import torchaudio
import google.generativeai as genai
from gtts import gTTS
import os
import tempfile
import json
    from datetime import datetime
import uuid
import logging
    from werkzeug.utils import secure_filename
import io
import base64
import subprocess
import tempfile
import shutil
    from pathlib import Path
# Configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level = logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
GEMINI_API_KEY = "AIzaSyCm4yCgVe0kswQvypeoMa3cEh3MX6mWRa0"  # Replace with your actual API key
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = { 'wav', 'mp3', 'm4a', 'ogg', 'flac'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok = True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize Gemini
genai.configure(api_key = GEMINI_API_KEY)

class BankingChatbotAPI:
    def __init__(self):
        # Initialize STT model
self.device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
logger.info(f"Using device: {self.device}")
        
        # Load Indic Conformer model
logger.info("Loading STT model...")
try:
self.stt_model = AutoModel.from_pretrained(
    "ai4bharat/indic-conformer-600m-multilingual",
    trust_remote_code = True
)
self.stt_model.to(self.device)
logger.info("STT model loaded successfully")
        except Exception as e:
logger.error(f"Failed to load STT model: {e}")
self.stt_model = None
        
        # Initialize Gemini
self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Language mapping
self.lang_codes = {
    'hindi': 'hi', 'english': 'en', 'marathi': 'mr', 'tamil': 'ta',
    'telugu': 'te', 'gujarati': 'gu', 'kannada': 'kn', 'malayalam': 'ml',
    'bengali': 'bn', 'punjabi': 'pa', 'odia': 'or', 'assamese': 'as'
}
        
        # Store conversation history(in production, use proper database)
self.conversations = {}
        
        # Banking services / functions
self.banking_functions = {
    "check_balance": self.check_balance,
    "transfer_money": self.transfer_money,
    "loan_eligibility": self.loan_eligibility,
    "link_aadhaar": self.link_aadhaar,
    "activate_mobile_banking": self.activate_mobile_banking,
    "open_fd_rd": self.open_fd_rd,
    "card_services": self.card_services,
    "find_branch_atm": self.find_branch_atm,
    "mini_statement": self.mini_statement,
    "fraud_prevention": self.fraud_prevention,
    "rekyc_process": self.rekyc_process,
    "reset_mpin": self.reset_mpin
}

    def allowed_file(self, filename):
return '.' in filename and \
filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def speech_to_text(self, audio_file_path, language_code):
"""Convert speech to text using Indic Conformer model"""
if not self.stt_model:
            raise Exception("STT model not available")

try:
            # Load audio file
wav, sr = torchaudio.load(audio_file_path)
wav = torch.mean(wav, dim = 0, keepdim = True)  # convert stereo to mono
            
            # Resample if needed
            target_sample_rate = 16000
if sr != target_sample_rate:
    resampler = torchaudio.transforms.Resample(orig_freq = sr, new_freq = target_sample_rate)
wav = resampler(wav)
            
            # Move to device
wav = wav.to(self.device)
            
            # Perform inference
transcription = self.stt_model(wav, language_code, "rnnt")
return transcription
        except Exception as e:
logger.error(f"Error in speech to text: {e}")
raise

    def understand_intent(self, user_input, language):
"""Use Gemini to understand user intent and select appropriate function"""
functions_list = ", ".join(self.banking_functions.keys())

prompt = f"""
        You are a banking assistant.Analyze the user's query and determine which banking service they need.
        
        User query: "{user_input}"
Language: { language }
        
        Available banking functions:
- check_balance: Check account balance via SMS / Mobile banking
    - transfer_money: Transfer money using RTGS/NEFT/IMPS / UPI
        - loan_eligibility: Check Kisan Credit Card eligibility and documentation
            - link_aadhaar: Link Aadhaar to bank account
                - activate_mobile_banking: Activate mobile banking services
                    - open_fd_rd: Open Fixed Deposit or Recurring Deposit
                        - card_services: Debit card activation / blocking services
                            - find_branch_atm: Find nearby Bank of Maharashtra branches / ATMs
                                - mini_statement: Get mini statements via missed call / SMS / app
                                    - fraud_prevention: UPI fraud prevention and safety tips
                                        - rekyc_process: Re - KYC process information
                                            - reset_mpin: Reset MPIN securely
        
        Return ONLY the function name from the list above that best matches the user's intent.
        If no function matches, return "general_inquiry".
        """

try:
response = self.gemini_model.generate_content(prompt)
intent = response.text.strip().lower()
if intent in self.banking_functions:
    return intent
else:
return "general_inquiry"
        except Exception as e:
logger.error(f"Error in intent recognition: {e}")
return "general_inquiry"
    def convert_audio_with_ffmpeg(self, input_path, output_path = None):
"""
        Convert audio file to WAV format using FFmpeg
        This ensures consistent format for speech recognition
        """
try:
if output_path is None:
output_path = input_path.rsplit('.', 1)[0] + '_converted.wav'
            
            # FFmpeg command to convert audio to WAV format
            # 16kHz sample rate, mono channel, 16 - bit PCM
ffmpeg_cmd = [
    'ffmpeg',
    '-i', input_path,           # Input file
                '-ar', '16000',             # Sample rate: 16kHz
                '-ac', '1',                 # Audio channels: 1(mono)
                '-sample_fmt', 's16',       # Sample format: 16 - bit signed integer
                '-y',                       # Overwrite output file
                output_path                 # Output file
]
            
            # Run FFmpeg command
result = subprocess.run(
    ffmpeg_cmd,
    capture_output = True,
    text = True,
    check = True
)

logger.info(f"Audio converted successfully: {input_path} -> {output_path}")
return output_path
            
        except subprocess.CalledProcessError as e:
logger.error(f"FFmpeg conversion failed: {e.stderr}")
            raise Exception(f"Audio conversion failed: {e.stderr}")
        except FileNotFoundError:
logger.error("FFmpeg not found. Please install FFmpeg.")
            raise Exception("FFmpeg not installed. Please install FFmpeg to use audio conversion.")
    def extract_audio_info(self, audio_path):
"""Extract audio file information using FFprobe"""
try:
ffprobe_cmd = [
    'ffprobe',
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    audio_path
]

result = subprocess.run(
    ffprobe_cmd,
    capture_output = True,
    text = True,
    check = True
)

import json
            audio_info = json.loads(result.stdout)
            
            # Extract relevant information
audio_stream = None
for stream in audio_info.get('streams', []):
    if stream.get('codec_type') == 'audio':
        audio_stream = stream
break

if audio_stream:
    return {
        'duration': float(audio_stream.get('duration', 0)),
        'sample_rate': int(audio_stream.get('sample_rate', 0)),
        'channels': int(audio_stream.get('channels', 0)),
        'codec': audio_stream.get('codec_name', 'unknown'),
        'bitrate': int(audio_stream.get('bit_rate', 0))
    }
else:
return None

except(subprocess.CalledProcessError, json.JSONDecodeError) as e:
logger.error(f"Failed to extract audio info: {e}")
return None
    
    def validate_audio_file(self, audio_path):
"""Validate audio file and check duration limits"""
audio_info = self.extract_audio_info(audio_path)

if not audio_info:
            raise Exception("Invalid audio file or unsupported format")
        
        # Check duration(max 5 minutes for example)
    max_duration = 300  # 5 minutes
if audio_info['duration'] > max_duration:
            raise Exception(f"Audio too long. Maximum duration: {max_duration} seconds")

        # Check if audio is too short(min 0.01 seconds)
min_duration = 0.1
if audio_info['duration'] < min_duration:
            raise Exception("Audio too short. Minimum duration: 0.01 seconds")

logger.info(f"Audio validation passed: {audio_info}")
return audio_info
    
    def speech_to_text_with_preprocessing(self, audio_file_path, language_code):
"""Enhanced speech to text with audio preprocessing"""
if not self.stt_model:
            raise Exception("STT model not available")

try:
            # Validate audio file
self.validate_audio_file(audio_file_path)
            
            # Create temporary file for processed audio
            with tempfile.NamedTemporaryFile(suffix = '.wav', delete=False) as temp_file:
    processed_audio_path = temp_file.name

try:
                # Convert audio to standard format using FFmpeg
self.convert_audio_with_ffmpeg(audio_file_path, processed_audio_path)
                
                # Load processed audio file
wav, sr = torchaudio.load(processed_audio_path)
wav = torch.mean(wav, dim = 0, keepdim = True)  # convert stereo to mono
                
                # The audio should already be 16kHz from FFmpeg conversion
target_sample_rate = 16000
if sr != target_sample_rate:
    resampler = torchaudio.transforms.Resample(orig_freq = sr, new_freq = target_sample_rate)
wav = resampler(wav)
                
                # Move to device
wav = wav.to(self.device)
                
                # Perform inference
transcription = self.stt_model(wav, language_code, "rnnt")
return transcription
                
            finally:
                # Clean up processed audio file
if os.path.exists(processed_audio_path):
    os.unlink(processed_audio_path)
                    
        except Exception as e:
logger.error(f"Error in enhanced speech to text: {e}")
raise
    def format_response(self, raw_response, language, user_query):
"""Use Gemini to format the response in the user's language"""
prompt = f"""
        Format the following banking information response in { language } language in a helpful and conversational manner.
        Make sure the response is accurate, clear, and maintains the original information.
        
        Original query: { user_query }
        Raw response: { raw_response }
        
        Provide a well - formatted, helpful response in { language } that a bank customer would understand easily.
        Keep the response concise but informative.
        """

try:
response = self.gemini_model.generate_content(prompt)
return response.text.strip()
        except Exception as e:
logger.error(f"Error in response formatting: {e}")
return raw_response

    def text_to_speech(self, text, language_code):
"""Convert text to speech using gTTS and return base64 encoded audio"""
try:
            # Map language codes for gTTS
            gtts_lang_map = {
        'hi': 'hi', 'en': 'en', 'mr': 'hi', 'ta': 'ta', 'te': 'te',
        'gu': 'gu', 'kn': 'kn', 'ml': 'ml', 'bn': 'bn'
    }
            
            gtts_lang = gtts_lang_map.get(language_code, 'en')
            tts = gTTS(text = text, lang = gtts_lang)
            
            # Save to bytes buffer
audio_buffer = io.BytesIO()
tts.write_to_fp(audio_buffer)
audio_buffer.seek(0)
            
            # Convert to base64
audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode('utf-8')
return audio_base64
            
        except Exception as e:
logger.error(f"Error in text to speech: {e}")
raise

    def save_conversation(self, session_id, user_input, response, language, intent):
"""Save conversation to memory (in production, use proper database)"""
if session_id not in self.conversations:
self.conversations[session_id] = []

conversation_entry = {
    'timestamp': datetime.now().isoformat(),
    'user_input': user_input,
    'response': response,
    'language': language,
    'intent': intent
}

self.conversations[session_id].append(conversation_entry)

    # Banking service functions(same as your original code)
    def check_balance(self, user_input):
return """To check your account balance:
        
        SMS Method:
- Send SMS "BAL" to 9212632199
    - You'll receive balance via SMS
        
        Mobile Banking:
- Login to BoM Mobile App
    - Go to Account Summary
        - Your balance will be displayed
        
        ATM Method:
- Insert debit card at any BoM ATM
    - Enter PIN and select Balance Inquiry
        
        Missed Call:
- Give missed call to 9212132199
    - You'll receive SMS with balance"""

    def transfer_money(self, user_input):
return """Money Transfer Options:

UPI(Instant):
- Open BoM UPI app or any UPI app
    - Enter recipient's UPI ID or scan QR
        - Enter amount and authenticate

IMPS(Immediate):
- Login to mobile banking
    - Select IMPS transfer
        - Enter beneficiary details and amount

NEFT(Within 2 hours):
- Available 24x7 except 2nd & 4th Saturday
    - Add beneficiary first, then transfer

RTGS(Real - time, above ₹2 lakh):
- For high - value transactions
    - Available on working days 7 AM to 6 PM"""

    def loan_eligibility(self, user_input):
return """Kisan Credit Card Loan Eligibility:
        
        Eligibility Criteria:
- Must be a farmer(owner / tenant)
    - Age: 18 - 75 years
        - Should have cultivable land
        
        Required Documents:
- Land records(7 / 12, 8A)
    - Aadhaar Card
        - PAN Card
            - Passport size photos
                - Bank statements(6 months)
                    - Income certificate
        
        Loan Amount: Up to ₹3 lakh for crop loans
        Interest Rate: 7 % per annum(with subsidy)
Repayment: After harvest season"""

    def link_aadhaar(self, user_input):
return """Link Aadhaar to Bank Account:
        
        Online Method:
- Visit BoM internet banking
    - Go to Services > Link Aadhaar
        - Enter 12 - digit Aadhaar number
            - Enter OTP received on mobile
        
        Branch Visit:
- Visit nearest BoM branch
    - Carry original Aadhaar card
        - Fill Aadhaar linking form
            - Submit to bank officer
        
        SMS Method:
- Send SMS: LINKAADHAAR < SPACE > Account Number < SPACE > Aadhaar Number
    - Send to 9212332199

Note: Linking is mandatory as per RBI guidelines"""

    def activate_mobile_banking(self, user_input):
return """Activate Mobile Banking:
        
        Step 1: Download BoM Mobile App from Play Store / App Store
        
        Step 2: Registration
    - Click 'New User Registration'
        - Enter account number and mobile number
            - Set MPIN(4 - digit)
        
        Step 3: Verification
    - OTP will be sent to registered mobile
        - Enter OTP to complete activation
        
        Step 4: Login
    - Use Customer ID and MPIN to login
        
        For help: Call customer care 1800 - 233 - 4526

Features: Balance check, money transfer, bill payments, mini statement"""

    def open_fd_rd(self, user_input):
return """Open Fixed Deposit (FD) / Recurring Deposit (RD):
        
        Fixed Deposit:
- Minimum amount: ₹1,000
    - Tenure: 7 days to 10 years
        - Interest rates: 3.5 % to 6.75 % (varies by tenure)
        
        Recurring Deposit:
- Minimum monthly deposit: ₹100
    - Tenure: 1 to 10 years
        - Interest rates: Similar to FD rates
        
        How to Open:
1. Visit BoM branch with documents
        2. Through mobile banking app
3. Internet banking portal
        
        Required Documents:
- PAN Card, Aadhaar Card
    - Passport size photo
        - Account opening form

Benefits: Higher interest than savings account, loan against FD available"""

    def card_services(self, user_input):
return """Debit Card Services:
        
        Activate New Card:
- Visit any BoM ATM
    - Insert card and enter temporary PIN
        - Change to new 4 - digit PIN
            - Card activated immediately
        
        Block Lost / Stolen Card:
- Call 24x7 helpline: 1800 - 233 - 4526
    - SMS 'BLOCK XXXX' to 9212332199(XXXX = last 4 digits)
        - Visit branch with ID proof
        
        PIN Reset:
- Visit any BoM ATM
    - Select 'PIN Change' option
        - Enter old PIN and set new PIN
        
        Card Replacement:
- Apply through mobile banking
    - Visit branch with application
    - Charges: ₹150 + GST"""

    def find_branch_atm(self, user_input):
return """Find Nearest BoM Branch/ATM:
        
        Online Branch Locator:
- Visit www.bankofmaharashtra.in
    - Click on 'Branch/ATM Locator'
        - Enter PIN code or city name
        
        Mobile App:
- Open BoM Mobile App
    - Select 'Branch/ATM Locator'
        - Allow location access or enter PIN
        
        Customer Care:
- Call 1800 - 233 - 4526
    - Provide your PIN code
        - Get nearest branch details
        
        Major Cities Coverage:
- 2800 + branches across India
    - 2400 + ATMs
    - Maximum branches in Maharashtra
        - Expanding nationwide with 50 + branches outside Maharashtra"""

    def mini_statement(self, user_input):
return """Get Mini Statement:
        
        Missed Call Method:
- Give missed call to 9212132199
    - Receive mini statement via SMS
        
        SMS Method:
- Send 'MINI' to 9212632199
    - Last 5 transactions will be sent
        
        ATM Method:
- Visit any BoM ATM
    - Insert card, enter PIN
        - Select 'Mini Statement'
            - Print statement
        
        Mobile Banking:
- Login to BoM app
    - Go to 'Account Statement'
        - Select date range
            - View / download statement

Charges: Free for missed call and SMS methods"""

    def fraud_prevention(self, user_input):
return """UPI Fraud Prevention - Safety Tips:
        
        DO's:
        ✓ Verify merchant before payment
        ✓ Check transaction amount before confirming
        ✓ Use only official bank apps
        ✓ Keep UPI PIN confidential
        ✓ Enable transaction alerts
        
        DON'Ts:
        ✗ Never share UPI PIN with anyone
        ✗ Don't click suspicious payment links
        ✗ Never accept money from unknown sources
        ✗ Don't install apps from unknown sources
        ✗ Never give remote access to phone
        
        If Fraud Occurs:
- Immediately call 1930(Cyber Crime Helpline)
    - Block UPI ID through app
        - Report to bank: 1800 - 233 - 4526
            - File police complaint
                - Contact 155260 for financial fraud reporting"""

    def rekyc_process(self, user_input):
return """Re-KYC Process:
        
        When Required:
- KYC documents older than 10 years
    - Change in address / phone number
        - Bank notification for update
        
        Required Documents:
    - Updated Aadhaar Card
        - PAN Card
            - Recent photograph
                - Address proof(if changed)

    Process:
    1. Visit BoM branch
2. Fill Re - KYC form
3. Submit updated documents
4. Provide biometric verification
5. Process completion in 7 - 10 days
        
        Online Option:
- Video KYC through mobile banking
    - Schedule appointment online
        - Complete from home

Penalty: Account restrictions if not completed within timeline"""

    def reset_mpin(self, user_input):
return """Reset MPIN Securely:
        
        Through Mobile App:
1. Open BoM Mobile Banking app
2. Click 'Forgot MPIN'
3. Enter account number and registered mobile
4. Verify OTP
5. Set new 4 - digit MPIN
        
        Through ATM:
1. Visit any BoM ATM
2. Insert debit card
3. Select 'MPIN Services'
4. Choose 'Generate MPIN'
5. Enter debit card PIN
6. Set new MPIN
        
        Through SMS:
- Send 'MPIN<space>Account Number' to 9212332199
    - Follow instructions in response SMS
        
        Security Tips:
- Use unique 4 - digit combination
    - Don't use birthdate or repetitive numbers
        - Change MPIN regularly
            - Never share with anyone"""

    def general_inquiry(self, user_input):
return """Welcome to Bank of Maharashtra!
        
        I can help you with:
- Account balance inquiry
    - Money transfers(UPI / NEFT / RTGS / IMPS)
        - Loan information
            - Mobile banking activation
                - Card services
                    - Branch / ATM locator
                        - Safety tips and fraud prevention
        
        Customer Care: 1800 - 233 - 4526(24x7)
        
        Please ask me about any specific banking service you need help with."""

    def process_query(self, user_input, language = 'english', session_id = None):
"""Process user query and return response"""
try:
            # Understand intent
intent = self.understand_intent(user_input, language)
logger.info(f"Detected intent: {intent}")
            
            # Get function response
            if intent in self.banking_functions:
    raw_response = self.banking_functions[intent](user_input)
else:
raw_response = self.general_inquiry(user_input)
            
            # Format response in user's language
formatted_response = self.format_response(raw_response, language, user_input)
            
            # Save conversation if session_id provided
if session_id:
    self.save_conversation(session_id, user_input, formatted_response, language, intent)

return {
    'response': formatted_response,
    'intent': intent,
    'language': language,
    'timestamp': datetime.now().isoformat()
}
        except Exception as e:
logger.error(f"Error processing query: {e}")
raise

# Initialize chatbot
chatbot = BankingChatbotAPI()

# API Routes
@app.route('/api/health', methods = ['GET'])
def health_check():
"""Health check endpoint"""
return jsonify({
    'status': 'healthy',
    'timestamp': datetime.now().isoformat(),
    'service': 'Banking Chatbot API'
})

@app.route('/api/chat', methods = ['POST'])
def chat():
"""Main chat endpoint for text input"""
try:
data = request.get_json()
        
        # Validate input
if not data or 'message' not in data:
return jsonify({ 'error': 'Message is required' }), 400

message = data['message'].strip()
language = data.get('language', 'english').lower()
session_id = data.get('session_id', str(uuid.uuid4()))

if not message:
    return jsonify({ 'error': 'Message cannot be empty' }), 400

if language not in chatbot.lang_codes:
return jsonify({ 'error': f'Language "{language}" not supported'}), 400
        
        # Process the query
result = chatbot.process_query(message, language, session_id)
result['session_id'] = session_id

return jsonify(result)
        
    except Exception as e:
logger.error(f"Error in chat endpoint: {e}")
return jsonify({ 'error': 'Internal server error' }), 500



@app.route('/api/text-to-speech', methods = ['POST'])
def text_to_speech():
"""Convert text response to speech"""
try:
data = request.get_json()

if not data or 'text' not in data:
return jsonify({ 'error': 'Text is required' }), 400

text = data['text'].strip()
language = data.get('language', 'english').lower()

if not text:
    return jsonify({ 'error': 'Text cannot be empty' }), 400

if language not in chatbot.lang_codes:
return jsonify({ 'error': f'Language "{language}" not supported'}), 400
        
        # Convert text to speech
lang_code = chatbot.lang_codes[language]
audio_base64 = chatbot.text_to_speech(text, lang_code)

return jsonify({
    'audio_base64': audio_base64,
    'language': language,
    'text': text
})
        
    except Exception as e:
logger.error(f"Error in text-to-speech endpoint: {e}")
return jsonify({ 'error': 'Internal server error' }), 500

@app.route('/api/conversation/<session_id>', methods = ['GET'])
def get_conversation(session_id):
"""Get conversation history for a session"""
try:
if session_id not in chatbot.conversations:
return jsonify({ 'error': 'Session not found' }), 404

conversation = chatbot.conversations[session_id]
return jsonify({
    'session_id': session_id,
    'conversation': conversation,
    'total_messages': len(conversation)
})
        
    except Exception as e:
logger.error(f"Error getting conversation: {e}")
return jsonify({ 'error': 'Internal server error' }), 500

@app.route('/api/languages', methods = ['GET'])
def get_supported_languages():
"""Get list of supported languages"""
return jsonify({
    'supported_languages': list(chatbot.lang_codes.keys()),
    'language_codes': chatbot.lang_codes
})

@app.route('/api/feedback', methods = ['POST'])
def submit_feedback():
"""Submit feedback for a response"""
try:
data = request.get_json()

if not data:
    return jsonify({ 'error': 'Feedback data is required' }), 400

session_id = data.get('session_id')
feedback_type = data.get('feedback_type')  # 'thumbs_up' or 'thumbs_down'
message_index = data.get('message_index', -1)  # Index of message in conversation
comments = data.get('comments', '')

if not session_id or feedback_type not in ['thumbs_up', 'thumbs_down']:
return jsonify({ 'error': 'Invalid feedback data' }), 400
        
        # Store feedback(in production, save to database)
feedback_entry = {
    'session_id': session_id,
    'feedback_type': feedback_type,
    'message_index': message_index,
    'comments': comments,
    'timestamp': datetime.now().isoformat()
}
        
        # You would save this to a database in production
logger.info(f"Feedback received: {feedback_entry}")

return jsonify({
    'message': 'Feedback submitted successfully',
    'feedback_id': str(uuid.uuid4())
})
        
    except Exception as e:
logger.error(f"Error submitting feedback: {e}")
return jsonify({ 'error': 'Internal server error' }), 500
@app.route('/api/voice-chat', methods = ['POST'])
def voice_chat():
"""Enhanced chat endpoint for voice input with FFmpeg preprocessing"""
try:
        # Check if audio file was uploaded
if 'audio' not in request.files:
return jsonify({ 'error': 'Audio file is required' }), 400

file = request.files['audio']
language = request.form.get('language', 'english').lower()
session_id = request.form.get('session_id', str(uuid.uuid4()))

if file.filename == '':
    return jsonify({ 'error': 'No audio file selected' }), 400
        
        # More flexible file extension checking
allowed_extensions = { 'wav', 'mp3', 'm4a', 'ogg', 'flac', 'webm', 'mp4', 'aac'}
file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''

if file_ext not in allowed_extensions:
return jsonify({ 'error': 'Invalid audio file format. Supported: ' + ', '.join(allowed_extensions) }), 400

if language not in chatbot.lang_codes:
return jsonify({ 'error': f'Language "{language}" not supported'}), 400
        
        # Save uploaded file temporarily
filename = secure_filename(file.filename)
temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
file.save(temp_path)

try:
            # Convert speech to text using enhanced method
lang_code = chatbot.lang_codes[language]
transcribed_text = chatbot.speech_to_text_with_preprocessing(temp_path, lang_code)

if not transcribed_text:
    return jsonify({ 'error': 'Could not transcribe audio' }), 400
            
            # Process the transcribed text
result = chatbot.process_query(transcribed_text, language, session_id)
result['session_id'] = session_id
result['transcribed_text'] = transcribed_text
            
            # Add audio info for debugging
            audio_info = chatbot.extract_audio_info(temp_path)
            if audio_info:
        result['audio_info'] = audio_info

return jsonify(result)
            
        finally:
            # Clean up temporary file
if os.path.exists(temp_path):
    os.unlink(temp_path)
        
    except Exception as e:
logger.error(f"Error in enhanced voice chat endpoint: {e}")
return jsonify({ 'error': str(e) }), 500

# Add a new endpoint for audio format conversion
@app.route('/api/convert-audio', methods = ['POST'])
def convert_audio():
"""Endpoint to convert audio files to different formats"""
try:
if 'audio' not in request.files:
return jsonify({ 'error': 'Audio file is required' }), 400

file = request.files['audio']
output_format = request.form.get('format', 'wav').lower()

if file.filename == '':
    return jsonify({ 'error': 'No audio file selected' }), 400
        
        # Supported output formats
supported_formats = ['wav', 'mp3', 'ogg', 'flac', 'm4a']
if output_format not in supported_formats:
return jsonify({ 'error': f'Unsupported output format. Supported: {", ".join(supported_formats)}'}), 400
        
        # Save uploaded file temporarily
filename = secure_filename(file.filename)
session_id = str(uuid.uuid4())
input_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_input_{filename}")
output_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_output.{output_format}")

file.save(input_path)

try:
            # Convert using FFmpeg
chatbot.convert_audio_with_ffmpeg(input_path, output_path)
            
            # Return converted file
return send_file(
    output_path,
    as_attachment = True,
    download_name = f"converted.{output_format}",
    mimetype = f"audio/{output_format}"
)
            
        finally:
            # Clean up temporary files
for path in [input_path, output_path]:
    if os.path.exists(path):
        os.unlink(path)
        
    except Exception as e:
logger.error(f"Error in audio conversion endpoint: {e}")
return jsonify({ 'error': str(e) }), 500

# Add endpoint to get audio information
@app.route('/api/audio-info', methods = ['POST'])
def get_audio_info():
"""Get information about an audio file"""
try:
if 'audio' not in request.files:
return jsonify({ 'error': 'Audio file is required' }), 400

file = request.files['audio']

if file.filename == '':
    return jsonify({ 'error': 'No audio file selected' }), 400
        
        # Save uploaded file temporarily
filename = secure_filename(file.filename)
session_id = str(uuid.uuid4())
temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")

file.save(temp_path)

try:
            # Get audio information
audio_info = chatbot.extract_audio_info(temp_path)

if audio_info:
    return jsonify({
        'success': True,
        'filename': filename,
        'audio_info': audio_info
    })
else:
return jsonify({ 'error': 'Could not extract audio information' }), 400
            
        finally:
            # Clean up temporary file
if os.path.exists(temp_path):
    os.unlink(temp_path)
        
    except Exception as e:
logger.error(f"Error in audio info endpoint: {e}")
return jsonify({ 'error': str(e) }), 500
@app.errorhandler(404)
def not_found(error):
return jsonify({ 'error': 'Endpoint not found' }), 404

@app.errorhandler(500)
def internal_error(error):
return jsonify({ 'error': 'Internal server error' }), 500

if __name__ == '__main__':
    # Run the Flask app
app.run(debug = True, host = '0.0.0.0', port = 5080)