'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider';
import { useModal } from 'connectkit';
import { Shield, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BeneficiaryVault {
  address: string;
  status: string;
  ownerAddress: string;
  percentage: number;
  canClaim: boolean;
}

export default function BeneficiaryPage() {
  const { wallet: fhevmWallet, initializing } = useFHEVMWallet();
  const { setOpen: openConnectModal } = useModal();
  const router = useRouter();
  const [vaults, setVaults] = useState<BeneficiaryVault[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initializing || !fhevmWallet.isConnected) return;

    const fetchBeneficiaryVaults = async () => {
      setLoading(true);
      try {
        // Vaults where user is beneficiary
        if (fhevmWallet.isConnected) {
          // Factory query happens client-side via ethers.js
          // Will populate once factory is deployed
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaryVaults();
  }, [fhevmWallet.isConnected, initializing, router]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center pt-48">
          <div className="w-6 h-6 border-2 border-yo-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!fhevmWallet.isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex flex-col items-center justify-center pt-48 space-y-4">
          <Shield className="w-12 h-12 text-white/20" />
          <p className="text-white/50">Connect your wallet to view your claims</p>
          <button
            onClick={() => openConnectModal(true)}
            className="bg-yo-yellow text-black rounded-full px-7 py-3.5 text-button hover:opacity-80"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-yo-yellow">
            <span className="h-[1px] w-8 bg-yo-yellow/60" />
            Beneficiary
          </p>
          <h1 className="text-3xl font-bold uppercase">Your Inheritance Claims</h1>
          <p className="text-white/60">
            Vaults where you are listed as a beneficiary. Claim your legacy when inheritance is triggered.
          </p>
        </div>

        {!fhevmWallet.isConnected ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">Connect a wallet</h2>
            <p className="text-sm text-white/40">Connect your wallet to view vaults where you are a beneficiary.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-yo-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Searching for your vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">No vaults found</h2>
            <p className="text-sm text-white/40">
              You are not listed as a beneficiary in any vaults yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vaults.map((vault) => (
              <Link
                key={vault.address}
                href={vault.canClaim ? `/claim/${vault.address}` : `/vault/${vault.address}`}
                className="block bg-surface-1 rounded-[30px] p-5 hover:bg-surface-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl text-yo-yellow">⬡</div>
                    <div>
                      <p className="font-medium text-white font-mono text-sm">{vault.address.slice(0, 16)}...</p>
                      <p className="text-xs text-white/40">Owner: {vault.ownerAddress.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-yo-yellow">{vault.percentage}%</span>
                    {vault.canClaim ? (
                      <span className="px-3 py-1 bg-yo-yellow/10 text-yo-yellow border border-yo-yellow/20 rounded-full text-xs">
                        Ready to Claim
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/40">
                        {vault.status}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
