# unanswered_handler.py
# Handle unanswered questions by calling Node.js API

import requests
import json
import logging

logger = logging.getLogger(__name__)

def save_unanswered_question(question, mobile_no=None, session_id=None):
    """
    Save unanswered question to database via Node.js API
    """
    try:
        print(f"PYTHON LOG: save_unanswered_question called with question: {question}, mobile_no: {mobile_no}, session_id: {session_id}", flush=True)
        
        # Default mobile number if not provided (you can modify this logic)
        if not mobile_no:
            mobile_no = "unknown"
        
        # Prepare payload
        payload = {
            "mobileNo": mobile_no,
            "question": question,
            "notifyUser": True,  # Default to notify user
            "sessionId": session_id
        }
        
        print(f"PYTHON LOG: Prepared payload: {payload}", flush=True)
        
        # Call Node.js API endpoint
        api_url = "http://localhost:8000/api/admin/unanswered"
        print(f"PYTHON LOG: Making POST request to {api_url}", flush=True)
        
        response = requests.post(
            api_url,
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=5
        )
        
        print(f"PYTHON LOG: API response status: {response.status_code}, text: {response.text}", flush=True)
        
        if response.status_code == 201:
            logger.info(f"Unanswered question saved successfully: {question[:50]}...")
            return {
                'success': True,
                'message': 'Question saved for admin review',
                'data': response.json()
            }
        else:
            logger.error(f"Failed to save unanswered question: {response.status_code} - {response.text}")
            return {
                'success': False,
                'message': 'Failed to save question',
                'error': response.text
            }
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error when saving unanswered question: {str(e)}")
        return {
            'success': False,
            'message': 'Network error',
            'error': str(e)
        }
    except Exception as e:
        logger.error(f"Unexpected error when saving unanswered question: {str(e)}")
        return {
            'success': False,
            'message': 'Unexpected error',
            'error': str(e)
        }

def is_general_inquiry_response(response):
    """
    Check if the response is a generic general inquiry response
    indicating that the intent was not properly understood
    """
    generic_indicators = [
        "Welcome to Bank of Maharashtra!",
        "I can help you with:",
        "Customer Care: 1800-233-4526",
        "Please ask me about any specific banking service"
    ]
    
    # Check if response contains generic indicators
    for indicator in generic_indicators:
        if indicator in response:
            return True
    
    return False
