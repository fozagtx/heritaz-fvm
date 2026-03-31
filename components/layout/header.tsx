"use client"

import React from 'react'
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider'
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider'
import { WalletModal } from '@/components/ui/walletModal'
import { NotificationInbox } from '@/components/ui/notificationInbox'
import Link from 'next/link'

export function Header() {
  const { wallet: btcWallet, connectWallet: connectBtc, isLoading: btcLoading } = useBitcoinWallet()
  const { wallet: filWallet, connectWallet: connectFil, isLoading: filLoading } = useFilecoinWallet()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const isConnected = filWallet.isConnected
  const isLoading = filLoading

  const handleBitcoinWalletSelect = async (walletId: 'unisat' | 'leather' | 'xverse' | 'okx') => {
    await connectBtc(walletId)
  }

  const handleFilecoinConnect = async () => {
    await connectFil()
  }

  const handleButtonClick = () => {
    if (!isConnected) {
      setIsModalOpen(true)
    }
  }

  const getConnectionLabel = () => {
    if (filWallet.isConnected) return `${filWallet.address.slice(0, 6)}...${filWallet.address.slice(-4)}`
    return ''
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Branding */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D6FF34] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">H</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Heritaz
              </h1>
            </Link>

            {/* Center - Nav */}
            {isConnected && (
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-[13px] font-bold uppercase tracking-[1.2px] text-white/60 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/vault/create" className="text-[13px] font-bold uppercase tracking-[1.2px] text-white/60 hover:text-white transition-colors">Create Vault</Link>
                <Link href="/beneficiary" className="text-[13px] font-bold uppercase tracking-[1.2px] text-white/60 hover:text-white transition-colors">Claims</Link>
                <Link href="/settings" className="text-[13px] font-bold uppercase tracking-[1.2px] text-white/60 hover:text-white transition-colors">Settings</Link>
              </nav>
            )}

            {/* Right - Wallet + Notifications */}
            <div className="flex items-center gap-3">
              {isConnected && <NotificationInbox />}

              {isConnected ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-sm text-white/80 transition-colors"
                >
                  <span className="text-[#0090FF]">⬡</span>
                  <span>{getConnectionLabel()}</span>
                </button>
              ) : (
                <Button
                  onClick={handleButtonClick}
                  disabled={isLoading}
                  className="bg-[#D6FF34] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  {!isLoading && <ArrowRight className="w-3 h-3 ml-1" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <WalletModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onBitcoinWalletSelect={handleBitcoinWalletSelect}
        onFilecoinConnect={handleFilecoinConnect}
      />
    </>
  )
}
