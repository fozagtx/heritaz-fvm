"use client"

import { Shield, Vault, Bitcoin, ArrowRight, CheckCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider'
import { toast } from 'sonner'

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "FORTIFIED BITCOIN INHERITANCE",
  title,
  subtitle,
  ctaLabel = "Secure My Legacy",
  ctaHref = "#",
}: HeroProps) {
  const { wallet, connectWallet, isLoading, detectedWallet } = useBitcoinWallet()

  const handleLaunchClick = async () => {
    try {
      await connectWallet()
    } catch (error) {
      toast.error('Failed to connect Bitcoin wallet')
      console.error('Wallet connection error:', error)
    }
  }


  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Vault Pattern Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#F7931A_0px,transparent_50%)] opacity-5"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-[#F7931A]/20 via-transparent to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Messaging */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F7931A]/20 to-transparent border border-[#F7931A]/30 rounded-full px-6 py-3">
              <Bitcoin className="w-4 h-4 text-[#F7931A]" />
              <span className="text-sm text-[#F7931A] font-bold uppercase tracking-wider">{eyebrow}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">What happens to your </span>
                <span className="bg-gradient-to-r from-[#F7931A] to-orange-400 bg-clip-text text-transparent">
                  Bitcoin
                </span>
                <br />
                <span className="text-white">when you're </span>
                <span className="text-gray-400">gone?</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                onClick={handleLaunchClick}
                disabled={wallet.isConnected || isLoading}
                className="group w-full sm:w-auto bg-gradient-to-r from-[#F7931A] to-orange-600 hover:from-orange-600 hover:to-[#F7931A] text-black font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-2xl shadow-xl shadow-[#F7931A]/25 hover:shadow-2xl hover:shadow-[#F7931A]/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <span className="flex items-center justify-center">
                  {wallet.isConnected
                    ? 'Accessing Vault...'
                    : isLoading
                    ? 'Connecting Wallet...'
                    : detectedWallet
                    ? ctaLabel
                    : 'Connect Wallet to Begin'}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white hover:text-black hover:border-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-2xl transition-all duration-300"
              >
                Learn How It Works
              </Button>
            </div>

            {/* Security Badge */}
            <div className="pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-3">Trusted by Bitcoin holders worldwide</p>
              <div className="flex items-center gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-300 font-mono">₿ Non-Custodial</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-300 font-mono">🔐 Your Keys</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-300 font-mono">⚡ Lightning Fast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Vault Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-transparent rounded-3xl"></div>

              {/* Vault Door Visualization */}
              <div className="relative text-center space-y-8">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#F7931A] to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-[#F7931A]/50">
                  <Vault className="w-16 h-16 text-black" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Your Digital Vault</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Military-grade security meets Bitcoin's trustless nature.
                    Your inheritance protocol, activated only when needed.
                  </p>
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="text-center space-y-2">
                    <Shield className="w-8 h-8 text-[#F7931A] mx-auto" />
                    <p className="text-sm font-semibold text-white">Multi-Sig</p>
                    <p className="text-xs text-gray-400">Security</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Lock className="w-8 h-8 text-[#F7931A] mx-auto" />
                    <p className="text-sm font-semibold text-white">Time-Locked</p>
                    <p className="text-xs text-gray-400">Protocols</p>
                  </div>
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-[#F7931A] mx-auto" />
                    <p className="text-sm font-semibold text-white">Verified</p>
                    <p className="text-xs text-gray-400">Contracts</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Bitcoin className="w-8 h-8 text-[#F7931A] mx-auto" />
                    <p className="text-sm font-semibold text-white">Pure</p>
                    <p className="text-xs text-gray-400">Bitcoin</p>
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

