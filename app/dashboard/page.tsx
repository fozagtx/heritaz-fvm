'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { Shield, Clock, FileText, Plus, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface VaultSummary {
  id: string;
  type: 'filecoin';
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

  const isAnyWalletConnected = filWallet.isConnected;

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
  }, [filWallet.isConnected, filWallet.address, isAnyWalletConnected]);

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
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D6FF34]/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-14 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-[#D6FF34]">
              Dashboard
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold uppercase text-white leading-tight">
              Vault Dashboard
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Manage your inheritance vaults on Filecoin.
            </p>
          </div>

          <Link
            href="/vault/create"
            className="inline-flex items-center gap-2 bg-[#D6FF34] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Vault
          </Link>
        </div>

        {/* Wallet Status */}
        <div className="grid grid-cols-1 gap-4">
          <div className={`bg-surface-1 rounded-[30px] p-6 ${filWallet.isConnected ? 'border border-[#D6FF34]/30' : ''}`}>
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
              {filWallet.isConnected && <CheckCircle2 className="w-4 h-4 text-[#D6FF34] ml-auto" />}
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
            <div key={stat.label} className="bg-surface-1 rounded-[20px] p-6 border-t-[3px] border-[#D6FF34]">
              <stat.icon className="w-5 h-5 text-white/40 mb-2" />
              <p className="text-[40px] font-bold text-[#D6FF34]">{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Vault List */}
        {!isAnyWalletConnected ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">Connect a wallet to get started</h2>
            <p className="text-sm text-white/40">Connect your Filecoin wallet to view and manage your vaults.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D6FF34] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">No vaults yet</h2>
            <p className="text-sm text-white/40 mb-6">Create your first inheritance vault to protect your digital legacy.</p>
            <Link
              href="/vault/create"
              className="inline-flex items-center gap-2 bg-[#D6FF34] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 transition-opacity"
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
                href={`/vault/${vault.address}`}
                className="block bg-surface-1 rounded-[30px] p-5 hover:bg-surface-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl text-[#D6FF34]">
                      ⬡
                    </div>
                    <div>
                      <p className="font-medium text-white">{vault.id.slice(0, 16)}...</p>
                      <p className="text-xs text-white/40 capitalize">Filecoin vault</p>
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
