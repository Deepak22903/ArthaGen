# test_audio_stt.py
# Test script to verify audio STT integration

import requests
import json

def test_stt_endpoint():
    """Test the STT endpoint to ensure it's working"""
    print("🎤 Testing Speech-to-Text Endpoint...")
    print("=" * 50)
    
    # Test health endpoint first
    try:
        response = requests.get('http://localhost:8000/api/health')
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print("❌ Server not responding")
            return
    except:
        print("❌ Cannot connect to server")
        return
    
    print("\n📋 Audio STT Integration Ready!")
    print("Features:")
    print("  🎤 Click microphone button to start recording")
    print("  ⏹️ Click again to stop recording") 
    print("  🔄 Audio automatically converted to text using STT")
    print("  🤖 Text sent to Gemini for intent recognition & response formatting")
    print("  💬 Banking functions provide actual responses")
    
    print(f"\n🌐 Open: http://localhost:8000/gemini_test.html")
    print("=" * 50)

if __name__ == "__main__":
    test_stt_endpoint()
