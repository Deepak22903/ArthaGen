# test_gemini.py
# Simple test script to test Gemini chat endpoints

import requests
import json
import uuid

# Server URL
BASE_URL = "http://localhost:5000/api/gemini"

def test_simple_chat():
    """Test simple chat without context"""
    print("Testing simple Gemini chat...")
    
    response = requests.post(f"{BASE_URL}/chat", json={
        "message": "Hello! What banking services can you help me with?",
        "session_id": str(uuid.uuid4())
    })
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_contextual_chat():
    """Test chat with conversation context"""
    print("Testing contextual Gemini chat...")
    
    session_id = str(uuid.uuid4())
    
    # First message
    response1 = requests.post(f"{BASE_URL}/chat-context", json={
        "message": "I want to open a savings account",
        "session_id": session_id
    })
    print(f"First message response: {response1.json()}")
    
    # Second message with context
    response2 = requests.post(f"{BASE_URL}/chat-context", json={
        "message": "What documents do I need for that?",
        "session_id": session_id
    })
    print(f"Second message response: {response2.json()}")
    print("-" * 50)

def test_conversation_history():
    """Test getting conversation history"""
    print("Testing conversation history...")
    
    session_id = str(uuid.uuid4())
    
    # Send a few messages
    requests.post(f"{BASE_URL}/chat-context", json={
        "message": "Hello",
        "session_id": session_id
    })
    
    requests.post(f"{BASE_URL}/chat-context", json={
        "message": "Tell me about loans",
        "session_id": session_id
    })
    
    # Get conversation history
    response = requests.get(f"{BASE_URL}/conversation/{session_id}")
    print(f"Conversation history: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health status: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

if __name__ == "__main__":
    print("🚀 Testing Gemini Chat API endpoints...")
    print("=" * 60)
    
    try:
        test_health()
        test_simple_chat()
        test_contextual_chat()
        test_conversation_history()
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running! Please start the server first.")
    except Exception as e:
        print(f"❌ Error: {e}")
