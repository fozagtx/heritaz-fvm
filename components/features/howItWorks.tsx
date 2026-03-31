"use client"

import { Shield, Clock, Users, Bitcoin, Lock, CheckCircle } from "lucide-react"

export function HowItWorks() {
  const workflowSteps = [
    {
      step: "1",
      title: "Connect Wallet",
      description: "Link your Bitcoin wallet securely to the inheritance protocol",
      icon: <Shield className="w-7 h-7" />,
      color: "from-[#F7931A] to-orange-500"
    },
    {
      step: "2",
      title: "Set Timeline",
      description: "Configure your check-in schedule and inheritance triggers",
      icon: <Clock className="w-7 h-7" />,
      color: "from-[#F7931A] to-orange-500"
    },
    {
      step: "3",
      title: "Add Beneficiaries",
      description: "Designate trusted recipients for your digital legacy",
      icon: <Users className="w-7 h-7" />,
      color: "from-[#F7931A] to-orange-500"
    }
  ]

  const securityFeatures = [
    { icon: <Bitcoin className="w-5 h-5" />, text: "Bitcoin Native" },
    { icon: <Shield className="w-5 h-5" />, text: "Multi-Signature" },
    { icon: <Lock className="w-5 h-5" />, text: "Time-Locked" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Audited Code" }
  ]

  return (
    <section className="relative bg-gradient-to-b from-black to-gray-950 py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#F7931A_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-6 py-3 mb-8">
            <Bitcoin className="w-5 h-5 text-[#F7931A]" />
            <span className="text-sm text-[#F7931A] font-bold uppercase tracking-wider">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Three Steps to
            <span className="bg-gradient-to-r from-[#F7931A] to-orange-400 bg-clip-text text-transparent"> Digital Eternity</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Secure your Bitcoin inheritance with military-grade protocols designed for the ultimate peace of mind
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {workflowSteps.map((step, index) => (
            <div key={step.step} className="relative group">
              {/* Connection Line (except last item) */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-8 h-0.5 bg-gradient-to-r from-[#F7931A]/50 to-transparent z-0"></div>
              )}

              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:border-[#F7931A]/30 transition-all duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/5 to-transparent rounded-3xl"></div>

                {/* Step Number */}
                <div className="relative flex justify-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F7931A]/25`}>
                    <span className="text-2xl font-black text-black">{step.step}</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6 text-[#F7931A]">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Features Banner */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-3">Fort Knox Security Standards</h3>
            <p className="text-gray-300">Your Bitcoin inheritance protected by institutional-grade security</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] group-hover:bg-[#F7931A]/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <span className="text-sm font-semibold text-white">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}