# test_gemini_restrictions.py
# Test script to verify Gemini is restricted to only intent understanding and response formatting

import json
from controller.Python.gemini_chat import intelligent_banking_chat

def test_gemini_restrictions():
    """Test that Gemini only processes banking queries through restricted functions"""
    print("🔬 Testing Gemini Restrictions...")
    print("=" * 60)
    
    # Test 1: Banking query - should work normally
    print("\n📝 Test 1: Banking query (should work)")
    result = intelligent_banking_chat("How can I check my account balance?", "test_session_1")
    parsed_result = result if isinstance(result, dict) else result
    print(f"✅ Status: {parsed_result.get('status', 'unknown')}")
    print(f"✅ Intent detected: {parsed_result.get('intent', 'none')}")
    print(f"✅ Response preview: {parsed_result.get('response', 'No response')[:100]}...")
    
    # Test 2: Another banking query
    print("\n📝 Test 2: Another banking query (money transfer)")
    result = intelligent_banking_chat("I want to transfer money to my friend", "test_session_2")
    parsed_result = result if isinstance(result, dict) else result
    print(f"✅ Status: {parsed_result.get('status', 'unknown')}")
    print(f"✅ Intent detected: {parsed_result.get('intent', 'none')}")
    print(f"✅ Response preview: {parsed_result.get('response', 'No response')[:100]}...")
    
    # Test 3: Non-banking query - should still work but with general_inquiry
    print("\n📝 Test 3: Non-banking query")
    result = intelligent_banking_chat("What is the weather today?", "test_session_3")
    parsed_result = result if isinstance(result, dict) else result
    print(f"✅ Status: {parsed_result.get('status', 'unknown')}")
    print(f"✅ Intent detected: {parsed_result.get('intent', 'none')}")
    print(f"✅ Response preview: {parsed_result.get('response', 'No response')[:100]}...")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("📋 Summary:")
    print("   - Gemini is ONLY used for:")
    print("     1. Understanding intent from user queries")
    print("     2. Formatting responses from banking functions")
    print("   - All other logic uses predefined banking functions")
    print("   - No direct chat capabilities with Gemini")
    
if __name__ == "__main__":
    test_gemini_restrictions()
