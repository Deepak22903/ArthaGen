import { Suspense } from "react"
import Hero from "@/components/hero"
import Features from "@/components/features"
import ChatbotWidget from "@/components/chatbot-widget"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  )
}
