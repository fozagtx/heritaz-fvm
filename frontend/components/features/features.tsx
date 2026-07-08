"use client"

import { Shield, Lock, Clock, Eye, Cpu, Key, Fingerprint, Users, FileText, Bell, Zap, Github } from "lucide-react"

const cardStyles = [
  { bg: "bg-card-blue", text: "text-card-blue-text" },
  { bg: "bg-card-mint", text: "text-card-mint-text" },
  { bg: "bg-card-cyan", text: "text-card-cyan-text" },
] as const

export function Features() {
  const features = [
    {
      category: "Privacy",
      title: "FHE CONFIDENTIALITY",
      description:
        "Beneficiary addresses, percentages, and document keys are stored as FHE ciphertexts (eaddress, euint8, ebytes256). No one — not even the blockchain — can see who you've designated or what you've left them.",
      icon: Eye,
    },
    {
      category: "Security",
      title: "CRYPTOGRAPHIC ACL",
      description:
        "Access control via FHE.allow() and FHE.isSenderAllowed(). Only you and your designated beneficiaries can decrypt the document keys. No intermediaries, no governance multisigs, no backdoors — pure math.",
      icon: Key,
    },
    {
      category: "Automation",
      title: "DEAD MAN'S SWITCH",
      description:
        "Set a check-in schedule on fhEVM. If you stop checking in past the deadline + grace period, inheritance triggers automatically. Beneficiaries gain FHE decryption rights via coprocessor re-encryption. No lawyers, no courts.",
      icon: Clock,
    },
  ]

  return (
    <section className="relative py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-eyebrow mb-4 block">
            Why Heritaz?
          </span>
          <h2 className="text-section-title mb-6">
            PRIVACY AT THE{" "}
            <span className="text-yo-yellow">PROTOCOL LEVEL</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Most inheritance platforms expose your beneficiaries and assets on-chain.
            Zama fhEVM keeps everything encrypted — computation happens on ciphertexts,
            not plaintexts. Your legacy stays yours until the very end.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const style = cardStyles[index % cardStyles.length]
            return (
              <div
                key={feature.title}
                className={`${style.bg} ${style.text} rounded-card p-10 group hover:scale-[1.02] transition-transform duration-500`}
              >
                <Icon className="w-12 h-12 mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs font-bold uppercase tracking-[1.2px] opacity-60 mb-3">
                  {feature.category}
                </p>
                <h3 className="text-card-title mb-4">
                  {feature.title}
                </h3>
                <p className="text-base leading-6 opacity-90">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Protocol Trust Section */}
        <div className="bg-surface-1 border border-white/10 rounded-card p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold uppercase text-white leading-tight">
                Built on{" "}
                <span className="text-yo-yellow">Zama fhEVM</span>
              </h3>
              <p className="text-white/60 leading-relaxed">
                Heritaz is built on Zama&rsquo;s open-source Fully Homomorphic Encryption
                stack — the gold standard for confidential smart contracts.
                fhEVM allows computation on encrypted data without ever decrypting it.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Cpu, text: "TFHE cryptography — fastest FHE scheme" },
                  { icon: Fingerprint, text: "EVM compatible — use any wallet, any tool" },
                  { icon: Lock, text: "FHE.allow() — granular access control" },
                  { icon: Github, text: "Open source — audited by the community" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yo-yellow/10 border border-yo-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-yo-yellow" />
                    </div>
                    <span className="text-sm text-white/70">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats / Value Props */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Private by Default", sub: "FHE-encrypted state" },
                { value: "0", label: "Trust Assumptions", sub: "Cryptographic guarantees" },
                { value: "24/7", label: "Automated", sub: "Dead man's switch" },
                { value: "∞", label: "Self-Custody", sub: "You hold the keys" },
              ].map(({ value, label, sub }) => (
                <div key={label} className="bg-black/40 rounded-2xl p-5 border border-white/5 text-center">
                  <p className="text-3xl font-bold text-yo-yellow mb-1">{value}</p>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/40 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
