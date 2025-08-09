# 🤖 Gemini Chat API

Simple text-based chat with Google's Gemini AI model. No STT/TTS - just pure text conversation.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Open the test page:**
   Open `gemini_test.html` in your browser

3. **Or use the API directly** (see endpoints below)

## 📋 API Endpoints

### Base URL: `http://localhost:5000/api/gemini`

### 1. Simple Chat (No Context)
**POST** `/chat`

```json
{
  "message": "Hello! What can you help me with?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "Hello! I'm a banking assistant for Bank of Maharashtra...",
  "user_message": "Hello! What can you help me with?",
  "session_id": "session-id",
  "timestamp": "2025-08-09T12:00:00.000Z",
  "status": "success"
}
```

### 2. Contextual Chat (With Conversation History)
**POST** `/chat-context`

```json
{
  "message": "What documents do I need?",
  "session_id": "required-session-id"
}
```

**Response:**
```json
{
  "response": "Based on our previous conversation about opening a savings account...",
  "user_message": "What documents do I need?",
  "session_id": "session-id",
  "timestamp": "2025-08-09T12:00:00.000Z",
  "status": "success",
  "context_used": true
}
```

### 3. Get Conversation History
**GET** `/conversation/:session_id`

**Response:**
```json
{
  "session_id": "session-id",
  "conversation": [
    {
      "timestamp": "2025-08-09T12:00:00.000Z",
      "user_input": "Hello",
      "response": "Hello! How can I help you?"
    }
  ],
  "total_messages": 1
}
```

### 4. Clear Conversation History
**DELETE** `/conversation/:session_id`

**Response:**
```json
{
  "message": "Conversation cleared",
  "session_id": "session-id"
}
```

### 5. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Gemini Chat API",
  "timestamp": "2025-08-09T12:00:00.000Z",
  "endpoints": ["POST /api/gemini/chat", "..."]
}
```

## 🧪 Testing

### Using Python Test Script:
```bash
cd server
python test_gemini.py
```

### Using cURL:
```bash
# Simple chat
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "session_id": "test-session"}'

# Contextual chat
curl -X POST http://localhost:5000/api/gemini/chat-context \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about loans", "session_id": "test-session"}'
```

### Using the Web Interface:
1. Open `gemini_test.html` in your browser
2. Choose between "Simple Chat" and "Contextual Chat"
3. Start chatting!

## 🔧 Configuration

### Gemini API Key
Update the API key in `controller/gemini_chat.py`:
```python
self.GEMINI_API_KEY = "your-gemini-api-key-here"
```

### System Prompt
Customize the banking assistant behavior in `controller/gemini_chat.py`:
```python
system_prompt = """You are a helpful banking assistant for Bank of Maharashtra..."""
```

## 📁 File Structure

```
server/
├── controller/
│   ├── gemini_chat.py      # Main Gemini chat logic
│   └── py_bridge.py        # Python-Node.js bridge
├── routes/
│   └── gemini.js          # Express routes for Gemini
├── server.js              # Main server file
├── test_gemini.py         # Python test script
└── gemini_test.html       # Web interface for testing
```

## ✨ Features

- **Simple Chat**: Basic text conversation with Gemini
- **Contextual Chat**: Maintains conversation history for better responses
- **Session Management**: Separate conversations with unique session IDs
- **Banking Focus**: Pre-configured for Bank of Maharashtra queries
- **Error Handling**: Proper error responses and logging
- **Web Interface**: Ready-to-use HTML test page

## 🐛 Troubleshooting

1. **Server not starting**: Check if Python virtual environment is activated
2. **Gemini API errors**: Verify your API key is correct
3. **Connection errors**: Ensure server is running on port 5000
4. **Python bridge issues**: Check if all Python dependencies are installed

## 📝 Example Conversations

**Simple Banking Query:**
```
User: "How do I check my account balance?"
Gemini: "You can check your Bank of Maharashtra account balance in several ways..."
```

**Contextual Conversation:**
```
User: "I want to apply for a loan"
Gemini: "I'd be happy to help you with loan information. What type of loan are you interested in?"

User: "A personal loan"
Gemini: "Based on your interest in a personal loan, here are the requirements..."
```

That's it! You now have a simple Gemini text chat API ready to use. 🎉
