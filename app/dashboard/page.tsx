'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider';
import { useModal } from 'connectkit';
import { Shield, Clock, FileText, Plus, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const { wallet: fhevmWallet, initializing } = useFHEVMWallet();
  const { setOpen: openConnectModal } = useModal();
  const router = useRouter();
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const isConnected = fhevmWallet.isConnected;

  useEffect(() => {
    if (initializing || !isConnected) return;

    const fetchVaults = async () => {
      setLoading(true);
      try {
        const allVaults: VaultSummary[] = [];

        // Fetch vaults if EVM wallet is connected
        if (fhevmWallet.isConnected) {
          try {
            const { FHEVMVaultManager } = await import('@/lib/fhevm-vault');
            const { ethers } = await import('ethers');
            const factoryAddress = process.env.NEXT_PUBLIC_FHEVM_FACTORY_ADDRESS || '';
            if (factoryAddress) {
              const provider = new ethers.BrowserProvider(window.ethereum!);
              const manager = new FHEVMVaultManager(provider, factoryAddress);
              const vaultAddresses = await manager.getVaultsByOwner(fhevmWallet.address);
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
            console.error('Failed to fetch vaults:', e);
          }
        }

        setVaults(allVaults);
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [fhevmWallet.isConnected, fhevmWallet.address, isConnected]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-yo-yellow bg-yo-yellow/10 border-yo-yellow/30';
      case 'graceperiod': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'triggered': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'claimed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex flex-col items-center justify-center pt-48 space-y-4">
          <Shield className="w-12 h-12 text-white/20" />
          <p className="text-white/50">Connect your wallet to view your dashboard</p>
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

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yo-yellow/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-14 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-[13px] font-bold uppercase tracking-[1.2px] text-yo-yellow">
              Dashboard
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold uppercase text-white leading-tight">
              Vault Dashboard
            </h1>
            <p className="text-lg text-white/60 max-w-2xl">
              Manage your confidential inheritance vaults on Zama fhEVM.
            </p>
          </div>

          <Link
            href="/vault/create"
            className="text-button inline-flex items-center gap-2 bg-yo-yellow text-black rounded-full px-7 py-3.5 hover:opacity-80 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Vault
          </Link>
        </div>

        {/* Wallet Status */}
        <div className="grid grid-cols-1 gap-4">
          <div className={`bg-surface-1 rounded-card p-6 ${fhevmWallet.isConnected ? 'border border-yo-yellow/30' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">⬡</div>
              <div>
                <p className="text-sm font-medium text-white">fhEVM Network {fhevmWallet.isConnected ? '' : '(Not Connected)'}</p>
                {fhevmWallet.isConnected ? (
                  <>
                    <p className="text-xs text-white/60 font-mono">{fhevmWallet.address.slice(0, 10)}...{fhevmWallet.address.slice(-6)}</p>
                    <p className="text-xs text-white/40">{fhevmWallet.balance} tFIL</p>
                  </>
                ) : (
                  <p className="text-xs text-white/40">Connect wallet to view vaults</p>
                )}
              </div>
              {fhevmWallet.isConnected && <CheckCircle2 className="w-4 h-4 text-yo-yellow ml-auto" />}
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
            <div key={stat.label} className="bg-surface-1 rounded-[20px] p-6 border-t-[3px] border-yo-yellow">
              <stat.icon className="w-5 h-5 text-white/40 mb-2" />
              <p className="text-stat">{stat.value}</p>
              <p className="text-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Vault List */}
        {!isConnected ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">Connect a wallet to get started</h2>
            <p className="text-sm text-white/40">Connect your EVM wallet to view and manage your vaults.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-yo-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading vaults...</p>
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/60 mb-2">No vaults yet</h2>
            <p className="text-sm text-white/40 mb-6">Create your first inheritance vault to protect your digital legacy.</p>
            <Link
              href="/vault/create"
              className="text-button inline-flex items-center gap-2 bg-yo-yellow text-black rounded-full px-7 py-3.5 hover:opacity-80 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create Your First Vault
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-bold uppercase text-white">Your Vaults</h2>
            {vaults.map((vault) => (
              <Link
                key={vault.id}
                href={`/vault/${vault.address}`}
                className="block bg-surface-1 rounded-card p-5 hover:bg-surface-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl text-yo-yellow">
                      ⬡
                    </div>
                    <div>
                      <p className="font-medium text-white">{vault.id.slice(0, 16)}...</p>
                      <p className="text-xs text-white/40 capitalize">Confidential vault</p>
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
