'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { useModal } from 'connectkit';
import { useDisconnect } from 'wagmi';
import { Wallet, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { wallet: filWallet } = useFilecoinWallet();
  const { setOpen: openConnectModal } = useModal();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase">Settings</h1>
          <p className="text-white/60">Manage your wallets and preferences.</p>
        </div>

        {/* Wallet Management */}
        <div className="bg-surface-1 rounded-[30px] p-10 space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D6FF34]" />
            <h2 className="text-lg font-bold uppercase">Wallet Connections</h2>
          </div>

          {/* Filecoin */}
          <div className="flex items-center justify-between bg-surface-2 rounded-[16px] p-5">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⬡</div>
              <div>
                <p className="text-sm font-medium text-white">Filecoin (Calibration)</p>
                {filWallet.isConnected ? (
                  <>
                    <p className="text-xs text-white/40 font-mono">{filWallet.address.slice(0, 16)}...{filWallet.address.slice(-6)}</p>
                    <p className="text-xs text-white/40">{filWallet.balance} tFIL</p>
                  </>
                ) : (
                  <p className="text-xs text-white/40">Not connected</p>
                )}
              </div>
            </div>
            {filWallet.isConnected ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-red-400/60 hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => openConnectModal(true)}
                className="bg-[#D6FF34] text-black rounded-full px-6 py-2 text-[13px] font-bold uppercase tracking-[0.96px]"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-surface-1 rounded-[30px] p-10 space-y-4">
          <h2 className="text-lg font-bold uppercase">Network Information</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Filecoin Network</span>
              <span className="text-white">Calibration (Chain ID: 314159)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">IPFS Storage</span>
              <span className="text-white">Storacha (w3up)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Block Explorer</span>
              <a
                href="https://filecoin-testnet.blockscout.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6FF34] hover:underline"
              >
                Blockscout (Calibration)
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Faucet</span>
              <a
                href="https://faucet.calibnet.chainsafe-fil.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6FF34] hover:underline"
              >
                ChainSafe tFIL Faucet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
