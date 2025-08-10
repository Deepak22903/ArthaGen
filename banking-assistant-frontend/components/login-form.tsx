"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const sendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your registered phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Verification code sent successfully")
        setStep("otp")
      } else {
        setError(data.error || "Failed to send verification code")
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Authentication successful")
        if (data.token) {
          localStorage.setItem("authToken", data.token)
        }
        router.push("/admin")
      } else {
        setError(data.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-slate-200 bg-white">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Shield className="w-8 h-8 text-slate-700" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          {step === "phone" ? "Administrative Access" : "Verify Identity"}
        </CardTitle>
        <CardDescription className="text-slate-600">
          {step === "phone"
            ? "Enter your registered phone number to receive a verification code"
            : `Enter the verification code sent to ${phoneNumber}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              onClick={sendOtp}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-slate-700 font-medium">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("phone")
                  setOtp("")
                  setError("")
                  setSuccess("")
                }}
                disabled={loading}
                className="flex-1 border-slate-300"
              >
                Back
              </Button>
              <Button
                onClick={verifyOtp}
                disabled={loading || !otp.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Access"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={sendOtp}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Resend verification code
              </Button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-200">
          <p>Secure administrative access • Bank of Maharashtra</p>
        </div>
      </CardContent>
    </Card>
  )
}
