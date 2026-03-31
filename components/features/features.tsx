"use client"

import { Shield, Lock, Clock, CheckCircle } from "lucide-react"

const cardStyles = [
  { bg: "bg-card-blue", text: "text-card-blue-text" },
  { bg: "bg-card-mint", text: "text-card-mint-text" },
  { bg: "bg-card-cyan", text: "text-card-cyan-text" },
] as const

export function Features() {
  const features = [
    {
      category: "Security",
      title: "VAULT SECURITY",
      description:
        "AES-256-GCM encryption paired with FVM smart contracts for tamper-proof, decentralized asset protection that outlasts any single platform.",
      icon: <Shield className="w-12 h-12" />,
    },
    {
      category: "Ownership",
      title: "SOVEREIGN CONTROL",
      description:
        "Non-custodial Filecoin vaults ensure only you hold the keys. No intermediaries, no counterparty risk, no centralized points of failure.",
      icon: <Lock className="w-12 h-12" />,
    },
    {
      category: "Automation",
      title: "ADAPTIVE TIMELINE",
      description:
        "Smart contract check-in schedules that evolve with your life while maintaining absolute security over your encrypted legacy.",
      icon: <Clock className="w-12 h-12" />,
    },
  ]

  return (
    <section className="relative bg-surface-1 py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-[1.2px] text-[#D6FF34] mb-4 block">
            Premium Features
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-white mb-6 leading-tight">
            BUILT FOR THE{" "}
            <span className="text-[#D6FF34]">DIGITAL ELITE</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade inheritance infrastructure designed for serious
            digital asset holders who demand institutional security standards
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const style = cardStyles[index % cardStyles.length]
            return (
              <div
                key={feature.title}
                className={`${style.bg} ${style.text} rounded-[30px] p-10`}
              >
                {/* Category Label */}
                <p className="text-xs font-bold uppercase tracking-[1.2px] opacity-60 mb-3">
                  {feature.category}
                </p>

                {/* Title */}
                <h3 className="text-2xl md:text-[40px] font-bold uppercase leading-[48px] mb-4">
                  {feature.title}
                </h3>

                {/* Body */}
                <p className="text-base leading-6">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="bg-surface-1 border border-white/10 rounded-[30px] p-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold uppercase text-white mb-3">
              Institutional Trust Standards
            </h3>
            <p className="text-white/60">
              Trusted by digital asset holders and decentralized storage
              advocates worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#D6FF34]/10 border border-[#D6FF34]/20 rounded-full flex items-center justify-center text-[#D6FF34] group-hover:bg-[#D6FF34]/20 transition-all duration-300">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  Verified Contracts
                </p>
                <p className="text-xs text-white/40">On-Chain Audited</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#D6FF34]/10 border border-[#D6FF34]/20 rounded-full flex items-center justify-center text-[#D6FF34] group-hover:bg-[#D6FF34]/20 transition-all duration-300">
                <Lock className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Non-Custodial</p>
                <p className="text-xs text-white/40">Your Keys Always</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#D6FF34]/10 border border-[#D6FF34]/20 rounded-full flex items-center justify-center text-[#D6FF34] group-hover:bg-[#D6FF34]/20 transition-all duration-300">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  Encrypted Storage
                </p>
                <p className="text-xs text-white/40">AES-256-GCM</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#D6FF34]/10 border border-[#D6FF34]/20 rounded-full flex items-center justify-center text-[#D6FF34] group-hover:bg-[#D6FF34]/20 transition-all duration-300">
                <Clock className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">FVM Powered</p>
                <p className="text-xs text-white/40">Smart Contracts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
