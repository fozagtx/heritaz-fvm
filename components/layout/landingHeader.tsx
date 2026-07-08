"use client"

import Link from "next/link"

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yo-yellow rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Heritaz</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-nav text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-nav text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <Link href="/app" className="text-nav text-yo-yellow hover:text-yo-yellow/80 transition-colors">
              Launch App
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
