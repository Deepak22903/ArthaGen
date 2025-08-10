# unanswered_handler.py
# Handle unanswered questions by calling Node.js API

import requests
import json
import logging

logger = logging.getLogger(__name__)

def get_mobile_from_session(session_id):
    """
    Get mobile number from session ID by calling Node.js API
    """
    if not session_id:
        return None
        
    try:
        print(f"PYTHON LOG: Fetching mobile number for session_id: {session_id}", flush=True)
        
        # Call Node.js API to get session details
        api_url = f"http://localhost:8000/api/session/{session_id}"
        
        response = requests.get(
            api_url,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"PYTHON LOG: Session response received: {response_data}", flush=True)
            
            # Extract mobile number from response structure
            if (response_data.get('status') == 'success' and 
                'session' in response_data and 
                'user' in response_data['session'] and 
                'mobileNo' in response_data['session']['user']):
                
                mobile_no = response_data['session']['user']['mobileNo']
                print(f"PYTHON LOG: Extracted mobile number: {mobile_no}", flush=True)
                return mobile_no
            else:
                print(f"PYTHON LOG: No mobile number found in session response structure", flush=True)
                return None
        else:
            print(f"PYTHON LOG: Failed to fetch session: {response.status_code} - {response.text}", flush=True)
            return None
            
    except Exception as e:
        print(f"PYTHON LOG: Error fetching mobile from session: {str(e)}", flush=True)
        return None

def save_unanswered_question(question, mobile_no=None, session_id=None):
    """
    Save unanswered question to database via Node.js API
    """
    try:
        print(f"PYTHON LOG: save_unanswered_question called with question: {question}, mobile_no: {mobile_no}, session_id: {session_id}", flush=True)
        
        # Try to get mobile number from session if not provided
        if not mobile_no and session_id:
            mobile_no = get_mobile_from_session(session_id)
        
        # Default mobile number if still not available
        if not mobile_no:
            mobile_no = "unknown"
            print(f"PYTHON LOG: Using default mobile number: {mobile_no}", flush=True)
        else:
            print(f"PYTHON LOG: Using mobile number: {mobile_no}", flush=True)
        
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
        
        # print(f"PYTHON LOG: API response status: {response.status_code}, text: {response.text}", flush=True)
        
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
