"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Globe, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:60px_60px] animate-[slide_20s_linear_infinite]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 animate-pulse" />
      </div>

      {/* Floating elements */}
      <div
        className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"
        style={{ animationDelay: "0s", animationDuration: "3s" }}
      />
      <div
        className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-40"
        style={{ animationDelay: "1s", animationDuration: "4s" }}
      />
      <div
        className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce opacity-50"
        style={{ animationDelay: "2s", animationDuration: "5s" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center rounded-md bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-sm font-medium border border-slate-700/50 mb-8 hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            <Shield className="mr-2 h-4 w-4 text-blue-400 animate-pulse" />
            Powered by ArthaGen AI Technology
          </div>

          {/* Animated main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up">
              <span className="block text-white hover:text-blue-100 transition-colors duration-500">
                Bank of Maharashtra
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-size-200 animate-gradient font-normal">
                Intelligent Banking Assistant
              </span>
            </h1>
          </div>

          {/* Animated description */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Advanced AI-powered banking assistance for account management, transactions, and customer support. Available
            24/7 in multiple Indian languages with enterprise-grade security.
          </p>

          {/* Animated CTA buttons */}
          <div
            className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <Button
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-8 py-3 border-0 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
            >
              Access Assistant
              <MessageCircle className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </Button>
            <Link
              href="/admin"
              className="text-sm font-medium leading-6 text-slate-300 hover:text-white transition-all duration-300 flex items-center group hover:translate-x-1"
            >
              Administrative Portal
              <ArrowRight className="inline ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* Animated features grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Bank-grade encryption and compliance standards",
                color: "green",
                delay: "0.6s",
              },
              {
                icon: Globe,
                title: "Multi-Language Support",
                desc: "23+ Indian languages with regional dialects",
                color: "blue",
                delay: "0.8s",
              },
              {
                icon: Zap,
                title: "24/7 Availability",
                desc: "Continuous service with instant response",
                color: "yellow",
                delay: "1s",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group animate-fade-in-up opacity-0 hover:transform hover:scale-105 transition-all duration-500 cursor-pointer"
                style={{ animationDelay: feature.delay, animationFillMode: "forwards" }}
              >
                <div
                  className={`rounded-lg bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-700/50 group-hover:border-${feature.color}-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-${feature.color}-400/20 group-hover:bg-slate-700/80`}
                >
                  <feature.icon
                    className={`h-6 w-6 text-${feature.color}-400 group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <h3 className="mt-4 text-lg font-medium group-hover:text-blue-100 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100px) translateY(-100px); }
          100% { transform: translateX(100px) translateY(100px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  )
}
