'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { Shield, Clock, Users, FileText, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface VaultDetail {
  address: string;
  owner: string;
  status: number;
  statusLabel: string;
  checkInInterval: number;
  gracePeriod: number;
  lastCheckIn: number;
  btcVaultId: string;
  beneficiaryCount: number;
  documentCount: number;
  deadline: number;
  graceDeadline: number;
  isExpired: boolean;
  isTriggerable: boolean;
}

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = params.id as string;
  const { wallet: filWallet, signer } = useFilecoinWallet();
  const [vault, setVault] = useState<VaultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    const fetchVault = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/fvm/vault-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vaultAddress: vaultId }),
        });
        const data = await res.json();
        if (data.success) {
          setVault(data.vault);
        }
      } catch (error) {
        console.error('Failed to fetch vault:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultId]);

  const handleCheckIn = async () => {
    if (!signer) {
      toast.error('Connect Filecoin wallet to check in');
      return;
    }

    setCheckingIn(true);
    try {
      const { FVMVaultManager } = await import('@/lib/fvm-vault');
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const factoryAddress = process.env.NEXT_PUBLIC_FVM_FACTORY_ADDRESS || '';
      const manager = new FVMVaultManager(provider, factoryAddress, signer);

      const result = await manager.checkIn(vaultId);
      if (result.success) {
        toast.success('Check-in successful!');
        // Refresh vault state
        window.location.reload();
      } else {
        toast.error(result.error || 'Check-in failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'graceperiod': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'triggered': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Shield className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'border-t-green-400';
      case 'graceperiod': return 'border-t-yellow-400';
      case 'triggered': return 'border-t-red-400';
      default: return 'border-t-white/20';
    }
  };

  const formatTimestamp = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts * 1000).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days} days`;
    const hours = Math.floor(seconds / 3600);
    return `${hours} hours`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D6FF34] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading vault...</p>
          </div>
        ) : !vault ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold uppercase text-white/60">Vault not found</h2>
          </div>
        ) : (
          <>
            {/* Vault Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(vault.statusLabel)}
                  <h1 className="text-2xl font-bold uppercase">Vault Details</h1>
                </div>
                <p className="font-mono text-xs text-white/45">{vault.address}</p>
              </div>

              {vault.statusLabel === 'Active' && filWallet.isConnected && vault.owner === filWallet.address && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="inline-flex items-center gap-2 bg-[#D6FF34] text-black rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.96px] hover:opacity-80 disabled:opacity-50"
                >
                  {checkingIn ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {checkingIn ? 'Checking in...' : 'Check In'}
                </button>
              )}
            </div>

            {/* Status + Timing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`bg-surface-1 rounded-[20px] p-6 border-t-2 ${getStatusBorderColor(vault.statusLabel)}`}>
                <Shield className="w-5 h-5 text-white/40 mb-2" />
                <p className="text-lg font-semibold text-white">{vault.statusLabel}</p>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Vault Status</p>
              </div>
              <div className={`bg-surface-1 rounded-[20px] p-6 border-t-2 ${getStatusBorderColor(vault.statusLabel)}`}>
                <Clock className="w-5 h-5 text-white/40 mb-2" />
                <p className="text-lg font-semibold text-white">{formatDuration(vault.checkInInterval)}</p>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Check-in Interval</p>
              </div>
              <div className={`bg-surface-1 rounded-[20px] p-6 border-t-2 ${getStatusBorderColor(vault.statusLabel)}`}>
                <Users className="w-5 h-5 text-white/40 mb-2" />
                <p className="text-lg font-semibold text-white">{vault.beneficiaryCount}</p>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Beneficiaries</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-surface-1 rounded-[30px] p-10 space-y-4">
              <h2 className="text-lg font-bold uppercase">Vault Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Owner</span>
                  <span className="font-mono text-xs text-white/45">{vault.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Last Check-in</span>
                  <span className="text-white">{formatTimestamp(vault.lastCheckIn)}</span>
                </div>
                {vault.deadline > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Next Deadline</span>
                    <span className={vault.isExpired ? 'text-red-400' : 'text-white'}>{formatTimestamp(vault.deadline)}</span>
                  </div>
                )}
                {vault.gracePeriod > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Grace Period</span>
                    <span className="text-white">{formatDuration(vault.gracePeriod)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/45">Legacy Documents</span>
                  <span className="text-white">{vault.documentCount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/vault/${vaultId}/legacy`}
                className="inline-flex items-center gap-2 bg-surface-2 rounded-full px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.96px] text-text-primary hover:opacity-80"
              >
                <FileText className="w-4 h-4" />
                Manage Documents
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
