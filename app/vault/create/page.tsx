'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider';
import { useModal } from 'connectkit';
import { Shield, Clock, Check, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Step = 'beneficiaries' | 'timing' | 'confirm';

interface BeneficiaryInput {
  wallet: string;
  percentage: number;
}

const STEPS: Step[] = ['beneficiaries', 'timing', 'confirm'];

export default function CreateVaultPage() {
  const router = useRouter();
  const { wallet: fhevmWallet, signer, initializing } = useFHEVMWallet();
  const { setOpen: openConnectModal } = useModal();

  const [step, setStep] = useState<Step>('beneficiaries');
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryInput[]>([
    { wallet: '', percentage: 100 },
  ]);
  const [checkInDays, setCheckInDays] = useState(30);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const [creating, setCreating] = useState(false);

  const currentStepIndex = STEPS.indexOf(step);
  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  const canProceed = () => {
    switch (step) {
      case 'beneficiaries':
        return (
          beneficiaries.length > 0 &&
          beneficiaries.every(b => b.wallet.length > 0 && b.percentage > 0) &&
          totalPercentage === 100
        );
      case 'timing':
        return checkInDays >= 1 && gracePeriodDays >= 1;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { wallet: '', percentage: 0 }]);
  };

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length <= 1) return;
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const updateBeneficiary = (index: number, field: keyof BeneficiaryInput, value: string | number) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaries(updated);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      if (!signer) {
        toast.error('Connect your EVM wallet first');
        return;
      }

      const { FHEVMVaultManager } = await import('@/lib/fhevm-vault');
      const { ethers } = await import('ethers');

      const factoryAddress = process.env.NEXT_PUBLIC_FHEVM_FACTORY_ADDRESS || '';

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const manager = new FHEVMVaultManager(provider, factoryAddress, signer);

      // In fhEVM, beneficiaries are encrypted addresses (eaddress) with encrypted percentages (euint8).
      // The FHE encryption happens on-chain via the coprocessor.
      // For the UI, we pass plain addresses and the fhEVM SDK handles encryption.
      // Right now we pass the beneficiary addresses as padded bytes (the fhEVM test harness
      // will encrypt them via the coprocessor).

      const result = await manager.createVault({
        beneficiaries: beneficiaries.map(b => ({
          encryptedAddress: ethers.zeroPadValue(b.wallet as `0x${string}`, 32),
          encryptedPercentage: ethers.zeroPadValue(ethers.toBeHex(b.percentage), 32),
        })),
        checkInInterval: checkInDays * 86400,
        gracePeriod: gracePeriodDays * 86400,
      });

      if (result.success && result.vaultAddress) {
        toast.success('Vault created successfully!');
        router.push(`/vault/${result.vaultAddress}`);
      } else {
        toast.error(result.error || 'Failed to create vault');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Creation failed');
    } finally {
      setCreating(false);
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

  if (!fhevmWallet.isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex flex-col items-center justify-center pt-48 space-y-4">
          <Shield className="w-12 h-12 text-white/20" />
          <p className="text-white/50">Connect your wallet to create a vault</p>
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

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-yo-yellow text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase">Create Inheritance Vault</h1>
          <p className="text-white/60">Set up a new vault to protect your digital legacy on Filecoin.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-xs font-medium transition-colors ${
                  i <= currentStepIndex
                    ? 'bg-yo-yellow/20 text-yo-yellow border border-yo-yellow/30'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {i < currentStepIndex ? <Check className="w-3 h-3" /> : null}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-10 rounded-card bg-surface-1 space-y-6">
          {step === 'beneficiaries' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase">Beneficiaries</h2>
                <button
                  onClick={addBeneficiary}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-white/10 hover:border-yo-yellow/30 text-white/60 hover:text-yo-yellow transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {beneficiaries.map((ben, i) => (
                  <div key={i} className="p-5 rounded-[16px] bg-surface-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-stat-label">Beneficiary {i + 1}</p>
                      {beneficiaries.length > 1 && (
                        <button onClick={() => removeBeneficiary(i)} className="text-red-400/60 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">
                        Ethereum Address
                      </label>
                      <input
                        type="text"
                        value={ben.wallet}
                        onChange={(e) => updateBeneficiary(i, 'wallet', e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-surface-3 border border-white/10 rounded-[8px] text-white text-sm font-mono focus:outline-none focus:border-yo-yellow/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Percentage (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ben.percentage}
                        onChange={(e) => updateBeneficiary(i, 'percentage', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 bg-surface-3 border border-white/10 rounded-[8px] text-white text-sm focus:outline-none focus:border-yo-yellow/50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`text-sm ${totalPercentage === 100 ? 'text-yo-yellow' : 'text-red-400'}`}>
                Total: {totalPercentage}% {totalPercentage !== 100 && '(must equal 100%)'}
              </div>
            </>
          )}

          {step === 'timing' && (
            <>
              <h2 className="text-lg font-bold uppercase">Check-in Schedule</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Check-in Interval</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={checkInDays}
                      onChange={(e) => setCheckInDays(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 bg-surface-2 border border-white/10 rounded-[8px] text-white text-sm focus:outline-none focus:border-yo-yellow/50"
                    />
                    <span className="text-white/60 text-sm">days</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    How often you must check in to prove you&apos;re alive. Missing this triggers the grace period.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Grace Period</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={gracePeriodDays}
                      onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 bg-surface-2 border border-white/10 rounded-[8px] text-white text-sm focus:outline-none focus:border-yo-yellow/50"
                    />
                    <span className="text-white/60 text-sm">days</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Extra time after missed check-in before beneficiaries can trigger inheritance.
                  </p>
                </div>

                <div className="p-4 rounded-[16px] bg-surface-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yo-yellow" />
                    <span className="text-sm font-medium text-white">Timeline Preview</span>
                  </div>
                  <div className="text-xs text-white/60 space-y-1">
                    <p>Check-in every <span className="text-white">{checkInDays} days</span></p>
                    <p>Grace period: <span className="text-white">{gracePeriodDays} days</span> after missed check-in</p>
                    <p>
                      Total before trigger:{' '}
                      <span className="text-yo-yellow font-bold">
                        {checkInDays + gracePeriodDays} days
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h2 className="text-lg font-bold uppercase">Confirm Vault</h2>

              <div className="space-y-4">
                <div className="p-5 rounded-[16px] bg-surface-2 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stat-label">Network</span>
                    <span className="text-sm text-white">fhEVM Network</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stat-label">Beneficiaries</span>
                    <span className="text-sm text-white">{beneficiaries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stat-label">Check-in Interval</span>
                    <span className="text-sm text-white">{checkInDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stat-label">Grace Period</span>
                    <span className="text-sm text-white">{gracePeriodDays} days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-stat-label">Beneficiaries:</p>
                  {beneficiaries.map((b, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-[8px] bg-surface-2">
                      <span className="text-xs text-white/60 font-mono">{b.wallet.slice(0, 16)}...</span>
                      <span className="text-xs text-yo-yellow font-bold">{b.percentage}%</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-white/30">
                  After creating, you can upload encrypted legacy documents from the vault detail page.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(STEPS[currentStepIndex - 1])}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step === 'confirm' ? (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="text-button inline-flex items-center gap-2 bg-yo-yellow text-black rounded-full px-7 py-3.5 hover:opacity-80 disabled:opacity-50"
            >
              {creating ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {creating ? 'Creating...' : 'Create Vault'}
            </button>
          ) : (
            <button
              onClick={() => setStep(STEPS[currentStepIndex + 1])}
              disabled={!canProceed()}
              className="text-button inline-flex items-center gap-2 bg-yo-yellow/20 text-yo-yellow border border-yo-yellow/30 rounded-full px-6 py-2.5 hover:bg-yo-yellow/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
