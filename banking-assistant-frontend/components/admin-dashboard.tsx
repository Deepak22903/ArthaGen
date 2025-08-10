"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  BarChart3,
  MapPin,
  Globe,
  Star,
  Activity,
  Zap,
  Target,
  UserCheck,
  CreditCard,
  Building,
  Headphones,
  Eye,
  Filter,
  Shield,
} from "lucide-react"

interface Analytics {
  totalSessions: number
  totalMessages: number
  avgSessionDuration: number
  topIntents: Array<{ intent: string; count: number; percentage: number }>
  dailyStats: Array<{ date: string; sessions: number; messages: number }>
  languageStats: Array<{ language: string; name: string; count: number; percentage: number }>
  locationStats: Array<{ state: string; city: string; count: number; percentage: number }>
  serviceStats: Array<{ service: string; count: number; percentage: number; satisfaction: number }>
  satisfactionStats: {
    overall: number
    ratings: Array<{ rating: number; count: number; percentage: number }>
    trends: Array<{ date: string; score: number }>
  }
  peakHours: Array<{ hour: number; count: number }>
  userDemographics: {
    ageGroups: Array<{ group: string; count: number; percentage: number }>
    deviceTypes: Array<{ type: string; count: number; percentage: number }>
  }
  realTimeMetrics: {
    activeUsers: number
    ongoingSessions: number
    avgResponseTime: number
    successRate: number
  }
}

interface UnansweredQuestion {
  id: string
  question: string
  language: string
  timestamp: string
  status: "pending" | "answered"
  answer?: string
  answeredBy?: string
  answeredAt?: string
  location?: string
  userSatisfaction?: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([])
  const [answeredQuestions, setAnsweredQuestions] = useState<UnansweredQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchAnalytics(),
          fetchUnansweredQuestions(),
          fetchAnsweredQuestions()
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const fetchAnalytics = async () => {
    try {
      // Simulate comprehensive analytics data
      const mockAnalytics: Analytics = {
        totalSessions: 45678,
        totalMessages: 234567,
        avgSessionDuration: 8.5,
        topIntents: [
          { intent: "Account Balance Inquiry", count: 12450, percentage: 28.5 },
          { intent: "Fund Transfer", count: 8920, percentage: 20.4 },
          { intent: "Loan Information", count: 6780, percentage: 15.5 },
          { intent: "Branch Locator", count: 5430, percentage: 12.4 },
          { intent: "Card Services", count: 4320, percentage: 9.9 },
          { intent: "Customer Support", count: 3890, percentage: 8.9 },
          { intent: "KYC Updates", count: 2100, percentage: 4.8 },
        ],
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          sessions: Math.floor(Math.random() * 2000) + 1000,
          messages: Math.floor(Math.random() * 8000) + 4000,
        })),
        languageStats: [
          { language: "mr", name: "Marathi", count: 15678, percentage: 34.3 },
          { language: "hi", name: "Hindi", count: 12890, percentage: 28.2 },
          { language: "en", name: "English", count: 8945, percentage: 19.6 },
          { language: "gu", name: "Gujarati", count: 3456, percentage: 7.6 },
          { language: "kn", name: "Kannada", count: 2345, percentage: 5.1 },
          { language: "ta", name: "Tamil", count: 1234, percentage: 2.7 },
          { language: "te", name: "Telugu", count: 1130, percentage: 2.5 },
        ],
        locationStats: [
          { state: "Maharashtra", city: "Mumbai", count: 8945, percentage: 19.6 },
          { state: "Maharashtra", city: "Pune", count: 6789, percentage: 14.9 },
          { state: "Maharashtra", city: "Nagpur", count: 4567, percentage: 10.0 },
          { state: "Gujarat", city: "Ahmedabad", count: 3456, percentage: 7.6 },
          { state: "Karnataka", city: "Bangalore", count: 2890, percentage: 6.3 },
          { state: "Maharashtra", city: "Nashik", count: 2345, percentage: 5.1 },
          { state: "Rajasthan", city: "Jaipur", count: 2100, percentage: 4.6 },
          { state: "Madhya Pradesh", city: "Indore", count: 1890, percentage: 4.1 },
        ],
        serviceStats: [
          { service: "Account Services", count: 18900, percentage: 41.4, satisfaction: 4.3 },
          { service: "Transaction Services", count: 12450, percentage: 27.3, satisfaction: 4.1 },
          { service: "Loan & Credit", count: 6780, percentage: 14.8, satisfaction: 4.0 },
          { service: "Card Services", count: 4320, percentage: 9.5, satisfaction: 4.2 },
          { service: "Investment Services", count: 2100, percentage: 4.6, satisfaction: 3.9 },
          { service: "Insurance Services", count: 1128, percentage: 2.5, satisfaction: 4.0 },
        ],
        satisfactionStats: {
          overall: 4.2,
          ratings: [
            { rating: 5, count: 20345, percentage: 44.6 },
            { rating: 4, count: 15678, percentage: 34.3 },
            { rating: 3, count: 6789, percentage: 14.9 },
            { rating: 2, count: 2100, percentage: 4.6 },
            { rating: 1, count: 766, percentage: 1.7 },
          ],
          trends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            score: 3.8 + Math.random() * 0.8,
          })),
        },
        peakHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: i >= 9 && i <= 17 ? Math.floor(Math.random() * 2000) + 1500 : Math.floor(Math.random() * 800) + 200,
        })),
        userDemographics: {
          ageGroups: [
            { group: "18-25", count: 8945, percentage: 19.6 },
            { group: "26-35", count: 15678, percentage: 34.3 },
            { group: "36-45", count: 12890, percentage: 28.2 },
            { group: "46-55", count: 6789, percentage: 14.9 },
            { group: "55+", count: 1376, percentage: 3.0 },
          ],
          deviceTypes: [
            { type: "Mobile", count: 32456, percentage: 71.1 },
            { type: "Desktop", count: 9876, percentage: 21.6 },
            { type: "Tablet", count: 3346, percentage: 7.3 },
          ],
        },
        realTimeMetrics: {
          activeUsers: 1247,
          ongoingSessions: 892,
          avgResponseTime: 1.2,
          successRate: 94.7,
        },
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchUnansweredQuestions = async () => {
    try {
      const mockQuestions: UnansweredQuestion[] = [
        {
          id: "1",
          question: "मला माझ्या खात्यातील व्याजदर बदलण्याची माहिती हवी आहे",
          language: "mr",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          location: "Mumbai, Maharashtra",
        },
        {
          id: "2",
          question: "How can I increase my credit card limit for international transactions?",
          language: "en",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          location: "Pune, Maharashtra",
        },
      ]
      setUnansweredQuestions(mockQuestions)
    } catch (error) {
      console.error("Error fetching unanswered questions:", error)
    }
  }

  const fetchAnsweredQuestions = async () => {
    try {
      const mockAnswered: UnansweredQuestion[] = [
        {
          id: "3",
          question: "મને મારા લોનની બાકી રકમ જાણવી છે",
          language: "gu",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: "answered",
          answer: "તમારી લોનની બાકી રકમ જાણવા માટે તમે SMS દ્વારા BAL <લોન એકાઉન્ટ નંબર> 9223040000 પર મોકલી શકો છો.",
          answeredBy: "Admin",
          answeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: "Ahmedabad, Gujarat",
          userSatisfaction: 5,
        },
      ]
      setAnsweredQuestions(mockAnswered)
    } catch (error) {
      console.error("Error fetching answered questions:", error)
    }
  }

  const handleAnswerQuestion = async (questionId: string) => {
    if (!selectedAnswer.trim()) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/unanswered/${questionId}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: selectedAnswer,
          answeredBy: "Administrator",
        }),
      })

      if (response.ok) {
        setSelectedAnswer("")
        setAnsweringQuestionId(null)
        fetchUnansweredQuestions()
        fetchAnsweredQuestions()
      }
    } catch (error) {
      console.error("Error answering question:", error)
    }
  }

  const filteredUnansweredQuestions = unansweredQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.location && q.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredAnsweredQuestions = answeredQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.location && q.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center animate-fade-in-up">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Loading comprehensive analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:120px_120px] animate-[drift_40s_linear_infinite]" />

      {/* Professional Animated Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                Bank of Maharashtra - Multilingual Chatbot Analytics
              </h1>
              <p className="text-slate-600 mt-1">Comprehensive AI Assistant Performance Dashboard</p>
            </div>
            <div className="flex space-x-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Export Report
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Eye className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Live View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList
            className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="geography"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-emerald-50 data-[state=active]:text-green-700 transition-all duration-300"
            >
              Geography
            </TabsTrigger>
            <TabsTrigger
              value="languages"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-pink-50 data-[state=active]:text-purple-700 transition-all duration-300"
            >
              Languages
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-50 data-[state=active]:to-red-50 data-[state=active]:text-orange-700 transition-all duration-300"
            >
              Services
            </TabsTrigger>
            <TabsTrigger
              value="satisfaction"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-50 data-[state=active]:to-orange-50 data-[state=active]:text-yellow-700 transition-all duration-300"
            >
              Satisfaction
            </TabsTrigger>
            <TabsTrigger
              value="queries"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-50 data-[state=active]:to-pink-50 data-[state=active]:text-red-700 transition-all duration-300"
            >
              Queries
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                {/* Real-time Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {[
                    {
                      title: "Active Users",
                      value: analytics.realTimeMetrics.activeUsers.toLocaleString(),
                      icon: Users,
                      color: "green",
                      delay: "0s",
                      trend: "+12%",
                      subtitle: "Currently online",
                    },
                    {
                      title: "Ongoing Sessions",
                      value: analytics.realTimeMetrics.ongoingSessions.toLocaleString(),
                      icon: MessageSquare,
                      color: "blue",
                      delay: "0.1s",
                      trend: "+8%",
                      subtitle: "Active conversations",
                    },
                    {
                      title: "Avg Response Time",
                      value: `${analytics.realTimeMetrics.avgResponseTime}s`,
                      icon: Zap,
                      color: "yellow",
                      delay: "0.2s",
                      trend: "-5%",
                      subtitle: "System performance",
                    },
                    {
                      title: "Success Rate",
                      value: `${analytics.realTimeMetrics.successRate}%`,
                      icon: Target,
                      color: "purple",
                      delay: "0.3s",
                      trend: "+2%",
                      subtitle: "Query resolution",
                    },
                  ].map((metric, index) => (
                    <Card
                      key={index}
                      className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in-up opacity-0 group cursor-pointer relative overflow-hidden"
                      style={{ animationDelay: metric.delay, animationFillMode: "forwards" }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500/5 to-${metric.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-700">{metric.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              metric.trend.startsWith("+")
                                ? "text-green-600 border-green-200"
                                : "text-red-600 border-red-200"
                            }`}
                          >
                            {metric.trend}
                          </Badge>
                          <metric.icon
                            className={`h-4 w-4 text-${metric.color}-500 group-hover:scale-110 transition-transform duration-300`}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div
                          className={`text-2xl font-bold text-slate-900 group-hover:text-${metric.color}-700 transition-colors duration-300`}
                        >
                          {metric.value}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{metric.subtitle}</p>
                      </CardContent>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-slate-300 transition-all duration-300" />
                    </Card>
                  ))}
                </div>

                {/* Key Performance Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      title: "Total Sessions",
                      value: analytics.totalSessions.toLocaleString(),
                      icon: Users,
                      color: "blue",
                      delay: "0.4s",
                      subtitle: "All time",
                    },
                    {
                      title: "Total Messages",
                      value: analytics.totalMessages.toLocaleString(),
                      icon: MessageSquare,
                      color: "purple",
                      delay: "0.5s",
                      subtitle: "Conversations",
                    },
                    {
                      title: "Avg Session Duration",
                      value: `${analytics.avgSessionDuration}m`,
                      icon: Clock,
                      color: "green",
                      delay: "0.6s",
                      subtitle: "User engagement",
                    },
                    {
                      title: "Overall Satisfaction",
                      value: `${analytics.satisfactionStats.overall}/5`,
                      icon: Star,
                      color: "yellow",
                      delay: "0.7s",
                      subtitle: "User rating",
                    },
                  ].map((metric, index) => (
                    <Card
                      key={index}
                      className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in-up opacity-0 group cursor-pointer"
                      style={{ animationDelay: metric.delay, animationFillMode: "forwards" }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">{metric.title}</CardTitle>
                        <metric.icon
                          className={`h-4 w-4 text-${metric.color}-500 group-hover:scale-110 transition-transform duration-300`}
                        />
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`text-2xl font-bold text-slate-900 group-hover:text-${metric.color}-700 transition-colors duration-300`}
                        >
                          {metric.value}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{metric.subtitle}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Peak Usage Hours */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Peak Usage Hours
                    </CardTitle>
                    <CardDescription className="text-slate-600">Hourly distribution of user activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-12 gap-2">
                      {analytics.peakHours.map((hour, index) => (
                        <div
                          key={index}
                          className="text-center group animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${0.9 + index * 0.05}s`, animationFillMode: "forwards" }}
                        >
                          <div
                            className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-md mb-1 transition-all duration-300 hover:from-blue-600 hover:to-purple-600 cursor-pointer"
                            style={{
                              height: `${Math.max((hour.count / Math.max(...analytics.peakHours.map((h) => h.count))) * 60, 4)}px`,
                            }}
                            title={`${hour.hour}:00 - ${hour.count} sessions`}
                          />
                          <div className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors duration-300">
                            {hour.hour}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* User Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                    style={{ animationDelay: "1s", animationFillMode: "forwards" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                        Age Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.userDemographics.ageGroups.map((group, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${1.1 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
                              <span className="font-medium text-slate-900">{group.group} years</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${group.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 w-12 text-right">{group.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                    style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-600" />
                        Device Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.userDemographics.deviceTypes.map((device, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${1.3 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                              <span className="font-medium text-slate-900">{device.type}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${device.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 w-12 text-right">{device.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Location Heatmap */}
                  <Card className="lg:col-span-2 border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        User Location Heatmap
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Geographic distribution of chatbot users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                        <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">Interactive Map</h3>
                        <p className="text-slate-600 text-sm">
                          Geographic visualization showing user density across different regions of India
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-600">Maharashtra</div>
                            <div className="text-slate-600">Highest Usage</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">Gujarat</div>
                            <div className="text-slate-600">Growing Market</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Locations */}
                  <Card
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                        Top Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.locationStats.slice(0, 8).map((location, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-slate-50/50 p-2 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-700 border border-blue-200 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                                  {location.city}
                                </div>
                                <div className="text-xs text-slate-500">{location.state}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-slate-900">{location.count.toLocaleString()}</div>
                              <div className="text-xs text-slate-500">{location.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* State-wise Distribution */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      State-wise User Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { state: "Maharashtra", users: 22641, percentage: 49.6, color: "blue" },
                        { state: "Gujarat", users: 3456, percentage: 7.6, color: "green" },
                        { state: "Karnataka", users: 2890, percentage: 6.3, color: "purple" },
                        { state: "Rajasthan", users: 2100, percentage: 4.6, color: "orange" },
                        { state: "Madhya Pradesh", users: 1890, percentage: 4.1, color: "red" },
                        { state: "Tamil Nadu", users: 1234, percentage: 2.7, color: "yellow" },
                        { state: "Telangana", users: 1130, percentage: 2.5, color: "pink" },
                        { state: "Others", users: 10337, percentage: 22.6, color: "slate" },
                      ].map((state, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-4 hover:from-slate-100 hover:to-blue-100/50 transition-all duration-300 cursor-pointer group animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: "forwards" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                              {state.state}
                            </h3>
                            <div
                              className={`w-3 h-3 bg-gradient-to-r from-${state.color}-400 to-${state.color}-500 rounded-full`}
                            />
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-1">{state.users.toLocaleString()}</div>
                          <div className="text-sm text-slate-600">{state.percentage}% of total users</div>
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-1">
                            <div
                              className={`bg-gradient-to-r from-${state.color}-400 to-${state.color}-500 h-1 rounded-full transition-all duration-1000`}
                              style={{ width: `${Math.min(state.percentage * 2, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Language Usage Chart */}
                  <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-purple-600" />
                        Language Distribution
                      </CardTitle>
                      <CardDescription className="text-slate-600">Most used languages by users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.languageStats.map((lang, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-slate-50/50 p-2 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-sm font-medium text-purple-700 border border-purple-200 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                                {lang.language.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 group-hover:text-purple-900 transition-colors duration-300">
                                  {lang.name}
                                </div>
                                <div className="text-xs text-slate-500">{lang.count.toLocaleString()} users</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${lang.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 w-12 text-right">{lang.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Language Trends */}
                  <Card
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Language Trends
                      </CardTitle>
                      <CardDescription className="text-slate-600">Growth in language adoption</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { lang: "Marathi", trend: "+15%", color: "green", desc: "Fastest growing" },
                          { lang: "Hindi", trend: "+8%", color: "blue", desc: "Steady growth" },
                          { lang: "English", trend: "+5%", color: "purple", desc: "Consistent usage" },
                          { lang: "Gujarati", trend: "+12%", color: "orange", desc: "Regional expansion" },
                          { lang: "Kannada", trend: "+18%", color: "red", desc: "New market entry" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-slate-50/50 p-3 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-3 h-3 bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-full`}
                              />
                              <div>
                                <div className="font-medium text-slate-900">{item.lang}</div>
                                <div className="text-xs text-slate-500">{item.desc}</div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-${item.color}-600 border-${item.color}-200 bg-${item.color}-50`}
                            >
                              {item.trend}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Regional Language Preferences */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Regional Language Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-600">Language usage by geographic region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          region: "Maharashtra",
                          languages: [
                            { name: "Marathi", percentage: 65, color: "blue" },
                            { name: "Hindi", percentage: 25, color: "green" },
                            { name: "English", percentage: 10, color: "purple" },
                          ],
                        },
                        {
                          region: "Gujarat",
                          languages: [
                            { name: "Gujarati", percentage: 70, color: "orange" },
                            { name: "Hindi", percentage: 20, color: "green" },
                            { name: "English", percentage: 10, color: "purple" },
                          ],
                        },
                        {
                          region: "Karnataka",
                          languages: [
                            { name: "Kannada", percentage: 60, color: "red" },
                            { name: "English", percentage: 25, color: "purple" },
                            { name: "Hindi", percentage: 15, color: "green" },
                          ],
                        },
                      ].map((region, regionIndex) => (
                        <div
                          key={regionIndex}
                          className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-4 animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${0.5 + regionIndex * 0.1}s`, animationFillMode: "forwards" }}
                        >
                          <h3 className="font-semibold text-slate-900 mb-3">{region.region}</h3>
                          <div className="space-y-3">
                            {region.languages.map((lang, langIndex) => (
                              <div key={langIndex} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2 h-2 bg-gradient-to-r from-${lang.color}-400 to-${lang.color}-500 rounded-full`}
                                  />
                                  <span className="text-sm text-slate-700">{lang.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-slate-200 rounded-full h-1">
                                    <div
                                      className={`bg-gradient-to-r from-${lang.color}-400 to-${lang.color}-500 h-1 rounded-full transition-all duration-1000`}
                                      style={{ width: `${lang.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-600 w-8 text-right">{lang.percentage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Service Usage */}
                  <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                        Service Usage Distribution
                      </CardTitle>
                      <CardDescription className="text-slate-600">Most requested banking services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.serviceStats.map((service, index) => (
                          <div
                            key={index}
                            className="group hover:bg-slate-50/50 p-3 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center border border-orange-200">
                                  {service.service === "Account Services" && (
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                  )}
                                  {service.service === "Transaction Services" && (
                                    <Activity className="w-4 h-4 text-orange-600" />
                                  )}
                                  {service.service === "Loan & Credit" && (
                                    <Building className="w-4 h-4 text-orange-600" />
                                  )}
                                  {service.service === "Card Services" && (
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                  )}
                                  {service.service === "Investment Services" && (
                                    <TrendingUp className="w-4 h-4 text-orange-600" />
                                  )}
                                  {service.service === "Insurance Services" && (
                                    <Shield className="w-4 h-4 text-orange-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900 group-hover:text-orange-900 transition-colors duration-300">
                                    {service.service}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {service.count.toLocaleString()} requests
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-sm text-slate-600">{service.satisfaction}</span>
                                </div>
                                <span className="text-sm text-slate-600">{service.percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${service.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Queries */}
                  <Card
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                        Top Query Categories
                      </CardTitle>
                      <CardDescription className="text-slate-600">Most frequent customer inquiries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topIntents.slice(0, 7).map((intent, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-slate-50/50 p-2 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-700 border border-blue-200 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 group-hover:scale-110">
                                {index + 1}
                              </div>
                              <span className="font-medium text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                                {intent.intent}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-slate-900">{intent.count.toLocaleString()}</div>
                              <div className="text-xs text-slate-500">{intent.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Service Performance Metrics */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-600" />
                      Service Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Detailed performance analysis by service type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analytics.serviceStats.map((service, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-4 hover:from-slate-100 hover:to-blue-100/50 transition-all duration-300 cursor-pointer group animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: "forwards" }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                              {service.service}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(service.satisfaction)
                                      ? "text-yellow-500 fill-current"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Usage</span>
                              <span className="font-medium text-slate-900">{service.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 rounded-full transition-all duration-1000"
                                style={{ width: `${service.percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Satisfaction</span>
                              <span className="font-medium text-slate-900">{service.satisfaction}/5</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1">
                              <div
                                className="bg-gradient-to-r from-green-400 to-yellow-500 h-1 rounded-full transition-all duration-1000"
                                style={{ width: `${(service.satisfaction / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Satisfaction Tab */}
          <TabsContent value="satisfaction" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Overall Satisfaction */}
                  <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                        Overall Satisfaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">
                        {analytics.satisfactionStats.overall}
                      </div>
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.floor(analytics.satisfactionStats.overall)
                                ? "text-yellow-500 fill-current"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm">out of 5 stars</p>
                      <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                        +0.3 from last month
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Rating Distribution */}
                  <Card
                    className="lg:col-span-2 border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-slate-900 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        Rating Distribution
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Breakdown of user satisfaction ratings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.satisfactionStats.ratings.map((rating, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-slate-50/50 p-2 rounded-lg transition-all duration-300 animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                {[...Array(rating.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                                {[...Array(5 - rating.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-slate-300" />
                                ))}
                              </div>
                              <span className="font-medium text-slate-900">
                                {rating.rating} Star{rating.rating !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${rating.percentage}%` }}
                                />
                              </div>
                              <div className="text-right min-w-[80px]">
                                <div className="font-medium text-slate-900">{rating.count.toLocaleString()}</div>
                                <div className="text-xs text-slate-500">{rating.percentage}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Satisfaction Trends */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Satisfaction Trends (Last 30 Days)
                    </CardTitle>
                    <CardDescription className="text-slate-600">Daily satisfaction score trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-6 flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 mb-2">Satisfaction Trend Chart</h3>
                        <p className="text-slate-600 text-sm mb-4">
                          Interactive chart showing daily satisfaction scores over the past 30 days
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">↗ 4.2</div>
                            <div className="text-slate-600">Current</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-600">4.1</div>
                            <div className="text-slate-600">Average</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-purple-600">+7%</div>
                            <div className="text-slate-600">Growth</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service-wise Satisfaction */}
                <Card
                  className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0"
                  style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center">
                      <Headphones className="w-5 h-5 mr-2 text-purple-600" />
                      Service-wise Satisfaction Scores
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Satisfaction ratings by service category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analytics.serviceStats.map((service, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-lg p-4 hover:from-slate-100 hover:to-purple-100/50 transition-all duration-300 cursor-pointer group animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${0.7 + index * 0.1}s`, animationFillMode: "forwards" }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-slate-900 text-sm group-hover:text-purple-900 transition-colors duration-300">
                              {service.service}
                            </h3>
                            <div className="text-lg font-bold text-purple-600">{service.satisfaction}</div>
                          </div>
                          <div className="flex items-center justify-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(service.satisfaction)
                                    ? "text-yellow-500 fill-current"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-pink-500 h-1 rounded-full transition-all duration-1000"
                              style={{ width: `${(service.satisfaction / 5) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-500 text-center mt-2">
                            {service.count.toLocaleString()} responses
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Queries Tab */}
          <TabsContent value="queries" className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in-up">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Query Management</h2>
                <p className="text-sm text-slate-600">Manage pending and resolved customer queries</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-slate-300 bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-300 hover:shadow-md focus:shadow-lg"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
                >
                  Pending ({filteredUnansweredQuestions.length})
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                >
                  Resolved ({filteredAnsweredQuestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {filteredUnansweredQuestions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fade-in-up opacity-0 group"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                            {question.question}
                          </CardTitle>
                          <CardDescription className="mt-1 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{question.language.toUpperCase()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(question.timestamp).toLocaleString()}</span>
                              </span>
                              {question.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{question.location}</span>
                                </span>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {answeringQuestionId === question.id ? (
                        <div className="space-y-3 animate-fade-in">
                          <Textarea
                            placeholder="Provide a comprehensive answer..."
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            rows={3}
                            className="border-slate-300 bg-white/90 backdrop-blur-sm focus:bg-white transition-all duration-300 hover:shadow-md focus:shadow-lg"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAnswerQuestion(question.id)}
                              disabled={!selectedAnswer.trim()}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              Submit Answer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnsweringQuestionId(null)
                                setSelectedAnswer("")
                              }}
                              className="border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setAnsweringQuestionId(question.id)}
                          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group"
                        >
                          <MessageSquare className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          Provide Answer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredUnansweredQuestions.length === 0 && (
                  <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in-up">
                    <CardContent className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 animate-bounce-subtle" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">All queries resolved</h3>
                      <p className="text-slate-600">No pending customer queries at this time.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                {filteredAnsweredQuestions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fade-in-up opacity-0 group"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                            {question.question}
                          </CardTitle>
                          <CardDescription className="mt-1 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{question.language.toUpperCase()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Asked: {new Date(question.timestamp).toLocaleString()}</span>
                              </span>
                              {question.answeredAt && (
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Resolved: {new Date(question.answeredAt).toLocaleString()}</span>
                                </span>
                              )}
                              {question.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{question.location}</span>
                                </span>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {question.userSatisfaction && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-slate-600">{question.userSatisfaction}/5</span>
                            </div>
                          )}
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/30 backdrop-blur-sm rounded-lg p-4 border border-slate-200/50 group-hover:from-slate-50 group-hover:to-blue-50/50 transition-all duration-300">
                        <p className="text-sm font-medium text-slate-700 mb-2">Administrative Response:</p>
                        <p className="text-sm text-slate-900 leading-relaxed">{question.answer}</p>
                        {question.answeredBy && (
                          <p className="text-xs text-slate-500 mt-3">Resolved by: {question.answeredBy}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAnsweredQuestions.length === 0 && (
                  <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in-up">
                    <CardContent className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bounce-subtle" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No resolved queries</h3>
                      <p className="text-slate-600">Resolved customer queries will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0% { transform: translateX(-60px) translateY(-60px); }
          100% { transform: translateX(60px) translateY(60px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
