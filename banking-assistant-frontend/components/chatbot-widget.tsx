"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, X, Bot, Minimize2, Maximize2, Mic, MicOff, Phone, Shield, CheckCircle, ThumbsUp, ThumbsDown, Star, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, ChevronDown, ChevronUp } from "lucide-react"

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Bank of Maharashtra's intelligent banking assistant. I can help you with account inquiries, transactions, loan information, and general banking services. How may I assist you today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("mr")
  
  // Authentication and session state
  const [conversationState, setConversationState] = useState<string>('phone_request')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Guest User')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  
  // Feedback-related state
  const [showSessionFeedback, setShowSessionFeedback] = useState(false)
  const [sessionRating, setSessionRating] = useState<number>(0)
  const [sessionFeedbackText, setSessionFeedbackText] = useState<string>("")
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const [isQuickServicesExpanded, setIsQuickServicesExpanded] = useState(false)
  
  // Audio management state
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map())
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [audioProgress, setAudioProgress] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Language options for voice recognition
  const languages = [
    { code: "as", name: "Assamese" },
    { code: "bn", name: "Bengali" },
    { code: "brx", name: "Bodo" },
    { code: "doi", name: "Dogri" },
    { code: "en", name: "English" },
    { code: "gu", name: "Gujarati" },
    { code: "hi", name: "Hindi" },
    { code: "kn", name: "Kannada" },
    { code: "kok", name: "Konkani" },
    { code: "ks", name: "Kashmiri" },
    { code: "mai", name: "Maithili" },
    { code: "ml", name: "Malayalam" },
    { code: "mni", name: "Manipuri" },
    { code: "mr", name: "Marathi" },
    { code: "ne", name: "Nepali" },
    { code: "or", name: "Odia" },
    { code: "pa", name: "Punjabi" },
    { code: "sa", name: "Sanskrit" },
    { code: "sat", name: "Santali" },
    { code: "sd", name: "Sindhi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "ur", name: "Urdu" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Function to clean and format the response text
  const cleanResponseText = (text: string) => {
    if (!text) return text

    return (
      text
        // Remove markdown bold formatting
        .replace(/\*\*(.*?)\*\*/g, "$1")
        // Convert bullet points to proper format
        .replace(/\* /g, "• ")
        // Clean up method headers (e.g., "**SMS Method:**" becomes "SMS Method:")
        .replace(/\*\*([^*]+):\*\*/g, "\n$1:\n")
        // Clean up extra spaces and normalize line breaks
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .replace(/^\s+|\s+$/g, "")
        // Fix spacing around colons
        .replace(/:\s+/g, ": ")
        // Ensure proper spacing after bullet points
        .replace(/•\s*/g, "• ")
        // Clean up any remaining markdown artifacts
        .replace(/\*([^*]+)\*/g, "$1")
        .trim()
    )
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize welcome message when opened
  useEffect(() => {
    if (isOpen && !isAuthenticated && conversationState === 'phone_request') {
      // Add welcome message for phone request
      const welcomeMessage = {
        id: Date.now(),
        text: "Welcome to Bank of Maharashtra! To get started with personalized banking services, please provide your registered mobile number.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages(prev => [...prev, welcomeMessage])
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, newMessage])
    const messageText = inputText
    setInputText("")
    setIsTyping(true)

    try {
      if (conversationState === 'phone_request') {
        await handlePhoneNumberInput(messageText)
      } else if (conversationState === 'otp_verification') {
        await handleOtpInput(messageText)
      } else if (isAuthenticated) {
        await handleAuthenticatedChat(messageText)
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      const errorResponse = {
        id: Date.now(),
        text: "I apologize for the technical difficulty. Please try again or contact customer support.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
      setIsTyping(false)
    }
  }

  // Handle phone number input
  const handlePhoneNumberInput = async (messageText: string) => {
    // Extract phone number from message
    const phoneRegex = /(\+91[-\s]?)?[6-9]\d{9}/;
    const phoneMatch = messageText.match(phoneRegex);
    
    if (!phoneMatch) {
      const errorResponse = {
        id: Date.now(),
        text: "Please provide a valid Indian mobile number (10 digits starting with 6-9).",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
      setIsTyping(false)
      return
    }

    const mobileNo = phoneMatch[0].replace(/[-\s]/g, '').replace('+91', '')
    setPhoneNumber(mobileNo)

    try {
      const response = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Guest User",
          mobileNo: mobileNo
        }),
      })

      if (response.ok) {
        setConversationState('otp_verification')
        const botResponse = {
          id: Date.now(),
          text: `OTP sent to ${mobileNo}. Please enter the 6-digit code to verify your identity.`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, botResponse])
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send OTP")
      }
    } catch (error: any) {
      const errorResponse = {
        id: Date.now(),
        text: error.message || "Failed to send OTP. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle OTP input
  const handleOtpInput = async (messageText: string) => {
    const otpRegex = /\b\d{6}\b/;
    const otpMatch = messageText.match(otpRegex);

    if (!otpMatch) {
      const errorResponse = {
        id: Date.now(),
        text: "Please enter a valid 6-digit OTP.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
      setIsTyping(false)
      return
    }

    const otp = otpMatch[0]

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNo: phoneNumber,
          otp: otp,
          language: selectedLanguage
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update authentication state
        setIsAuthenticated(true)
        setUserId(result.userId)
        setSessionId(result.sessionId)
        setConversationState('authenticated')

        const botResponse = {
          id: Date.now(),
          text: `Welcome! You are now authenticated. I can help you with banking services, account inquiries, transactions, and more. What would you like to know?`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, botResponse])

        // Show success indicator
        setTimeout(() => {
          const authSuccessMessage = {
            id: Date.now() + 1,
            text: "✅ Authentication successful! You can now ask me anything about banking services.",
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            type: "success"
          }
          setMessages((prev) => [...prev, authSuccessMessage])
        }, 500)

      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Invalid OTP")
      }
    } catch (error: any) {
      const errorResponse = {
        id: Date.now(),
        text: error.message || "Invalid or expired OTP. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Function to save unanswered question
  const saveUnansweredQuestion = async (question: string, mobileNo?: string) => {
    try {
      console.log("Frontend: Saving unanswered question:", question)
      
      const response = await fetch("http://localhost:8000/api/admin/unanswered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNo: mobileNo || phoneNumber || "unknown",
          question: question,
          notifyUser: true,
          sessionId: sessionId
        }),
      })

      if (response.status === 201) {
        console.log("Frontend: Successfully saved unanswered question")
        return { success: true }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Frontend: Failed to save unanswered question:", errorData)
        return { success: false, error: errorData }
      }
    } catch (error) {
      console.error("Frontend: Error saving unanswered question:", error)
      return { success: false, error }
    }
  }

  // Handle authenticated chat using existing session
  const handleAuthenticatedChat = async (messageText: string) => {
    try {
      // Call chat API for banking response
      const geminiResponse = await fetch("http://localhost:8000/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
          language: selectedLanguage,
        }),
      })

      if (geminiResponse.ok) {
        const geminiResult = await geminiResponse.json()
        
        // Check if intent is general_inquiry and save as unanswered question
        if (geminiResult.intent === "general_inquiry") {
          console.log("Frontend: Detected general_inquiry intent, saving as unanswered question")
          
          const saveResult = await saveUnansweredQuestion(messageText, phoneNumber)
          
          if (saveResult.success) {
            // Show a message indicating the question has been saved for expert review
            const botResponse = {
              id: Date.now(),
              text: "Thank you for your question. Since this requires detailed information, I've forwarded it to our expert team for a comprehensive answer. You'll receive a response soon, or you can contact our customer care at 1800-233-4526 for immediate assistance.",
              sender: "bot",
              timestamp: new Date().toLocaleTimeString(),
            }
            setMessages((prev) => [...prev, botResponse])
          } else {
            // Fallback message if saving fails
            const botResponse = {
              id: Date.now(),
              text: "Thank you for your question. For detailed information about this topic, please contact our customer care at 1800-233-4526 where our experts can assist you better.",
              sender: "bot",
              timestamp: new Date().toLocaleTimeString(),
            }
            setMessages((prev) => [...prev, botResponse])
          }
        } else {
          // Normal banking response
          const botResponse = {
            id: Date.now(),
            text: cleanResponseText(geminiResult.response || geminiResult.error || "I couldn't process your request at this time."),
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
          }
          setMessages((prev) => [...prev, botResponse])
        }
        
        // Add message to session regardless of intent
        if (sessionId) {
          await fetch("http://localhost:8000/api/session/message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              question: messageText,
              answer: geminiResult.response || "Question saved for expert review."
            }),
          })
        }

      } else {
        throw new Error("Banking service temporarily unavailable")
      }
    } catch (error: any) {
      const errorResponse = {
        id: Date.now(),
        text: "I'm having trouble processing your request. Please try again later.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Updated function to send message to integrated chatbot API
  const sendMessageToChatbot = async (messageText: string) => {
    // This function is deprecated - now using direct auth routes
    console.warn("sendMessageToChatbot is deprecated")
  }

  // Function to send message to chat API
  const sendMessageToGemini = async (messageText: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          language: selectedLanguage,
          session_id: `chatbot_session_${Date.now()}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Check if intent is general_inquiry and save as unanswered question
        if (result.intent === "general_inquiry") {
          console.log("Frontend: Detected general_inquiry intent in non-auth chat, saving as unanswered question")
          
          const saveResult = await saveUnansweredQuestion(messageText, "guest_user")
          
          if (saveResult.success) {
            // Show a message indicating the question has been saved for expert review
            const botResponse = {
              id: Date.now() + 2,
              text: "Thank you for your question. Since this requires detailed information, I've forwarded it to our expert team for a comprehensive answer. You can also contact our customer care at 1800-233-4526 for immediate assistance.",
              sender: "bot",
              timestamp: new Date().toLocaleTimeString(),
            }
            setMessages((prev) => [...prev, botResponse])
          } else {
            // Fallback message if saving fails
            const botResponse = {
              id: Date.now() + 2,
              text: "Thank you for your question. For detailed information about this topic, please contact our customer care at 1800-233-4526 where our experts can assist you better.",
              sender: "bot",
              timestamp: new Date().toLocaleTimeString(),
            }
            setMessages((prev) => [...prev, botResponse])
          }
        } else {
          // Add intent recognition info if available
          if (result.intent) {
            const intentMessage = {
              id: Date.now() + 1,
              text: `Intent: ${result.intent}`,
              sender: "system",
              timestamp: new Date().toLocaleTimeString(),
              type: "intent",
            }
            setMessages((prev) => [...prev, intentMessage])
          }

          // Add normal chat API response
          const botResponse = {
            id: Date.now() + 2,
            text:
              cleanResponseText(result.response) ||
              result.error ||
              "I apologize, but I couldn't process your request at this time.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
          }
          setMessages((prev) => [...prev, botResponse])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Service temporarily unavailable")
      }
    } catch (error: any) {
      console.error("Chat API error:", error)
      const errorResponse = {
        id: Date.now() + 3,
        text: cleanResponseText(`Service temporarily unavailable. Please try again later.`),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
      setIsTyping(false)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      const audioChunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        sendAudioToBackend(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Microphone access required for voice input.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const userMessage = {
      id: messages.length + 1,
      text: "🎤 Processing voice input...",
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      type: "voice",
    }

    try {
      setIsTyping(true)
      setMessages((prev) => [...prev, userMessage])

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `voice_${timestamp}.webm`

      const formData = new FormData()
      formData.append("audio", audioBlob, filename)
      formData.append("language_code", selectedLanguage)

      const response = await fetch("http://localhost:8000/api/audio-to-text", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        if (result.transcription) {
          const transcribedText = result.transcription

          setMessages((prev) =>
            prev.map((msg) => (msg.id === userMessage.id ? { ...msg, text: `🎤 "${transcribedText}"` } : msg)),
          )

          try {
            if (isAuthenticated) {
              await handleAuthenticatedChat(transcribedText)
            } else {
              await sendMessageToGemini(transcribedText)
            }
          } catch (chatError: any) {
            console.error("Error with chat API after STT:", chatError)
            const chatErrorResponse = {
              id: Date.now(),
              text: cleanResponseText(`Voice input processed, but service temporarily unavailable.`),
              sender: "bot",
              timestamp: new Date().toLocaleTimeString(),
            }
            setMessages((prev) => [...prev, chatErrorResponse])
          }
        } else {
          throw new Error("Voice processing failed")
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Voice processing unavailable")
      }
    } catch (error: any) {
      console.error("Error processing voice message:", error)

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, text: `🎤 Voice processing failed` } : msg)),
      )

      const errorResponse = {
        id: messages.length + 2,
        text: cleanResponseText(`Voice processing unavailable. Please type your message.`),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const quickActions = [
    "Check Account Balance",
    "Transfer Funds",
    "Loan Information",
    "Find Branch",
    "Link Aadhaar",
    "Customer Support",
  ]

  const handleQuickAction = async (action: string) => {
    // Auto-collapse the quick services dropdown after selection
    setIsQuickServicesExpanded(false)
    
    const message = {
      id: messages.length + 1,
      text: action,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, message])

    setIsTyping(true)
    
    if (isAuthenticated) {
      await handleAuthenticatedChat(action)
    } else {
      // Show auth required message
      const errorResponse = {
        id: Date.now(),
        text: "Please authenticate first by providing your mobile number and OTP to access banking services.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorResponse])
      setIsTyping(false)
    }
  }

  // Detect language from text content
  const detectLanguage = (text: string) => {
    // Devanagari script (Hindi, Marathi)
    const devanagariPattern = /[\u0900-\u097F]/;
    
    if (devanagariPattern.test(text)) {
      // Check for specific Marathi words to distinguish from Hindi
      const marathiWords = ['तुमच्या', 'आहे', 'आहेत', 'तुम्हाला', 'मध्ये', 'करा', 'पाठवा', 'द्वारे', 'कळेल', 'दिसेल', 'नंबर', 'ॲप'];
      const marathiCount = marathiWords.filter(word => text.includes(word)).length;
      
      if (marathiCount > 0) {
        return 'mr'; // Marathi
      } else {
        return 'hi'; // Hindi (default for Devanagari)
      }
    }
    
    // Default to English for non-Devanagari text
    return 'en';
  }

  // Handle text-to-speech with caching and controls
  const handleTextToSpeech = async (messageId: number, text: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
        setCurrentAudio(null)
      }

      setPlayingAudio(messageId)
      
      // Detect language from the text
      const detectedLanguage = detectLanguage(text)
      console.log(`Detected language: ${detectedLanguage} for text: "${text.substring(0, 50)}..."`)
      
      // Create cache key
      const cacheKey = `${detectedLanguage}_${text.substring(0, 100)}_${text.length}`
      
      // Check if audio is already cached
      if (audioCache.has(cacheKey)) {
        console.log("Using cached audio")
        const cachedUrl = audioCache.get(cacheKey)!
        await playAudioFromUrl(messageId, cachedUrl)
        return
      }
      
      // Try server-side TTS - get audio file directly
      try {
        const response = await fetch("http://localhost:8000/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            language: detectedLanguage
          }),
        })

        if (response.ok) {
          // Check if response is audio
          const contentType = response.headers.get('content-type');
          console.log(`Server response content-type: ${contentType}`);
          
          if (contentType && contentType.includes('audio')) {
            console.log("Received audio file from server");
            
            // Convert response to blob
            const audioBlob = await response.blob()
            console.log(`Audio blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            
            // Create object URL for the blob
            const audioUrl = URL.createObjectURL(audioBlob)
            console.log(`Created audio URL: ${audioUrl}`);
            
            // Cache the audio URL
            setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl))
            
            await playAudioFromUrl(messageId, audioUrl)
            return
          } else {
            // Try to parse as JSON for error response
            console.log("Server didn't return audio, trying to parse as JSON...");
            try {
              const result = await response.json()
              console.error("Server TTS JSON response:", result)
            } catch (jsonError) {
              console.error("Server TTS response is not JSON either:", jsonError)
              const textResponse = await response.text()
              console.error("Server TTS text response:", textResponse)
            }
          }
        } else {
          console.error("Server TTS request failed:", response.status, response.statusText)
        }
      } catch (serverError) {
        console.error("Server TTS failed:", serverError)
      }
      
      // Fallback to browser TTS
      handleBrowserTTS(messageId, text, detectedLanguage)
      
    } catch (error) {
      console.error("TTS error:", error)
      setPlayingAudio(null)
      alert("Failed to convert text to speech. Please check your connection.")
    }
  }

  // Play audio from URL with controls
  const playAudioFromUrl = async (messageId: number, audioUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        console.log("Server audio playback completed")
        setPlayingAudio(null)
        setCurrentAudio(null)
        setAudioProgress(0)
        setAudioDuration(0)
        resolve()
      }
      
      audio.onerror = (error) => {
        console.error("Error playing server audio:", error)
        setPlayingAudio(null)
        setCurrentAudio(null)
        setAudioProgress(0)
        setAudioDuration(0)
        reject(error)
      }
      
      audio.onloadstart = () => {
        console.log("Server audio loading started...")
      }
      
      audio.oncanplay = () => {
        console.log("Server audio can start playing")
      }
      
      audio.onloadeddata = () => {
        console.log("Server audio data loaded")
      }
      
      audio.onloadedmetadata = () => {
        console.log(`Audio metadata loaded - duration: ${audio.duration}s`)
        setAudioDuration(audio.duration)
      }
      
      audio.ontimeupdate = () => {
        setAudioProgress(audio.currentTime)
      }
      
      // Set volume to maximum
      audio.volume = 1.0
      
      setCurrentAudio(audio)
      
      audio.play().then(() => {
        console.log("Server audio playing successfully")
      }).catch((playError) => {
        console.error("Server audio play error:", playError)
        setPlayingAudio(null)
        setCurrentAudio(null)
        reject(playError)
      })
    })
  }

  // Audio control functions
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingAudio(null)
      setAudioProgress(0)
      setAudioDuration(0)
    }
    
    // Also cancel browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const pauseResumeAudio = () => {
    if (currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play()
      } else {
        currentAudio.pause()
      }
    }
  }

  const seekAudio = (seconds: number) => {
    if (currentAudio) {
      const newTime = Math.max(0, Math.min(currentAudio.duration, currentAudio.currentTime + seconds))
      currentAudio.currentTime = newTime
    }
  }

  const setAudioTime = (time: number) => {
    if (currentAudio) {
      currentAudio.currentTime = Math.max(0, Math.min(currentAudio.duration, time))
    }
  }

  // Browser-based TTS fallback
  const handleBrowserTTS = (messageId: number, text: string, languageCode: string = 'en') => {
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech and stop current audio
        window.speechSynthesis.cancel()
        stopAudio()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        // Map language codes to browser speech synthesis language codes
        const browserLangMap: { [key: string]: string } = {
          'mr': 'mr-IN',  // Marathi (India)
          'hi': 'hi-IN',  // Hindi (India)
          'en': 'en-US',  // English (US)
        }
        
        utterance.lang = browserLangMap[languageCode] || 'en-US'
        console.log(`Using browser TTS with language: ${utterance.lang}`)
        
        utterance.onend = () => {
          setPlayingAudio(null)
        }
        
        utterance.onerror = (error) => {
          console.error("Browser TTS error:", error)
          setPlayingAudio(null)
          alert("Text-to-speech failed. Please try again.")
        }
        
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Browser TTS failed:", error)
        setPlayingAudio(null)
        alert("Text-to-speech is not supported in your browser.")
      }
    } else {
      setPlayingAudio(null)
      alert("Text-to-speech is not supported in your browser.")
    }
  }

  // Handle feedback submission
  const handleFeedback = async (messageId: number, feedback: number, feedbackOptions: any) => {
    try {
      console.log("Submitting feedback:", { messageId, feedback, feedbackOptions });

      const requestBody = {
        sessionId: feedbackOptions.sessionId,
        feedback: feedback
      };

      const response = await fetch("http://localhost:8000/api/session/msg-feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const responseData = await response.json();
        console.log("Feedback submitted successfully:", responseData);
        // Update message to show feedback was submitted
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, feedbackSubmitted: true, userFeedback: feedback }
            : msg
        ))
      } else {
        const errorData = await response.json()
        console.error("Feedback submission failed:", errorData)
        alert("Failed to submit feedback. Please try again.")
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      alert("Failed to submit feedback. Please check your connection.")
    }
  }

  // End conversation when closing chatbot
  const handleCloseChat = async () => {
    // Show session feedback dialog if authenticated
    if (isAuthenticated && sessionId) {
      setShowSessionFeedback(true)
      return
    }
    
    // Close immediately if not authenticated
    closeChat()
  }

  // Close chat and cleanup
  const closeChat = async () => {
    if (isAuthenticated && sessionId) {
      try {
        // End the session
        const sessionResponse = await fetch(`http://localhost:8000/api/session/${sessionId}`, {
          method: "GET"
        })
        
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          // Update session with endedAt timestamp could be done via a PATCH route
          // For now, we'll just clear the local state
        }
      } catch (error) {
        console.error("Failed to end session:", error)
      }
    }
    
    // Reset state
    setIsOpen(false)
    setShowSessionFeedback(false)
    setSessionRating(0)
    setSessionFeedbackText("")
    
    // Stop and clean up audio
    stopAudio()
    
    // Clean up audio cache
    audioCache.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    setAudioCache(new Map())
    
    setConversationState('phone_request')
    setIsAuthenticated(false)
    setUserId(null)
    setSessionId(null)
    setUserName('Guest User')
    setPhoneNumber('')
    setMessages([{
      id: 1,
      text: "Welcome to Bank of Maharashtra's intelligent banking assistant. I can help you with account inquiries, transactions, loan information, and general banking services. How may I assist you today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    }])
  }

  return (
    <>
      {/* Professional Animated Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-300/50 transition-all duration-500 flex flex-col ${
            isMaximized
              ? "inset-4 w-auto h-auto max-w-none max-h-none z-[60] animate-scale-in"
              : isMinimized
                ? "bottom-20 right-4 w-80 sm:w-96 h-16 animate-slide-up"
                : "bottom-20 right-4 w-80 sm:w-96 h-[32rem] sm:h-[36rem] animate-slide-up"
          } max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]`}
        >
          {/* Professional Animated Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-3 sm:p-4 rounded-t-xl flex items-center justify-between flex-shrink-0 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 animate-pulse" />

            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 justify-center relative z-10">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 animate-bounce-subtle">
                {isAuthenticated ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                ) : conversationState === 'otp_verification' ? (
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                ) : conversationState === 'phone_request' ? (
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                ) : (
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                )}
              </div>
              <div className="min-w-0 text-center">
                <h3 className="font-medium text-xs sm:text-sm truncate">
                  {isAuthenticated ? `Banking Assistant - ${userName}` : 
                   conversationState === 'otp_verification' ? 'OTP Verification' :
                   conversationState === 'phone_request' ? 'Phone Verification' : 
                   'Banking Assistant'}
                </h3>
                <p className="text-xs opacity-90 truncate">
                  {isAuthenticated ? 'Authenticated Session' : 'Bank of Maharashtra'}
                </p>
              </div>
            </div>
            <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 relative z-10">
              <button
                onClick={() => {
                  if (isMaximized) {
                    setIsMaximized(false)
                    setIsMinimized(false)
                  } else {
                    setIsMaximized(true)
                    setIsMinimized(false)
                  }
                }}
                className="text-white hover:bg-slate-700/50 p-1 rounded transition-all duration-300 hover:scale-110"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  if (isMinimized) {
                    setIsMinimized(false)
                  } else {
                    setIsMinimized(true)
                    setIsMaximized(false)
                  }
                }}
                className="text-white hover:bg-slate-700/50 p-1 rounded transition-all duration-300 hover:scale-110"
                title={isMinimized ? "Restore" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
              <button
                onClick={handleCloseChat}
                className="text-white hover:bg-red-500/50 p-1 rounded transition-all duration-300 hover:scale-110"
                title="Close"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container with animations */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-br from-slate-50/50 to-blue-50/30 backdrop-blur-sm">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up opacity-0`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "forwards",
                        animationDuration: "0.5s",
                      }}
                    >
                      <div className={`max-w-[75%] ${message.sender === "bot" ? "space-y-2" : ""}`}>
                        <div
                          className={`px-3 py-2 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none hover:from-blue-700 hover:to-blue-800 transform hover:scale-105"
                              : (message as any).sender === "system"
                                ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs hover:from-slate-200 hover:to-slate-300"
                                : "bg-white/80 backdrop-blur-sm text-slate-800 rounded-bl-none border border-slate-200/50 hover:bg-white/90 hover:shadow-lg"
                          }`}
                        >
                          <div
                            className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                              message.sender === "bot" ? "space-y-1" : ""
                            }`}
                          >
                            {message.text.split("\n").map((line, index) => (
                              <div key={index} className={line.startsWith("• ") ? "ml-2" : ""}>
                                {line}
                              </div>
                            ))}
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === "user"
                                ? "text-blue-100"
                                : (message as any).sender === "system"
                                  ? "text-slate-500"
                                  : "text-slate-500"
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                        
                        {/* Feedback and TTS buttons for bot messages */}
                        {message.sender === "bot" && index > 0 && (
                          <div className="flex items-center space-x-2 ml-2">
                            {/* Audio Controls */}
                            <div className="flex items-center space-x-1">
                              {playingAudio === message.id && currentAudio ? (
                                <>
                                  {/* Play/Pause Button */}
                                  <button
                                    onClick={pauseResumeAudio}
                                    className="p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                    title={currentAudio.paused ? "Resume" : "Pause"}
                                  >
                                    {currentAudio.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                  </button>
                                  
                                  {/* Backward Button */}
                                  <button
                                    onClick={() => seekAudio(-10)}
                                    className="p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                    title="Rewind 10s"
                                  >
                                    <SkipBack className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Forward Button */}
                                  <button
                                    onClick={() => seekAudio(10)}
                                    className="p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                    title="Forward 10s"
                                  >
                                    <SkipForward className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Stop Button */}
                                  <button
                                    onClick={stopAudio}
                                    className="p-1 rounded-full text-red-600 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                    title="Stop"
                                  >
                                    <VolumeX className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Progress Display */}
                                  <div className="text-xs text-slate-500 min-w-[60px]">
                                    {Math.floor(audioProgress)}s / {Math.floor(audioDuration)}s
                                  </div>
                                </>
                              ) : (
                                /* TTS Button - When not playing */
                                <button
                                  onClick={() => handleTextToSpeech(message.id, message.text)}
                                  disabled={playingAudio !== null && playingAudio !== message.id}
                                  className={`p-1 rounded-full transition-colors duration-200 ${
                                    playingAudio !== null && playingAudio !== message.id
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-blue-600 hover:bg-blue-100'
                                  }`}
                                  title="Listen to response"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Audio Progress Bar - Only visible when playing */}
                            {playingAudio === message.id && currentAudio && audioDuration > 0 && (
                              <div className="flex items-center space-x-2 ml-2">
                                <div 
                                  className="w-20 h-1 bg-slate-200 rounded-full cursor-pointer"
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const x = e.clientX - rect.left
                                    const percentage = x / rect.width
                                    const newTime = percentage * audioDuration
                                    setAudioTime(newTime)
                                  }}
                                >
                                  <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Feedback buttons - Only for authenticated users */}
                            {isAuthenticated && sessionId && (
                              <>
                                {!(message as any).feedbackSubmitted ? (
                                  <>
                                    <span className="text-xs text-slate-500">Was this helpful?</span>
                                    <button
                                      onClick={() => {
                                        handleFeedback(message.id, 1, { sessionId })
                                      }}
                                      className="p-1 rounded-full hover:bg-green-100 text-slate-400 hover:text-green-600 transition-colors duration-200"
                                      title="Thumbs up"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleFeedback(message.id, -1, { sessionId })
                                      }}
                                      className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors duration-200"
                                      title="Thumbs down"
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-slate-500">Thank you for your feedback!</span>
                                    {(message as any).userFeedback === 1 ? (
                                      <ThumbsUp className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <ThumbsDown className="w-3 h-3 text-red-600" />
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-white/80 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-xl rounded-bl-none border border-slate-200/50 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Animated Quick Actions */}
                {!isAuthenticated && conversationState === 'phone_request' && messages.length <= 2 && (
                  <div className="px-3 sm:px-4 pb-2 bg-white/80 backdrop-blur-sm flex-shrink-0 border-t border-slate-200/50 animate-fade-in-up">
                    <p className="text-xs text-slate-600 mb-2 font-medium">🔐 Authentication Required:</p>
                    <div className="text-xs text-slate-500 mb-2">
                      Please enter your registered mobile number to get started with banking services.
                    </div>
                  </div>
                )}
                
                {isAuthenticated && (
                  <div className="px-3 sm:px-4 pb-2 bg-white/80 backdrop-blur-sm flex-shrink-0 border-t border-slate-200/50 animate-fade-in-up">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-slate-50/50 rounded-lg p-2 -m-1 transition-all duration-200 group"
                      onClick={() => setIsQuickServicesExpanded(!isQuickServicesExpanded)}
                    >
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-slate-600 font-medium">Quick Banking Services</p>
                        {!isQuickServicesExpanded && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600 border border-blue-200">
                            {quickActions.length} services
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                          {isQuickServicesExpanded ? 'Hide' : 'Show'}
                        </span>
                        {isQuickServicesExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200" />
                        )}
                      </div>
                    </div>
                    
                    {/* Collapsible Quick Actions */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isQuickServicesExpanded 
                        ? 'max-h-96 opacity-100 mt-2' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <div className="flex flex-wrap gap-1 sm:gap-2 pt-1">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAction(action);
                            }}
                            className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-2 sm:px-3 py-1 rounded-lg hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-300 border border-slate-200 hover:border-blue-300 transform hover:scale-105 hover:shadow-md animate-fade-in-up opacity-0"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: "forwards",
                            }}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Animated Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm rounded-b-xl flex-shrink-0">
                {/* Language Selection */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
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
                    placeholder={
                      conversationState === 'phone_request' ? "Enter your mobile number..." :
                      conversationState === 'otp_verification' ? "Enter 6-digit OTP..." :
                      "Type your banking query..."
                    }
                    className={`flex-1 border rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white focus:bg-white hover:shadow-md focus:shadow-lg ${
                      conversationState === 'phone_request' ? 'border-orange-300 focus:ring-orange-500' :
                      conversationState === 'otp_verification' ? 'border-blue-300 focus:ring-blue-500' :
                      'border-slate-300 focus:ring-blue-500'
                    }`}
                    disabled={isTyping || isRecording}
                  />

                  {/* Animated Voice Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTyping}
                    className={`p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-lg flex-shrink-0 transform hover:scale-110 ${
                      isRecording
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? "Stop recording" : "Voice input"}
                  >
                    {isRecording ? (
                      <MicOff className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce" />
                    ) : (
                      <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping || isRecording}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-lg flex-shrink-0 transform hover:scale-110 group"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Professional Animated Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[70] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group transform hover:scale-110 animate-bounce-subtle"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
              •
            </div>
          </div>
        )}
        {/* Professional animated tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-slate-700/50 group-hover:translate-x-1">
          {isOpen ? "Close Assistant" : "Banking Assistant"}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-slate-800/90"></div>
        </div>
      </button>

      {/* Session Feedback Modal */}
      {showSessionFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">How was your experience?</h3>
              <p className="text-sm text-slate-600">Please rate your overall banking assistant experience</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSessionRating(rating)}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    sessionRating >= rating 
                      ? 'text-yellow-500 bg-yellow-50' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  <Star 
                    className={`w-6 h-6 ${sessionRating >= rating ? 'fill-current' : ''}`} 
                  />
                </button>
              ))}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={sessionFeedbackText}
                onChange={(e) => setSessionFeedbackText(e.target.value)}
                placeholder="Share your thoughts about the service..."
                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-slate-400 text-right mt-1">
                {sessionFeedbackText.length}/500
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSessionFeedback(false)
                  setSessionRating(0)
                  setSessionFeedbackText("")
                }}
                className="flex-1 py-2 px-4 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Skip
              </button>
              <button
                onClick={async () => {
                  // Submit session feedback
                  if (sessionId && sessionRating > 0) {
                    try {
                      console.log("Submitting session feedback:", { sessionId, sessionRating, sessionFeedbackText });
                      const response = await fetch("http://localhost:8000/api/session/session-feedback", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          sessionId: sessionId,
                          sessionFeedbackRating: sessionRating,
                          sessionFeedbackText: sessionFeedbackText.trim()
                        }),
                      })
                      
                      if (response.ok) {
                        const responseData = await response.json();
                        console.log("Session feedback submitted successfully:", responseData);
                      } else {
                        const errorData = await response.json()
                        console.error("Session feedback submission failed:", errorData)
                        alert("Failed to submit feedback. Please try again.")
                      }
                    } catch (error) {
                      console.error("Failed to submit session feedback:", error)
                      alert("Failed to submit feedback. Please check your connection.")
                    }
                  }
                  closeChat()
                }}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                disabled={sessionRating === 0}
              >
                Submit & Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(100px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

export default ChatbotWidget
