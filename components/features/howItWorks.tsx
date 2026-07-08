"use client"

import { Shield, Lock, Clock, Eye, Key, Cpu, FileText, Users, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const workflowSteps = [
    {
      step: "01",
      title: "Create\nVault",
      description:
        "Designate your beneficiaries — their addresses and allocations are encrypted as FHE ciphertexts (eaddress + euint8) on Zama fhEVM. No one sees who you've named.",
      icon: Shield,
      gradient: "from-yo-yellow to-yo-yellow/60",
    },
    {
      step: "02",
      title: "Upload\nLegacy",
      description:
        "Encrypt documents client-side with AES-256-GCM. The symmetric key is stored on-chain as an ebytes256 ciphertext. Only beneficiaries authorized via FHE.allow() can decrypt it.",
      icon: FileText,
      gradient: "from-yo-yellow to-yo-yellow/40",
    },
    {
      step: "03",
      title: "Auto\nInherit",
      description:
        "If you stop checking in past the deadline + grace period, anyone can trigger inheritance. The fhEVM coprocessor re-encrypts document keys for your beneficiaries automatically.",
      icon: Clock,
      gradient: "from-yo-yellow/80 to-yo-yellow/20",
    },
  ]

  const benefits = [
    { icon: Eye, text: "Privacy by Default — all vault data is FHE-encrypted" },
    { icon: Key, text: "No key sharing — FHE.allow() handles authorization" },
    { icon: Cpu, text: "Compute on encrypted data via Zama fhEVM coprocessor" },
    { icon: Lock, text: "Re-encryption on claim — beneficiaries get access only when triggered" },
  ]

  return (
    <section id="how-it-works" className="relative bg-surface-1 rounded-b-[120px] py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-eyebrow mb-4 block">
            How It Works
          </span>
          <h2 className="text-section-title mb-6">
            FHE-POWERED{" "}
            <span className="text-yo-yellow">INHERITANCE</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Zama&rsquo;s Fully Homomorphic Encryption ensures your beneficiaries,
            allocations, and document keys are encrypted at the protocol level
            &mdash; visible only to those you authorize.
          </p>
        </div>

        {/* 3-Step Process */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="group relative">
                {/* Connector line */}
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-yo-yellow/40 to-transparent" />
                )}
                {/* Card */}
                <div className="relative bg-black border border-white/10 rounded-card p-10 h-full hover:border-yo-yellow/30 transition-all duration-500 group-hover:shadow-glow-lg">
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <span className="text-2xl font-bold text-yo-yellow/40">{step.step}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-card-title text-white mb-4 whitespace-pre-line">
                    {step.title}
                  </h3>

                  {/* Body */}
                  <p className="text-white/60 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Grid */}
        <div className="bg-black/50 border border-white/10 rounded-card p-10">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold uppercase text-white mb-3">
              Why This Matters
            </h3>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every year, billions in crypto are lost forever because someone died
              without sharing their keys. Heritaz fixes this with FHE privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, text }, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-yo-yellow/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-yo-yellow" />
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
