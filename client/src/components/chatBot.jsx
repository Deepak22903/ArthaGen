import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, User, Bot, Minimize2, Maximize2, Mic, MicOff } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Bank of Maharashtra intelligent assistant powered by ArthaGen AI. I can help you with banking services, account inquiries, and more. You can type your message or use the voice recording feature. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('mr');
  const messagesEndRef = useRef(null);

  // Language options for voice recognition
  const languages = [
    { code: 'as', name: 'Assamese' },
    { code: 'bn', name: 'Bengali' },
    { code: 'brx', name: 'Bodo' },
    { code: 'doi', name: 'Dogri' },
    { code: 'en', name: 'English' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kok', name: 'Konkani' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'mai', name: 'Maithili' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mni', name: 'Manipuri' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ne', name: 'Nepali' },
    { code: 'or', name: 'Odia' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sat', name: 'Santali' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ur', name: 'Urdu' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to clean and format the response text
  const cleanResponseText = (text) => {
    if (!text) return text;
    
    return text
      // Remove markdown bold formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Convert bullet points to proper format
      .replace(/\* /g, '• ')
      // Clean up method headers (e.g., "**SMS Method:**" becomes "SMS Method:")
      .replace(/\*\*([^*]+):\*\*/g, '\n$1:\n')
      // Clean up extra spaces and normalize line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      // Fix spacing around colons
      .replace(/:\s+/g, ': ')
      // Ensure proper spacing after bullet points
      .replace(/•\s*/g, '• ')
      // Clean up any remaining markdown artifacts
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    const messageText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Call Gemini API for banking assistance
      await sendMessageToGemini(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now(),
        text: cleanResponseText(`Sorry, I encountered an error: ${error.message}. Please try again.`),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsTyping(false);
    }
  };

  // New function to send message to Gemini API
  const sendMessageToGemini = async (messageText) => {
    try {
      const response = await fetch('http://localhost:8000/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: selectedLanguage,
          session_id: `chatbot_session_${Date.now()}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add intent recognition info if available
        if (result.intent) {
          const intentMessage = {
            id: Date.now() + 1,
            text: `🔍 Intent recognized: ${result.intent}`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString(),
            type: 'intent'
          };
          setMessages(prev => [...prev, intentMessage]);
        }

        // Add Gemini response
        const botResponse = {
          id: Date.now() + 2,
          text: cleanResponseText(result.response) || result.error || 'Sorry, I could not process your request.',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response from banking assistant');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorResponse = {
        id: Date.now() + 3,
        text: cleanResponseText(`Banking assistant error: ${error.message}. Please try again.`),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100, // High quality sample rate
          channelCount: 1,   // Mono
          volume: 1.0,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Use MediaRecorder for better audio quality
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    // Add user message indicating voice input
    const userMessage = {
      id: messages.length + 1,
      text: "🎤 Processing voice message...",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      type: 'voice'
    };

    try {
      setIsTyping(true);
      setMessages(prev => [...prev, userMessage]);

      // Create a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `voice_${timestamp}.webm`;

      // Create FormData to send to speech-to-text endpoint
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);
      formData.append('language_code', selectedLanguage); // Use selected language instead of hardcoded 'mr'

      // Send to existing audio-to-text route (with correct port)
      const response = await fetch('http://localhost:8000/api/audio-to-text', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check if transcription was successful
        if (result.transcription) {
          const transcribedText = result.transcription;
          
          // Update the user message to show transcribed text
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, text: `🎤 "${transcribedText}"` }
              : msg
          ));

          // Now send the transcribed text to Gemini for banking assistance
          try {
            await sendMessageToGemini(transcribedText);
          } catch (geminiError) {
            console.error('Error with Gemini after STT:', geminiError);
            const geminiErrorResponse = {
              id: Date.now(),
              text: cleanResponseText(`Voice message transcribed successfully, but banking assistant error: ${geminiError.message}`),
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, geminiErrorResponse]);
          }
          
        } else {
          throw new Error('No transcription received from server');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process audio');
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
      
      // Update user message to show error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, text: `🎤 Voice message failed` }
          : msg
      ));
      
      const errorResponse = {
        id: messages.length + 2,
        text: cleanResponseText(`Sorry, I couldn't process your voice message. Error: ${error.message}. Please try again or type your message.`),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Check Account Balance",
    "Transfer Money",
    "Loan Information",
    "Find Branch or ATM",
    "Link Aadhaar Card",
    "Mobile Banking Help"
  ];

  const handleQuickAction = async (action) => {
    const message = {
      id: messages.length + 1,
      text: action,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
    
    setIsTyping(true);
    try {
      await sendMessageToGemini(action);
    } catch (error) {
      console.error('Error with quick action:', error);
      const errorResponse = {
        id: Date.now(),
        text: cleanResponseText(`Sorry, I couldn't process "${action}". Error: ${error.message}`),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 flex flex-col ${
          isMaximized 
            ? 'inset-4 w-auto h-auto max-w-none max-h-none z-[60]' 
            : isMinimized 
              ? 'bottom-20 right-4 w-80 sm:w-96 h-16' 
              : 'bottom-20 right-4 w-80 sm:w-96 h-[32rem] sm:h-[36rem]'
        } max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700  p-3 sm:p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0 relative">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 justify-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 text-center">
                <h3 className="font-semibold text-xs sm:text-sm truncate">ArthaGen AI</h3>
                <p className="text-xs opacity-90 truncate">Bank of Maharashtra Assistant</p>
              </div>
            </div>
            <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (isMaximized) {
                    setIsMaximized(false);
                    setIsMinimized(false);
                  } else {
                    setIsMaximized(true);
                    setIsMinimized(false);
                  }
                }}
                className=" hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
              <button
                onClick={() => {
                  if (isMinimized) {
                    setIsMinimized(false);
                  } else {
                    setIsMinimized(true);
                    setIsMaximized(false);
                  }
                }}
                className=" hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                title={isMinimized ? "Restore" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className=" hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600  rounded-br-none'
                          : message.sender === 'system'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg border border-green-200'
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      }`}>
                        <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          message.sender === 'bot' ? 'space-y-1' : ''
                        }`}>
                          {message.text.split('\n').map((line, index) => (
                            <div key={index} className={line.startsWith('• ') ? 'ml-2' : ''}>
                              {line}
                            </div>
                          ))}
                        </div>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : message.sender === 'system' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 px-3 py-2 rounded-lg rounded-bl-none border border-gray-200 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-3 sm:px-4 pb-2 bg-white flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action)}
                          className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input - Fixed at bottom */}
              <div className="p-3 sm:p-4 border-t border-gray-100 bg-white rounded-b-2xl flex-shrink-0">
                {/* Language Selection */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Voice Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={isTyping || isRecording}
                  />
                  
                  {/* Voice Record Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTyping}
                    className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600  animate-pulse' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 '
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? "Stop recording" : "Start voice recording"}
                  >
                    {isRecording ? (
                      <MicOff className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping || isRecording}
                    className="bg-gradient-to-r from-blue-500 to-purple-600  p-2 rounded-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button - Always in bottom-right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[70] bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700  p-3 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 group"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="absolute -top-1 -right-1 bg-red-500  text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
              1
            </div>
          </div>
        )}
        {/* Hover tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800  px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {isOpen ? 'Close Chat' : 'Open ArthaGen Banking Assistant'}
        </div>
      </button>
    </>
  );
};

export default ChatbotWidget;