"use client"

import { Shield, Vault, ArrowRight, CheckCircle, Lock } from "lucide-react"
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider'
import { useModal } from 'connectkit'

interface HeroProps {
  eyebrow?: string
  title?: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "DECENTRALIZED DIGITAL INHERITANCE",
  title = "WHAT HAPPENS TO YOUR DIGITAL ASSETS WHEN YOU'RE GONE?",
  subtitle,
  ctaLabel = "Secure My Legacy",
  ctaHref = "#",
}: HeroProps) {
  const { wallet } = useFilecoinWallet()
  const { setOpen: openConnectModal } = useModal()

  const handleLaunchClick = () => {
    openConnectModal(true)
  }

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Diagonal Grid Lines Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 39px,
              rgba(255, 255, 255, 0.05) 39px,
              rgba(255, 255, 255, 0.05) 40px
            )`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative Blob — yo-yellow, top-right */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#D6FF34] opacity-20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side — Messaging */}
          <div className="space-y-8">
            {/* Eyebrow Chip */}
            <div className="inline-flex items-center gap-2 bg-[#D6FF34]/10 border border-[#D6FF34]/25 rounded-full px-5 py-2">
              <Shield className="w-4 h-4 text-[#D6FF34]" />
              <span className="text-[11px] text-[#D6FF34] font-bold uppercase tracking-[0.08em]">
                {eyebrow}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold uppercase leading-[0.9] tracking-tight text-white">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleLaunchClick}
                disabled={wallet.isConnected}
                className="group bg-[#D6FF34] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {wallet.isConnected
                  ? 'Accessing Vault...'
                  : ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button className="bg-black text-white rounded-full border border-white/10 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity">
                Learn How It Works
              </button>
            </div>

            {/* Security Badges */}
            <div className="pt-8 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">
                Built for peace of mind
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-xs text-white/70 font-medium">Non-Custodial</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-xs text-white/70 font-medium">FVM Powered</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-xs text-white/70 font-medium">Your Keys, Your Legacy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side — Vault Visual */}
          <div className="relative">
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D6FF34]/5 to-transparent rounded-3xl" />

              {/* Vault Door Visualization */}
              <div className="relative text-center space-y-8">
                <div className="mx-auto w-32 h-32 bg-[#D6FF34] rounded-full flex items-center justify-center shadow-2xl shadow-[#D6FF34]/30">
                  <Vault className="w-16 h-16 text-black" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Your Digital Vault</h3>
                  <p className="text-white/50 leading-relaxed">
                    Smart-contract security on the Filecoin Virtual Machine.
                    Your inheritance protocol, activated only when needed.
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="text-center space-y-2">
                    <Shield className="w-8 h-8 text-[#D6FF34] mx-auto" />
                    <p className="text-sm font-semibold text-white">Multi-Sig</p>
                    <p className="text-xs text-white/40">Security</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Lock className="w-8 h-8 text-[#D6FF34] mx-auto" />
                    <p className="text-sm font-semibold text-white">Time-Locked</p>
                    <p className="text-xs text-white/40">Protocols</p>
                  </div>
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-[#D6FF34] mx-auto" />
                    <p className="text-sm font-semibold text-white">Verified</p>
                    <p className="text-xs text-white/40">Contracts</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Vault className="w-8 h-8 text-[#D6FF34] mx-auto" />
                    <p className="text-sm font-semibold text-white">Filecoin Native</p>
                    <p className="text-xs text-white/40">FVM Powered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
