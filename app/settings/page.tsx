'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';
import { useFilecoinWallet } from '@/components/providers/filecoinWalletProvider';
import { Settings, Wallet, CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const { wallet: btcWallet, connectWallet: connectBtc, disconnectWallet: disconnectBtc } = useBitcoinWallet();
  const { wallet: filWallet, connectWallet: connectFil, disconnectWallet: disconnectFil } = useFilecoinWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <Header />

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-14 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-white/60">Manage your wallets and preferences.</p>
        </div>

        {/* Wallet Management */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#F7931A]" />
            <h2 className="text-lg font-medium">Wallet Connections</h2>
          </div>

          {/* Bitcoin */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="text-2xl">₿</div>
              <div>
                <p className="text-sm font-medium text-white">Bitcoin Wallet</p>
                {btcWallet.isConnected ? (
                  <p className="text-xs text-white/40 font-mono">{btcWallet.address.slice(0, 16)}...{btcWallet.address.slice(-6)}</p>
                ) : (
                  <p className="text-xs text-white/40">Not connected</p>
                )}
              </div>
            </div>
            {btcWallet.isConnected ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <button
                  onClick={disconnectBtc}
                  className="text-xs text-red-400/60 hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectBtc()}
                className="px-4 py-1.5 text-xs rounded-lg bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/30 hover:bg-[#F7931A]/30"
              >
                Connect
              </button>
            )}
          </div>

          {/* Filecoin */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
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
                  onClick={disconnectFil}
                  className="text-xs text-red-400/60 hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectFil}
                className="px-4 py-1.5 text-xs rounded-lg bg-[#0090FF]/20 text-[#0090FF] border border-[#0090FF]/30 hover:bg-[#0090FF]/30"
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>

        {/* Network Info */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-lg font-medium">Network Information</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Bitcoin Network</span>
              <span className="text-white">Testnet</span>
            </div>
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
                className="text-[#0090FF] hover:underline"
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
                className="text-[#0090FF] hover:underline"
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
