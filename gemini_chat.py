# gemini_chat.py
# Restricted Gemini usage - only for intent understanding and response formatting

import google.generativeai as genai
import json
import logging
import sys
import os
from datetime import datetime
import asyncio  # Import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import banking functions, intent logic, and the new RAG handler
from banking_functions import *
from understand_intent import understand_intent, format_response
from rag_handler import rag_query_handler  # Import the initialized RAG handler

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
    """Intelligent chat that uses Gemini for intent/formatting and RAG for loan eligibility."""
    try:
        message_clean = fix_surrogates(str(message)).strip()
        selected_language = language or 'en'
        
        banking_functions_dict = {
            "check_balance": check_balance,
            "transfer_money": transfer_money,
            "loan_eligibility": loan_eligibility,  # This now serves as a fallback
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
        
        genai.configure(api_key="AIzaSyDEoIpbrnrgiwWiG1sC5wrX2fSyLEtuYhE")
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # TASK 1: Understand intent using Gemini
        intent = understand_intent(message_clean, selected_language, gemini_model, banking_functions_dict, logger)
        logger.info(f"Intent recognized: {intent}")
        
        raw_response = ""
        
        # *** MODIFIED LOGIC: Use RAG for loan_eligibility ***
        if intent == 'loan_eligibility':
            if rag_query_handler:
                logger.info(f"Using RAG to answer query: '{message_clean}'")
                try:
                    # Run the async RAG query from this synchronous function
                    raw_response = asyncio.run(rag_query_handler.answer_from_document(message_clean))
                except Exception as e:
                    logger.error(f"Error during RAG call for loan eligibility: {e}")
                    raw_response = "Sorry, I encountered an error while retrieving loan details. Please try again later or contact customer support."
            else:
                # Fallback to hardcoded function if RAG initialization failed
                logger.warning("RAG handler not available. Using fallback response for loan eligibility.")
                raw_response = banking_functions_dict[intent](message_clean)
        
        elif intent in banking_functions_dict:
            raw_response = banking_functions_dict[intent](message_clean)
        else:
            raw_response = general_inquiry(message_clean)
        
        # TASK 2: Format response using Gemini
        formatted_response = format_response(raw_response, selected_language, message_clean, gemini_model, logger)
        
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