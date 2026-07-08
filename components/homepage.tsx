'use client';

import React, { FC } from 'react';
import Link from 'next/link';
import { LandingHeader } from '@/components/layout/landingHeader';
import { Hero } from '@/components/features/heroSection';
import { HowItWorks } from '@/components/features/howItWorks';
import { Features } from '@/components/features/features';
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider';
import { useRouter } from 'next/navigation';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Heritaz",
  "applicationCategory": "DeFi",
  "operatingSystem": "Web",
  "description": "A confidential digital inheritance platform on Zama fhEVM, ensuring your encrypted digital assets and documents reach your loved ones.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Heritaz Team",
    "url": "https://heritaz.xyz"
  }
};

const Homepage: FC = () => {
  const { wallet } = useFHEVMWallet();
  const router = useRouter();

  // Auto-redirect to dashboard when wallet connects
  React.useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      router.push('/dashboard');
    }
  }, [wallet.isConnected, wallet.address, router]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
        <LandingHeader />

        <div className="pb-16">
          <Hero
            title="YOUR DIGITAL LEGACY, ENCRYPTED BY DEFAULT"
            subtitle="Confidential inheritance powered by Zama fhEVM. Beneficiaries, document keys, and allocations are FHE-encrypted at the protocol level — visible only to you and those you authorize."
            eyebrow="CONFIDENTIAL FHE INHERITANCE"
            ctaLabel="Secure My Legacy"
          />

          <HowItWorks />
          <section id="features">
            <Features />
          </section>

          {/* Premium Footer */}
          <footer className="bg-black border-t border-white/10 mt-20">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <div className="grid md:grid-cols-4 gap-10 mb-12">
                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yo-yellow rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-base">H</span>
                    </div>
                    <span className="text-xl font-bold text-white">Heritaz</span>
                  </div>
                  <p className="text-white/45 text-sm max-w-md leading-relaxed">
                    Confidential digital inheritance powered by Zama fhEVM.
                    Your legacy, encrypted by default. Only your beneficiaries
                    can decrypt what you leave behind.
                  </p>
                </div>

                {/* Product */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[1.2px] text-white/45 mb-4">Product</h4>
                  <ul className="space-y-3">
                    <li><a href="#how-it-works" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">How It Works</a></li>
                    <li><a href="#features" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">Features</a></li>
                    <li><Link href="/dashboard" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">Dashboard</Link></li>
                    <li><Link href="/vault/create" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">Create Vault</Link></li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[1.2px] text-white/45 mb-4">Resources</h4>
                  <ul className="space-y-3">
                    <li><a href="https://docs.zama.ai/fhevm" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">Zama Docs</a></li>
                    <li><a href="https://github.com/zama-ai/fhevm" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">FHEVM GitHub</a></li>
                    <li><a href="https://twitter.com/zanbuilds" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-yo-yellow transition-colors">Twitter / X</a></li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-white/30">
                  &copy; 2025 Heritaz. Built on Zama fhEVM.
                </p>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>MIT License</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>Open Source</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>Testnet Only</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Homepage;
