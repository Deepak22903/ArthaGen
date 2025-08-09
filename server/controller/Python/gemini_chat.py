# gemini_chat.py
# Simple Gemini chat without STT/TTS - just text to text

import google.generativeai as genai
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiChat:
    def __init__(self):
        # Configuration
        self.GEMINI_API_KEY = "AIzaSyCm4yCgVe0kswQvypeoMa3cEh3MX6mWRa0"  # Your API key
        
        # Initialize Gemini
        genai.configure(api_key=self.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Store conversation history (in production, use proper database)
        self.conversations = {}
    
    def chat_with_gemini(self, user_message, session_id=None, system_prompt=None):
        """Simple text chat with Gemini"""
        try:
            # Default system prompt for banking context
            if system_prompt is None:
                system_prompt = """You are a helpful banking assistant for Bank of Maharashtra. 
                You can help with general banking queries, provide information about banking services, 
                and assist customers with their questions. Be friendly, helpful, and professional."""
            
            # Create full prompt with context
            full_prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
            
            # Get response from Gemini
            response = self.gemini_model.generate_content(full_prompt)
            ai_response = response.text.strip()
            
            # Save conversation if session_id provided
            if session_id:
                self.save_conversation(session_id, user_message, ai_response)
            
            return {
                'response': ai_response,
                'user_message': user_message,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error in Gemini chat: {e}")
            return {
                'error': str(e),
                'user_message': user_message,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'error'
            }
    
    def chat_with_context(self, user_message, session_id):
        """Chat with conversation history context"""
        try:
            # Get conversation history
            conversation_history = self.get_conversation_history(session_id)
            
            # Build context from history
            context = "Previous conversation:\n"
            for entry in conversation_history[-5:]:  # Last 5 messages for context
                context += f"User: {entry['user_input']}\nAssistant: {entry['response']}\n"
            
            # System prompt with context
            system_prompt = f"""You are a helpful banking assistant for Bank of Maharashtra. 
            You can help with general banking queries, provide information about banking services, 
            and assist customers with their questions. Be friendly, helpful, and professional.
            
            {context}
            
            Current conversation:"""
            
            full_prompt = f"{system_prompt}\nUser: {user_message}\nAssistant:"
            
            # Get response from Gemini
            response = self.gemini_model.generate_content(full_prompt)
            ai_response = response.text.strip()
            
            # Save conversation
            self.save_conversation(session_id, user_message, ai_response)
            
            return {
                'response': ai_response,
                'user_message': user_message,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'success',
                'context_used': True
            }
            
        except Exception as e:
            logger.error(f"Error in contextual chat: {e}")
            return {
                'error': str(e),
                'user_message': user_message,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'error'
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

# Initialize Gemini chat instance
gemini_chat = GeminiChat()

def simple_gemini_chat(message, session_id=None):
    """Simple function to chat with Gemini - for use in py_bridge.py"""
    result = gemini_chat.chat_with_gemini(message, session_id)
    return json.dumps(result)

def contextual_gemini_chat(message, session_id):
    """Chat with conversation context - for use in py_bridge.py"""
    result = gemini_chat.chat_with_context(message, session_id)
    return json.dumps(result)

def get_gemini_conversation(session_id):
    """Get conversation history - for use in py_bridge.py"""
    history = gemini_chat.get_conversation_history(session_id)
    return json.dumps({
        'session_id': session_id,
        'conversation': history,
        'total_messages': len(history)
    })

def clear_gemini_conversation(session_id):
    """Clear conversation history - for use in py_bridge.py"""
    result = gemini_chat.clear_conversation(session_id)
    return json.dumps(result)
