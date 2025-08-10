# gemini_chat.py
# Restricted Gemini usage - only for intent understanding and response formatting

import google.generativeai as genai
import json
import logging
import sys
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import banking functions at module level
from banking_functions import *
from understand_intent import understand_intent, format_response

class GeminiChat:
    def __init__(self):
        # Configuration
        self.GEMINI_API_KEY = "AIzaSyDEoIpbrnrgiwWiG1sC5wrX2fSyLEtuYhE"  # Your API key
        
        # Initialize Gemini
        genai.configure(api_key=self.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Store conversation history (in production, use proper database)
        self.conversations = {}
    
    def chat_with_gemini(self, user_message, session_id=None, system_prompt=None):
        """DEPRECATED - Gemini is restricted to intent understanding and response formatting only"""
        return {
            'response': "No. I can only help with understanding intent and formatting banking responses.",
            'user_message': user_message,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'restricted'
        }
    
    def chat_with_context(self, user_message, session_id):
        """DEPRECATED - Gemini is restricted to intent understanding and response formatting only"""
        return {
            'response': "No. I can only help with understanding intent and formatting banking responses.",
            'user_message': user_message,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'restricted'
        }
    
    def save_conversation(self, session_id, user_input, response):
        """Save conversation to memory (in production, use proper database)"""
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        
        conversation_entry = {
            'timestamp': datetime.now().isoformat(),
            'user_input': user_input,
            'response': response
        }
        
        self.conversations[session_id].append(conversation_entry)
    
    def get_conversation_history(self, session_id):
        """Get conversation history for a session"""
        return self.conversations.get(session_id, [])
    
    def clear_conversation(self, session_id):
        """Clear conversation history for a session"""
        if session_id in self.conversations:
            del self.conversations[session_id]
            return {'message': 'Conversation cleared', 'session_id': session_id}
        return {'message': 'Session not found', 'session_id': session_id}

# Initialize Gemini chat instance (only for conversation history storage)
gemini_chat = GeminiChat()

def fix_surrogates(text):
    """Recode UTF-8 to handle surrogate pairs."""
    return text.encode('utf-8', 'surrogatepass').decode('utf-8')

def intelligent_banking_chat(message, session_id=None, language=None):
    """Intelligent chat that uses Gemini ONLY for intent understanding and response formatting"""
    try:
        # Simple message handling and fixing surrogates
        message_clean = fix_surrogates(str(message)).strip()
        
        # Use default language if not provided
        selected_language = language or 'en'
        
        # Banking functions dictionary
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
        
        # Configure Gemini (only for the two allowed tasks)
        genai.configure(api_key="AIzaSyDEoIpbrnrgiwWiG1sC5wrX2fSyLEtuYhE")
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # TASK 1: Understand intent using Gemini (ONLY allowed task #1)
        intent = understand_intent(message_clean, selected_language, gemini_model, banking_functions_dict, logger)
        logger.info(f"Intent recognized: {intent}")
        print(f"Intent recognized: {intent}", flush=True)
        
        # Get raw response from appropriate banking function (no Gemini involved)
        if intent in banking_functions_dict:
            raw_response = banking_functions_dict[intent](message_clean)
        else:
            raw_response = general_inquiry(message_clean)
        
        # TASK 2: Format response using Gemini (ONLY allowed task #2)
        formatted_response = format_response(raw_response, selected_language, message_clean, gemini_model, logger)
        
        # Save conversation if session_id provided
        if session_id:
            gemini_chat.save_conversation(session_id, message_clean, formatted_response)
        
        return {
            'response': formatted_response,
            'user_message': message_clean,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'is_banking': True,
            'intent': intent
        }
        
    except Exception as e:
        logger.error(f"Error in intelligent banking chat: {str(e)}")
        return {
            'error': str(e),
            'user_message': str(message),
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'error'
        }

def simple_gemini_chat(message, session_id=None, language=None):
    """Simple function to chat with banking functions - Gemini restricted to intent & formatting only"""
    try:
        result = intelligent_banking_chat(message, session_id, language)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        error_result = {
            'error': str(e),
            'user_message': str(message),
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'error'
        }
        return json.dumps(error_result, ensure_ascii=False)
