"use client"

import { Shield, Lock, Bitcoin, CheckCircle, Clock, Target } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Fort Knox Security",
      description: "Military-grade encryption built on Bitcoin's unbreakable network with multi-signature vault technology",
      icon: <Shield className="w-12 h-12" />,
      gradient: "from-[#F7931A] to-orange-500"
    },
    {
      title: "Sovereign Control",
      description: "Complete custody of your digital assets with programmable inheritance protocols you control",
      icon: <Lock className="w-12 h-12" />,
      gradient: "from-[#F7931A] to-orange-500"
    },
    {
      title: "Adaptive Timeline",
      description: "Intelligent check-in schedules that evolve with your life while maintaining absolute security",
      icon: <Clock className="w-12 h-12" />,
      gradient: "from-[#F7931A] to-orange-500"
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-950 to-black py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#F7931A_0px,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-6 py-3 mb-8">
            <Bitcoin className="w-5 h-5 text-[#F7931A]" />
            <span className="text-sm text-[#F7931A] font-bold uppercase tracking-wider">Premium Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Built for the
            <span className="bg-gradient-to-r from-[#F7931A] to-orange-400 bg-clip-text text-transparent"> Bitcoin Elite</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade inheritance infrastructure designed for serious Bitcoin holders who demand institutional security standards
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-3">Institutional Trust Standards</h3>
            <p className="text-gray-300">Trusted by Bitcoin whales and institutional investors worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] group-hover:bg-[#F7931A]/20 transition-all duration-300">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Audited</p>
                <p className="text-xs text-gray-400">Security Protocol</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] group-hover:bg-[#F7931A]/20 transition-all duration-300">
                <Lock className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Non-Custodial</p>
                <p className="text-xs text-gray-400">Your Keys Always</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] group-hover:bg-[#F7931A]/20 transition-all duration-300">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Battle-Tested</p>
                <p className="text-xs text-gray-400">Production Ready</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full flex items-center justify-center text-[#F7931A] group-hover:bg-[#F7931A]/20 transition-all duration-300">
                <Bitcoin className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Pure Bitcoin</p>
                <p className="text-xs text-gray-400">No Altcoins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  gradient,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  index: number;
}) => {
  return (
    <div className="group relative">
      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:border-[#F7931A]/30 transition-all duration-500 group-hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/5 to-transparent rounded-3xl"></div>

        {/* Icon */}
        <div className="relative flex justify-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F7931A]/25`}>
            <div className="text-black">
              {icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 leading-relaxed text-base">{description}</p>
      </div>
    </div>
  );
};