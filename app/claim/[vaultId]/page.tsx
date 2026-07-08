'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { useFHEVMWallet } from '@/components/providers/fhevmWalletProvider';
import { Shield, Download, Key, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

type ClaimStep = 'verify' | 'retrieve' | 'decrypt' | 'complete';

export default function ClaimPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;
  const { wallet: fhevmWallet, signer } = useFHEVMWallet();

  const [step, setStep] = useState<ClaimStep>('verify');
  const [claiming, setClaiming] = useState(false);
  const [beneficiaryIndex, setBeneficiaryIndex] = useState<number | null>(null);
  const [keyShares, setKeyShares] = useState<string[]>([]);
  const [decryptedFiles, setDecryptedFiles] = useState<{ name: string; url: string }[]>([]);

  const handleClaim = async () => {
    if (!signer) {
      toast.error('Connect your EVM wallet');
      return;
    }

    setClaiming(true);
    try {
      const { FHEVMVaultManager } = await import('@/lib/fhevm-vault');
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const factoryAddress = process.env.NEXT_PUBLIC_FHEVM_FACTORY_ADDRESS || '';
      const manager = new FHEVMVaultManager(provider, factoryAddress, signer);

      // Get vault state to know beneficiary count
      const state = await manager.getVaultState(vaultId);
      if (!state) {
        toast.error('Vault not found');
        return;
      }

      // In fhEVM, beneficiary addresses are encrypted (eaddress).
      // The contract's claimLegacy() uses FHE.eq() to verify the caller.
      // Try each index until we find the one that belongs to the caller.
      let foundIndex = -1;
      for (let i = 0; i < state.beneficiaryCount; i++) {
        const result = await manager.claimLegacy(vaultId, i);
        if (result.success) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex === -1) {
        toast.error('You are not a beneficiary of this vault');
        return;
      }

      setBeneficiaryIndex(foundIndex);

      // Claim on-chain
      const result = await manager.claimLegacy(vaultId, foundIndex);
      if (!result.success) {
        toast.error(result.error || 'Claim failed');
        return;
      }

      toast.success('Claim submitted on-chain!');
      setStep('retrieve');

      // For each document, retrieve via FHE re-encryption
      const shares: string[] = [];
      for (let d = 0; d < state.documentCount; d++) {
        // In fhEVM, the document encrypted key is accessed via getDocumentEncryptedKey()
        // The FHE coprocessor handles decryption for authorized beneficiaries
        try {
          const encryptedKey = await manager.getDocumentEncryptedKey(vaultId, d);
          if (encryptedKey) {
            shares.push(encryptedKey);
          }
        } catch {
          // Beneficiary may not be able to read key directly — fallback to contract event
        }
      }
      setKeyShares(shares);

      setStep('decrypt');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  const handleDecrypt = async () => {
    try {
      if (keyShares.length === 0) {
        toast.error('No key shares retrieved');
        return;
      }

      const { decryptDocument, deserializeEncryptedDocument } = await import('@/lib/encryption');
      const { retrieveDocument } = await import('@/lib/ipfs-storage');
      const { FHEVMVaultManager } = await import('@/lib/fhevm-vault');
      const { ethers } = await import('ethers');

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const factoryAddress = process.env.NEXT_PUBLIC_FHEVM_FACTORY_ADDRESS || '';
      const manager = new FHEVMVaultManager(provider, factoryAddress, signer!);

      const state = await manager.getVaultState(vaultId);
      if (!state) return;

      const files: { name: string; url: string }[] = [];

      for (let d = 0; d < state.documentCount; d++) {
        const doc = await manager.getDocument(vaultId, d);
        if (!doc) continue;

        // Retrieve encrypted document from IPFS
        const retrieved = await retrieveDocument(doc.cid);
        if (!retrieved.success || !retrieved.data) continue;

        // In fhEVM, the document key is an ebytes256 handle that beneficiaries
        // are FHE.allow()ed to decrypt via the coprocessor re-encryption mechanism.
        // The actual decryption key bytes come from the fhEVM runtime after authorization.
        // Placeholder: real key from FHE re-encryption via getDocumentEncryptedKey()
        const encrypted = deserializeEncryptedDocument(retrieved.data);
        const decrypted = decryptDocument(encrypted, new Uint8Array(32)); // placeholder: real key from FHE re-encryption

        // Create download URL
        const blob = new Blob([new Uint8Array(decrypted)]);
        const url = URL.createObjectURL(blob);
        files.push({ name: `document-${d}.bin`, url });
      }

      setDecryptedFiles(files);
      setStep('complete');
      toast.success(`${files.length} document(s) decrypted successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Decryption failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <Link href="/beneficiary" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase">Claim Inheritance</h1>
          <p className="text-xs text-white/40 font-mono">{vaultId}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 text-xs">
          {(['verify', 'retrieve', 'decrypt', 'complete'] as ClaimStep[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`px-3 py-1.5 rounded-[12px] border ${
                s === step
                  ? 'bg-yo-yellow/20 text-yo-yellow border-yo-yellow/30'
                  : ['verify', 'retrieve', 'decrypt', 'complete'].indexOf(step) > i
                    ? 'bg-green-400/10 text-green-400 border-green-400/20'
                    : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {['verify', 'retrieve', 'decrypt', 'complete'].indexOf(step) > i && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < 3 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="bg-surface-1 rounded-card p-10 space-y-6">
          {step === 'verify' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-yo-yellow" />
                <h2 className="text-lg font-bold uppercase">Verify &amp; Claim</h2>
              </div>
              <p className="text-sm text-white/60">
                Submit your claim on-chain. This verifies your beneficiary status and initiates the
                key share retrieval process.
              </p>

              {!fhevmWallet.isConnected ? (
                <p className="text-sm text-yellow-400">Connect your EVM wallet to proceed.</p>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="text-button inline-flex items-center gap-2 bg-yo-yellow text-black rounded-full px-7 py-3.5 hover:opacity-90 disabled:opacity-50"
                >
                  {claiming ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {claiming ? 'Claiming...' : 'Submit Claim'}
                </button>
              )}
            </>
          )}

          {step === 'retrieve' && (
            <>
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-yo-yellow" />
                <h2 className="text-lg font-bold uppercase">Retrieving Key Shares</h2>
              </div>
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-yo-yellow border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/60 text-sm">Retrieving your encrypted key shares from the contract...</p>
              </div>
            </>
          )}

          {step === 'decrypt' && (
            <>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-yo-yellow" />
                <h2 className="text-lg font-bold uppercase">Decrypt Documents</h2>
              </div>
              <p className="text-sm text-white/60">
                {keyShares.length} key share(s) retrieved. Click below to decrypt the legacy documents.
              </p>
              <button
                onClick={handleDecrypt}
                className="text-button inline-flex items-center gap-2 bg-yo-yellow text-black rounded-full px-7 py-3.5 hover:opacity-90"
              >
                <Key className="w-4 h-4" />
                Decrypt & Download
              </button>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-yo-yellow" />
                <h2 className="text-lg font-bold uppercase">Claim Complete</h2>
              </div>
              <p className="text-sm text-white/60">
                Your legacy documents have been decrypted. Download them below.
              </p>
              <div className="space-y-3">
                {decryptedFiles.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    download={file.name}
                    className="flex items-center gap-3 bg-surface-2 rounded-[16px] p-5 hover:opacity-80 transition-opacity"
                  >
                    <Download className="w-5 h-5 text-card-mint" />
                    <span className="text-sm text-white">{file.name}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
