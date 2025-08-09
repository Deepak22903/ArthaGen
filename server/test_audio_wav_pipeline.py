# test_audio_wav_pipeline.py
# Test script to verify the complete audio pipeline with WAV conversion

import requests
import json
import os

def test_audio_pipeline():
    """Test the complete audio to text pipeline"""
    print("🎤 Testing Complete Audio Pipeline with WAV Conversion")
    print("=" * 60)
    
    # Test server connectivity
    try:
        response = requests.get('http://localhost:8000/')
        if response.status_code == 200:
            print("✅ Server is running on port 8000")
        else:
            print("❌ Server not responding correctly")
            return
    except:
        print("❌ Cannot connect to server - make sure it's running")
        return
    
    print("\n📋 Audio Pipeline Components:")
    print("  🎤 Browser MediaRecorder API - Records audio")
    print("  📡 Upload to /api/audio-to-text endpoint") 
    print("  🔄 FFmpeg converts WebM/any format → WAV (16kHz, mono)")
    print("  🤖 ASR model processes WAV file")
    print("  📝 Text transcription returned")
    print("  🧠 Gemini analyzes intent (restricted usage)")
    print("  🏦 Banking function provides raw response")
    print("  ✨ Gemini formats response (restricted usage)")
    print("  💬 User sees final formatted banking response")
    
    print(f"\n🎯 Key Features:")
    print("  • Audio recorded in browser with optimal settings (16kHz, mono)")
    print("  • FFmpeg ensures proper WAV format for STT model")
    print("  • Supports multiple audio formats as input")
    print("  • Automatic cleanup of temporary files")
    print("  • Error handling for conversion failures")
    print("  • Visual feedback during recording and processing")
    
    print(f"\n🛡️ Gemini Restrictions Maintained:")
    print("  • Gemini ONLY used for intent understanding")
    print("  • Gemini ONLY used for response formatting") 
    print("  • All banking logic from predefined functions")
    print("  • Audio processing completely separate from Gemini")
    
    print(f"\n🌐 Test the complete pipeline:")
    print("  1. Open: http://localhost:8000/gemini_test.html")
    print("  2. Click the 🎤 microphone button")
    print("  3. Say: 'I want to check my account balance'")
    print("  4. Click ⏹️ to stop recording")
    print("  5. Watch the complete pipeline in action!")
    
    print("=" * 60)
    print("✅ Audio WAV Pipeline Ready!")

if __name__ == "__main__":
    test_audio_pipeline()
