"use client"

import { Shield, Lock, Clock, Users } from "lucide-react"

export function HowItWorks() {
  const workflowSteps = [
    {
      step: "01",
      title: "Connect Wallet",
      description:
        "Connect your MetaMask wallet to the Filecoin Calibration network",
      icon: <Shield className="w-7 h-7" />,
    },
    {
      step: "02",
      title: "Set Timeline",
      description:
        "Configure your check-in schedule and inheritance triggers",
      icon: <Clock className="w-7 h-7" />,
    },
    {
      step: "03",
      title: "Add Beneficiaries",
      description:
        "Designate trusted recipients for your encrypted legacy documents",
      icon: <Users className="w-7 h-7" />,
    },
  ]

  const securityFeatures = [
    { icon: <Shield className="w-5 h-5" />, text: "Filecoin Native" },
    { icon: <Lock className="w-5 h-5" />, text: "FVM Contracts" },
    { icon: <Clock className="w-5 h-5" />, text: "Time-Locked" },
    { icon: <Lock className="w-5 h-5" />, text: "Encrypted Storage" },
  ]

  return (
    <section className="relative bg-surface-1 rounded-b-[120px] py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-[1.2px] text-[#D6FF34] mb-4 block">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-white mb-6 leading-tight">
            THREE STEPS TO{" "}
            <span className="text-[#D6FF34]">DIGITAL ETERNITY</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Secure your digital legacy with decentralized protocols designed for
            the ultimate peace of mind
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              className="bg-[#ECEEE7] rounded-[30px] p-10 text-black"
            >
              {/* Step Number */}
              <p className="text-xs text-black/40 mb-4">
                STEP {step.step}
              </p>

              {/* Step Title */}
              <h3 className="text-2xl md:text-[40px] font-bold uppercase text-black leading-[48px] mb-4">
                {step.title}
              </h3>

              {/* Step Body */}
              <p className="text-base text-black/80">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Security Features Banner */}
        <div className="bg-surface-1 rounded-[30px] p-10 border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold uppercase text-white mb-3">
              Vault-Grade Security Standards
            </h3>
            <p className="text-white/60">
              Your digital legacy protected by Filecoin&rsquo;s decentralized
              storage and FVM smart contracts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 bg-[#D6FF34]/10 border border-[#D6FF34]/20 rounded-full flex items-center justify-center text-[#D6FF34] group-hover:bg-[#D6FF34]/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <span className="text-sm font-semibold text-white">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
