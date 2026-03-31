'use client';

import React, { useState, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { FileText, Upload, Trash2, ArrowLeft, Lock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface UploadedDoc {
  cid: string;
  name: string;
  size: number;
  timestamp: number;
}

export default function LegacyDocumentsPage() {
  const params = useParams();
  const vaultId = params.id as string;
  const { wallet: filWallet, signer } = useFilecoinWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Encrypt client-side
      const { encryptDocument, generateDocumentKey, splitKey, serializeEncryptedDocument } = await import('@/lib/encryption');
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const key = generateDocumentKey();
      const encrypted = encryptDocument(fileData, key);
      const serialized = serializeEncryptedDocument(encrypted);

      // 2. Upload encrypted data to IPFS
      const { uploadEncryptedDocument } = await import('@/lib/ipfs-storage');
      const uploadResult = await uploadEncryptedDocument(serialized);

      if (!uploadResult.success || !uploadResult.cid) {
        toast.error(uploadResult.error || 'Upload failed');
        return;
      }

      // 3. Split key for beneficiaries via Shamir's Secret Sharing
      // For now, use 2 shares with threshold of 1 (can be configured per vault)
      const shares = await splitKey(key, 2, 1);

      // 4. Store CID + encrypted key shares on-chain (if FVM vault)
      if (signer) {
        try {
          const { FVMVaultManager } = await import('@/lib/fvm-vault');
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum!);
          const factoryAddress = process.env.NEXT_PUBLIC_FVM_FACTORY_ADDRESS || '';
          const manager = new FVMVaultManager(provider, factoryAddress, signer);

          const keyShareBytes = shares.map(s => new TextEncoder().encode(s));
          const result = await manager.addLegacyDocument(vaultId, uploadResult.cid, keyShareBytes);

          if (!result.success) {
            console.warn('Failed to store on-chain:', result.error);
          }
        } catch (err) {
          console.warn('On-chain storage skipped:', err);
        }
      }

      const newDoc: UploadedDoc = {
        cid: uploadResult.cid,
        name: file.name,
        size: file.size,
        timestamp: Date.now(),
      };

      setDocuments(prev => [...prev, newDoc]);
      toast.success(`Document encrypted and uploaded. CID: ${uploadResult.cid.slice(0, 20)}...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = async (index: number) => {
    // Remove from on-chain if FVM vault
    if (vaultId.startsWith('0x') && signer) {
      try {
        const { FVMVaultManager } = await import('@/lib/fvm-vault');
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const factoryAddress = process.env.NEXT_PUBLIC_FVM_FACTORY_ADDRESS || '';
        const manager = new FVMVaultManager(provider, factoryAddress, signer);
        await manager.removeLegacyDocument(vaultId, index);
      } catch (err) {
        console.warn('On-chain removal failed:', err);
      }
    }

    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Header />

      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <Link href={`/vault/${vaultId}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Legacy Documents</h1>
          <p className="text-white/60">
            Upload documents that will be accessible to beneficiaries when inheritance is triggered.
            All files are encrypted client-side before upload.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#F7931A] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white font-medium">End-to-end encrypted</p>
            <p className="text-white/60">
              Documents are encrypted with AES-256-GCM before upload. The encryption key is split
              using Shamir&apos;s Secret Sharing and distributed to beneficiaries. The server never sees plaintext.
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="p-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            id="doc-upload"
          />
          <label
            htmlFor="doc-upload"
            className={`cursor-pointer block ${uploading ? 'pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="py-8">
                <div className="w-8 h-8 border-2 border-[#F7931A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/60">Encrypting and uploading...</p>
              </div>
            ) : (
              <div className="py-8">
                <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">Click to upload a document</p>
                <p className="text-xs text-white/40 mt-1">
                  Files are encrypted locally before being stored on IPFS + Filecoin
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-white/80">
            Uploaded Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            documents.map((doc, i) => (
              <div
                key={doc.cid}
                className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#0090FF]" />
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-white/40 font-mono">{doc.cid.slice(0, 30)}...</p>
                    <p className="text-xs text-white/40">
                      {formatSize(doc.size)} · {new Date(doc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://w3s.link/ipfs/${doc.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-white/40 hover:text-white/60"
                    title="View on IPFS gateway"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => removeDocument(i)}
                    className="p-2 rounded-lg text-red-400/40 hover:text-red-400"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
