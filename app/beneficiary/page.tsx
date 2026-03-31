'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';
import { Shield, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface BeneficiaryVault {
  address: string;
  type: 'bitcoin' | 'filecoin';
  status: string;
  ownerAddress: string;
  percentage: number;
  canClaim: boolean;
}

export default function BeneficiaryPage() {
  const { wallet: btcWallet } = useBitcoinWallet();
  const { wallet: filWallet } = useFilecoinWallet();
  const [vaults, setVaults] = useState<BeneficiaryVault[]>([]);
  const [loading, setLoading] = useState(false);

  const isAnyWalletConnected = btcWallet.isConnected || filWallet.isConnected;

  useEffect(() => {
    if (!isAnyWalletConnected) return;

    const fetchBeneficiaryVaults = async () => {
      setLoading(true);
      try {
        // FVM vaults where user is beneficiary
        if (filWallet.isConnected) {
          // Factory query happens client-side via ethers.js
          // Will populate once factory is deployed
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaryVaults();
  }, [btcWallet.isConnected, filWallet.isConnected, isAnyWalletConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Header />

      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#0090FF]">
            <span className="h-[1px] w-8 bg-[#0090FF]/60" />
            Beneficiary
          </p>
          <h1 className="text-3xl font-semibold">Your Inheritance Claims</h1>
          <p className="text-white/60">
            Vaults where you are listed as a beneficiary. Claim your legacy when inheritance is triggered.
          </p>
        </div>

        {!isAnyWalletConnected ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">Connect a wallet</h2>
            <p className="text-sm text-white/40">Connect your wallet to view vaults where you are a beneficiary.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#0090FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-xl ${vault.type === 'bitcoin' ? 'text-[#F7931A]' : 'text-[#0090FF]'}`}>
                      {vault.type === 'bitcoin' ? '₿' : '⬡'}
                    </div>
                    <div>
                      <p className="font-medium text-white font-mono text-sm">{vault.address.slice(0, 16)}...</p>
                      <p className="text-xs text-white/40">Owner: {vault.ownerAddress.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#F7931A]">{vault.percentage}%</span>
                    {vault.canClaim ? (
                      <span className="px-3 py-1 rounded-full text-xs bg-green-400/10 border border-green-400/20 text-green-400">
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
