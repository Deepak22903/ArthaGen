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
from unanswered_handler import save_unanswered_question, is_general_inquiry_response

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
        
        # Handle unrecognized intents by saving as unanswered questions
        if intent == "unrecognized_intent":
            logger.warning(f"Intent not recognized for message: {message_clean}")
            
            # Try to extract mobile number from session or use default
            mobile_no = "unknown"  # You can modify this to extract from session if available
            
            # Save as unanswered question
            save_result = save_unanswered_question(message_clean, mobile_no, session_id)
            
            if save_result['success']:
                # Return a response indicating the question has been saved
                response_message = "I couldn't understand your specific request. Your question has been saved and our team will review it shortly. You can also try rephrasing your question or contact our customer care at 1800-233-4526."
            else:
                # Fallback if saving fails
                logger.error(f"Failed to save unanswered question: {save_result['message']}")
                response_message = "I couldn't understand your specific request. Please try rephrasing your question or contact our customer care at 1800-233-4526 for assistance."
            
            return {
                'response': response_message,
                'user_message': message_clean,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'unrecognized_saved',
                'is_banking': True,
                'intent': 'unrecognized_intent',
                'saved_as_unanswered': save_result['success']
            }
        
        # Handle general_inquiry intent by saving as unanswered questions
        if intent == "general_inquiry":
            logger.info(f"General inquiry detected for message: {message_clean}")
            print(f"PYTHON LOG: Saving general inquiry as unanswered question: {message_clean}", flush=True)
            
            # Try to extract mobile number from session or use default
            mobile_no = "unknown"  # You can modify this to extract from session if available
            
            # Save as unanswered question for expert review
            print(f"PYTHON LOG: Calling save_unanswered_question with message: {message_clean}, mobile: {mobile_no}, session: {session_id}", flush=True)
            save_result = save_unanswered_question(message_clean, mobile_no, session_id)
            print(f"PYTHON LOG: Save result: {save_result}", flush=True)
            
            if save_result['success']:
                # Return a response indicating the question has been saved for expert review
                response_message = "Thank you for your question. Since this requires detailed information, I've forwarded it to our expert team for a comprehensive answer. You'll receive a response soon, or you can contact our customer care at 1800-233-4526 for immediate assistance."
                print(f"PYTHON LOG: Successfully saved general inquiry, returning response", flush=True)
            else:
                # Fallback if saving fails
                logger.error(f"Failed to save general inquiry: {save_result['message']}")
                response_message = "Thank you for your question. For detailed information about this topic, please contact our customer care at 1800-233-4526 where our experts can assist you better."
                print(f"PYTHON LOG: Failed to save general inquiry: {save_result['message']}", flush=True)
            
            return {
                'response': response_message,
                'user_message': message_clean,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'general_inquiry_saved',
                'is_banking': True,
                'intent': 'general_inquiry',
                'saved_as_unanswered': save_result['success']
            }
        
        # Get raw response from appropriate banking function (no Gemini involved)
        if intent in banking_functions_dict:
            raw_response = banking_functions_dict[intent](message_clean)
        else:
            raw_response = general_inquiry(message_clean)
        
        # Check if general_inquiry identified this as a specific question needing admin attention
        if raw_response.startswith("SPECIFIC_QUESTION:"):
            specific_question = raw_response.replace("SPECIFIC_QUESTION: ", "")
            logger.warning(f"Specific question detected in general inquiry: {specific_question}")
            
            # Try to extract mobile number from session or use default
            mobile_no = "unknown"  # You can modify this to extract from session if available
            
            # Save as unanswered question
            save_result = save_unanswered_question(specific_question, mobile_no, session_id)
            
            if save_result['success']:
                response_message = "Thank you for your specific question. I've saved it for our expert team to review and provide you with a detailed answer. You can also contact our customer care at 1800-233-4526 for immediate assistance."
            else:
                logger.error(f"Failed to save specific question: {save_result['message']}")
                response_message = "Thank you for your question. For detailed information about this topic, please contact our customer care at 1800-233-4526 where our experts can assist you better."
            
            return {
                'response': response_message,
                'user_message': message_clean,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'specific_question_saved',
                'is_banking': True,
                'intent': 'specific_question',
                'saved_as_unanswered': save_result['success']
            }
        
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
