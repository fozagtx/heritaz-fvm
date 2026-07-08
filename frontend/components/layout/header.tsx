"use client"

import React from 'react'
import { ConnectKitButton } from 'connectkit'
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider'
import { NotificationInbox } from '@/components/ui/notificationInbox'
import Link from 'next/link'

export function Header() {
  const { wallet: fhevmWallet } = useFHEVMWallet()
  const isConnected = fhevmWallet.isConnected

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Branding */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yo-yellow rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Heritaz
            </h1>
          </Link>

          {/* Center - Nav */}
          {isConnected && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-nav text-white/60 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/vault/create" className="text-nav text-white/60 hover:text-white transition-colors">Create Vault</Link>
              <Link href="/beneficiary" className="text-nav text-white/60 hover:text-white transition-colors">Claims</Link>
              <Link href="/settings" className="text-nav text-white/60 hover:text-white transition-colors">Settings</Link>
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
