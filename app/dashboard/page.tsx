'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { Shield, Clock, FileText, Plus, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface VaultSummary {
  id: string;
  type: 'bitcoin' | 'filecoin';
  status: string;
  deadline?: number;
  beneficiaryCount: number;
  documentCount?: number;
  address?: string;
}

export default function DashboardPage() {
  const { wallet: btcWallet } = useBitcoinWallet();
  const { wallet: filWallet } = useFilecoinWallet();
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const isAnyWalletConnected = btcWallet.isConnected || filWallet.isConnected;

  useEffect(() => {
    if (!isAnyWalletConnected) return;

    const fetchVaults = async () => {
      setLoading(true);
      try {
        const allVaults: VaultSummary[] = [];

        // Fetch FVM vaults if Filecoin wallet is connected
        if (filWallet.isConnected) {
          try {
            const { FVMVaultManager } = await import('@/lib/fvm-vault');
            const { ethers } = await import('ethers');
            const factoryAddress = process.env.NEXT_PUBLIC_FVM_FACTORY_ADDRESS || '';
            if (factoryAddress) {
              const provider = new ethers.BrowserProvider(window.ethereum!);
              const manager = new FVMVaultManager(provider, factoryAddress);
              const vaultAddresses = await manager.getVaultsByOwner(filWallet.address);
              for (const addr of vaultAddresses) {
                const state = await manager.getVaultState(addr);
                if (state) {
                  allVaults.push({
                    id: addr,
                    type: 'filecoin',
                    status: ['Active', 'GracePeriod', 'Triggered', 'Claimed'][state.status],
                    beneficiaryCount: state.beneficiaryCount,
                    documentCount: state.documentCount,
                    address: addr,
                  });
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch FVM vaults:', e);
          }
        }

        setVaults(allVaults);
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [btcWallet.isConnected, btcWallet.address, filWallet.isConnected, filWallet.address, isAnyWalletConnected]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'graceperiod': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'triggered': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'claimed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-[#F7931A]/10 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-[#0090FF]/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-14 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#F7931A]">
              <span className="h-[1px] w-8 bg-[#F7931A]/60" />
              Dashboard
            </p>
            <h1 className="text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Vault Dashboard
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Manage your inheritance vaults across Bitcoin and Filecoin networks.
            </p>
          </div>

          <Link
            href="/vault/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F7931A] to-orange-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Vault
          </Link>
        </div>

        {/* Wallet Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${btcWallet.isConnected ? 'border-[#F7931A]/30 bg-[#F7931A]/5' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">₿</div>
              <div>
                <p className="text-sm font-medium text-white">Bitcoin {btcWallet.isConnected ? '' : '(Not Connected)'}</p>
                {btcWallet.isConnected ? (
                  <p className="text-xs text-white/60 font-mono">{btcWallet.address.slice(0, 12)}...{btcWallet.address.slice(-6)}</p>
                ) : (
                  <p className="text-xs text-white/40">Connect to view Bitcoin vaults</p>
                )}
              </div>
              {btcWallet.isConnected && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${filWallet.isConnected ? 'border-[#0090FF]/30 bg-[#0090FF]/5' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">⬡</div>
              <div>
                <p className="text-sm font-medium text-white">Filecoin Calibration {filWallet.isConnected ? '' : '(Not Connected)'}</p>
                {filWallet.isConnected ? (
                  <>
                    <p className="text-xs text-white/60 font-mono">{filWallet.address.slice(0, 10)}...{filWallet.address.slice(-6)}</p>
                    <p className="text-xs text-white/40">{filWallet.balance} tFIL</p>
                  </>
                ) : (
                  <p className="text-xs text-white/40">Connect MetaMask for FVM vaults</p>
                )}
              </div>
              {filWallet.isConnected && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Vaults', value: vaults.length, icon: Shield },
            { label: 'Active', value: vaults.filter(v => v.status === 'Active').length, icon: CheckCircle2 },
            { label: 'Needs Attention', value: vaults.filter(v => ['GracePeriod', 'Triggered'].includes(v.status)).length, icon: AlertTriangle },
            { label: 'Documents', value: vaults.reduce((sum, v) => sum + (v.documentCount || 0), 0), icon: FileText },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <stat.icon className="w-5 h-5 text-white/40 mb-2" />
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Vault List */}
        {!isAnyWalletConnected ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">Connect a wallet to get started</h2>
            <p className="text-sm text-white/40">Connect your Bitcoin or Filecoin wallet to view and manage your vaults.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#F7931A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">No vaults yet</h2>
            <p className="text-sm text-white/40 mb-6">Create your first inheritance vault to protect your digital legacy.</p>
            <Link
              href="/vault/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F7931A] to-orange-600 text-white font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Vault
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white/80">Your Vaults</h2>
            {vaults.map((vault) => (
              <Link
                key={vault.id}
                href={vault.type === 'filecoin' ? `/vault/${vault.address}` : `/vault/${vault.id}`}
                className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-xl ${vault.type === 'bitcoin' ? 'text-[#F7931A]' : 'text-[#0090FF]'}`}>
                      {vault.type === 'bitcoin' ? '₿' : '⬡'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{vault.id.slice(0, 16)}...</p>
                      <p className="text-xs text-white/40 capitalize">{vault.type} vault</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(vault.status)}`}>
                      {vault.status}
                    </span>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">{vault.beneficiaryCount}</p>
                      <p className="text-xs text-white/40">Beneficiaries</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
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
