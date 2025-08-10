"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, MapPin, Phone, FileText, Mic, MessageSquare, Shield, Smartphone } from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Account Services",
    description: "Balance inquiries, transaction history, fund transfers, and comprehensive account management.",
    gradient: "from-blue-500 to-cyan-500",
    delay: "0s",
  },
  {
    icon: FileText,
    title: "Loan & Credit Services",
    description: "Loan applications, eligibility checks, EMI calculations, and credit product information.",
    gradient: "from-purple-500 to-pink-500",
    delay: "0.1s",
  },
  {
    icon: MapPin,
    title: "Branch & ATM Network",
    description: "Locate nearest branches, ATMs, and service centers with real-time operational status.",
    gradient: "from-green-500 to-emerald-500",
    delay: "0.2s",
  },
  {
    icon: Phone,
    title: "Customer Support",
    description: "Comprehensive support for banking queries, technical issues, and service requests.",
    gradient: "from-orange-500 to-red-500",
    delay: "0.3s",
  },
  {
    icon: Mic,
    title: "Voice Banking",
    description: "Natural language processing in 23+ Indian languages with voice recognition technology.",
    gradient: "from-indigo-500 to-purple-500",
    delay: "0.4s",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Chat",
    description: "Context-aware conversations with transaction history and personalized recommendations.",
    gradient: "from-teal-500 to-cyan-500",
    delay: "0.5s",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Multi-factor authentication, encryption, and regulatory compliance standards.",
    gradient: "from-red-500 to-pink-500",
    delay: "0.6s",
  },
  {
    icon: Smartphone,
    title: "Digital Integration",
    description: "Seamless integration with mobile banking, UPI, and digital payment platforms.",
    gradient: "from-violet-500 to-purple-500",
    delay: "0.7s",
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:100px_100px] animate-[drift_30s_linear_infinite]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4 hover:text-blue-900 transition-colors duration-500">
            Comprehensive Banking Solutions
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Advanced AI technology delivering professional banking services with enterprise-grade reliability and
            security.
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group cursor-pointer transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up opacity-0"
              style={{
                animationDelay: feature.delay,
                animationFillMode: "forwards",
                animationDuration: "0.8s",
              }}
            >
              <CardHeader className="text-center pb-4 relative overflow-hidden">
                {/* Animated background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-4 border border-slate-200 group-hover:border-slate-300 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden">
                  {/* Icon background animation */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  <feature.icon className="h-6 w-6 text-slate-700 group-hover:text-slate-800 transition-all duration-300 group-hover:scale-110 relative z-10" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-slate-600 leading-relaxed text-sm group-hover:text-slate-700 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardContent>

              {/* Hover effect border */}
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}
                style={{
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "xor",
                  padding: "2px",
                }}
              />
            </Card>
          ))}
        </div>

        {/* Animated stats section */}
        <div
          className="mt-20 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up opacity-0 group"
          style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            {[
              { number: "1M+", label: "Active Customers", delay: "1s" },
              { number: "23+", label: "Supported Languages", delay: "1.2s" },
              { number: "99.9%", label: "Service Uptime", delay: "1.4s" },
            ].map((stat, index) => (
              <div
                key={index}
                className="border-r border-slate-200 last:border-r-0 group-hover:transform group-hover:scale-105 transition-transform duration-300 animate-fade-in-up opacity-0"
                style={{ animationDelay: stat.delay, animationFillMode: "forwards" }}
              >
                <div className="text-3xl font-bold text-slate-900 mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-500">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium hover:text-slate-700 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drift {
          0% { transform: translateX(-50px) translateY(-50px); }
          100% { transform: translateX(50px) translateY(50px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </section>
  )
}
