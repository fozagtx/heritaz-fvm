"use client"

import { Vault } from "lucide-react"

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-start">
          {/* Heritaz Branding */}
          <div className="flex items-center gap-3">
            <Vault className="w-8 h-8 text-[#F7931A]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#F7931A]">
              Heritaz
            </h1>
          </div>
        </div>
      </div>
    </header>
  )
}