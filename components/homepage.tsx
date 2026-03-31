'use client';

import React, { FC } from 'react';
import { Header } from '@/components/layout/header';
import { Hero } from '@/components/features/heroSection';
import { HowItWorks } from '@/components/features/howItWorks';
import { Features } from '@/components/features/features';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { useRouter } from 'next/navigation';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Heritaz",
  "applicationCategory": "DeFi",
  "operatingSystem": "Web",
  "description": "A digital legacy platform on Filecoin, ensuring your digital assets and documents reach your loved ones.",
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
  const { wallet } = useFilecoinWallet();
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
        <Header />

        <div className="pb-16">
          <Hero
            title="Secure Digital Inheritance for Modern Families"
            subtitle="Modern, trust-driven inheritance on Filecoin. Automate check-ins, encrypt legacy documents, and distribute assets trustlessly — powered by FVM smart contracts and IPFS."
            eyebrow="Next-Gen Digital Legacy"
            ctaLabel="Launch Heritaz"
          />

          <HowItWorks />
          <Features />

          <footer className="bg-surface-1 rounded-t-[120px] mt-20 pt-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#D6FF34] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">H</span>
                  </div>
                  <span className="text-xl font-bold text-white">Heritaz</span>
                </div>
                <p className="text-white/45 text-sm mb-6">
                  Secure digital inheritance on Filecoin
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a href="https://twitter.com/zanbuilds" className="text-white/45 hover:text-[#D6FF34] transition-colors duration-300">
                    @zanbuilds
                  </a>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-xs text-white/30">
                    © 2025 Heritaz.
                  </p>
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
