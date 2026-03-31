"use client"


export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D6FF34] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Heritaz
            </h1>
          </div>
        </div>
      </div>
    </header>
  )
}
