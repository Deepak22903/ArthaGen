# test_unicode.py
# Test script to verify Unicode handling

import sys
import json

# Ensure UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Test with Marathi text
test_message = "माझा बँक बॅलेन्स किती आहे"

print(f"Original message: {test_message}")
print(f"Message type: {type(test_message)}")

# Test encoding/decoding
try:
    # Clean the message like we do in the updated code
    message_clean = test_message.encode('utf-8', errors='ignore').decode('utf-8')
    print(f"Cleaned message: {message_clean}")
    
    # Test JSON serialization
    test_data = {
        "message": message_clean,
        "status": "test",
        "unicode_test": "✓ Success"
    }
    
    json_output = json.dumps(test_data, ensure_ascii=False, indent=2)
    print("JSON output:")
    print(json_output)
    
except Exception as e:
    print(f"Error: {e}")
