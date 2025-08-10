"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Clock, User, ThumbsUp, ThumbsDown, Star } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
  feedback?: "positive" | "negative"
}

interface Session {
  id: string
  userId: string
  startTime: string
  endTime?: string
  duration?: number
  messageCount: number
  language: string
  feedback?: {
    rating: number
    comment?: string
  }
  messages: Message[]
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [filterLanguage, setFilterLanguage] = useState("all")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      // In a real app, you'd fetch all sessions or paginate
      // For now, we'll simulate with sample data
      const sampleSessions: Session[] = [
        {
          id: "session_1",
          userId: "user_123",
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          messageCount: 8,
          language: "en",
          feedback: { rating: 5, comment: "Very helpful!" },
          messages: [
            {
              id: "msg_1",
              content: "Hello, I need help with my account balance",
              sender: "user",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "msg_2",
              content: "I can help you check your account balance. Please provide your account number.",
              sender: "bot",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
              feedback: "positive",
            },
          ],
        },
        {
          id: "session_2",
          userId: "user_456",
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
          duration: 25,
          messageCount: 12,
          language: "hi",
          feedback: { rating: 4 },
          messages: [
            {
              id: "msg_3",
              content: "मुझे लोन की जानकारी चाहिए",
              sender: "user",
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "msg_4",
              content: "मैं आपको लोन की जानकारी दे सकता हूं। कृपया बताएं कि आपको किस प्रकार का लोन चाहिए?",
              sender: "bot",
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 45000).toISOString(),
              feedback: "positive",
            },
          ],
        },
      ]

      setSessions(sampleSessions)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLanguage = filterLanguage === "all" || session.language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  const languages = ["all", "en", "hi", "mr", "gu", "ta", "te", "kn", "ml", "bn"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Session Manager</h1>
              <p className="text-gray-600 mt-1">Monitor and analyze user conversations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "all" ? "All Languages" : lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sessions</h2>
              <Badge variant="outline">{filteredSessions.length} sessions</Badge>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSession?.id === session.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        <User className="w-4 h-4 inline mr-2" />
                        {session.userId}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {session.language.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.duration}m
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {session.messageCount}
                        </span>
                        {session.feedback && (
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {session.feedback.rating}/5
                          </span>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}

              {filteredSessions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Session Details
                      </CardTitle>
                      <CardDescription>
                        User: {selectedSession.userId} • Language: {selectedSession.language.toUpperCase()}
                      </CardDescription>
                    </div>
                    {selectedSession.feedback && (
                      <div className="text-right">
                        <div className="flex items-center justify-end mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < selectedSession.feedback!.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {selectedSession.feedback.comment && (
                          <p className="text-xs text-gray-600">"{selectedSession.feedback.comment}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Session Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Start Time</p>
                        <p className="text-sm text-gray-900">{new Date(selectedSession.startTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duration</p>
                        <p className="text-sm text-gray-900">{selectedSession.duration} minutes</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Conversation</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedSession.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] px-3 py-2 rounded-lg ${
                                message.sender === "user" ? "bg-blue-500 text-white" : "bg-white border border-gray-200"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p
                                  className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                                {message.feedback && (
                                  <div className="ml-2">
                                    {message.feedback === "positive" ? (
                                      <ThumbsUp className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <ThumbsDown className="w-3 h-3 text-red-500" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a session</h3>
                  <p className="text-gray-600">
                    Choose a session from the list to view details and conversation history.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
