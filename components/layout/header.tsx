"use client"

import React from 'react'
import { ConnectKitButton } from 'connectkit'
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider'
import { NotificationInbox } from '@/components/ui/notificationInbox'
import Link from 'next/link'

export function Header() {
  const { wallet: filWallet } = useFilecoinWallet()
  const isConnected = filWallet.isConnected

  return (
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
            <ConnectKitButton />
          </div>
        </div>
      </div>
    </header>
  )
}
