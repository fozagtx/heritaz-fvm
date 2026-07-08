"use client"

import { Shield, ArrowRight, Eye, Lock, Fingerprint, Cpu } from "lucide-react"
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider'
import { useModal } from 'connectkit'

interface HeroProps {
  eyebrow?: string
  title?: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "CONFIDENTIAL FHE INHERITANCE",
  title = "YOUR DIGITAL LEGACY, ENCRYPTED BY DEFAULT",
  subtitle,
  ctaLabel = "Secure My Legacy",
  ctaHref = "#",
}: HeroProps) {
  const { wallet } = useFHEVMWallet()
  const { setOpen: openConnectModal } = useModal()

  const handleLaunchClick = () => {
    if (!wallet.isConnected) {
      openConnectModal(true)
    }
  }

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Grid Background */}
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

      {/* Decorative Blob */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-yo-yellow opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-yo-yellow opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left - Hero Messaging */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-yo-yellow/10 border border-yo-yellow/25 rounded-full px-5 py-2">
              <Shield className="w-4 h-4 text-yo-yellow" />
              <span className="text-eyebrow">{eyebrow}</span>
            </div>

            {/* Headline */}
            <h1 className="text-hero">{title}</h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleLaunchClick}
                disabled={wallet.isConnected}
                className="group bg-yo-yellow text-black rounded-full px-8 py-4 text-button hover:opacity-80 transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {wallet.isConnected ? 'Go to Dashboard →' : ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="bg-black text-white rounded-full border border-white/10 px-8 py-4 text-button hover:bg-white/5 transition-all duration-300"
              >
                How It Works
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">
                Powered by Zama Fully Homomorphic Encryption
              </p>
              <div className="flex flex-wrap gap-2">
                {["Privacy by Default", "FHE Encrypted", "Auto Inheritance", "Zama fhEVM"].map((badge) => (
                  <span
                    key={badge}
                    className="px-4 py-2 text-xs font-semibold text-white/70 bg-white/5 border border-white/10 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Vault Visual */}
          <div className="relative">
            <div className="relative bg-white/[0.03] backdrop-blur-glass border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yo-yellow/5 via-transparent to-transparent rounded-3xl" />

              <div className="relative text-center space-y-8">
                {/* Central Vault Icon */}
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-yo-yellow to-yo-yellow/80 rounded-full flex items-center justify-center shadow-2xl shadow-yo-yellow/30">
                  <Shield className="w-16 h-16 text-black" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Confidential Inheritance Vault</h3>
                  <p className="text-white/50 leading-relaxed text-sm">
                    Your beneficiaries are stored as encrypted eaddresses.<br />
                    Your document keys as encrypted ebytes256.<br />
                    <span className="text-yo-yellow font-semibold">No one sees your inheritance but you.</span>
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  {[
                    { icon: Eye, label: "Private", sub: "By Default" },
                    { icon: Lock, label: "FHE.allow()", sub: "Access Control" },
                    { icon: Fingerprint, label: "Re-Encrypt", sub: "On Claim" },
                    { icon: Cpu, label: "Zama fhEVM", sub: "FHE Protocol" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center space-y-1.5 p-3 bg-white/5 rounded-2xl">
                      <Icon className="w-7 h-7 text-yo-yellow mx-auto" />
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-white/40">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
