"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Wallet, ExternalLink, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface WalletOption {
  id: string
  name: string
  description: string
  icon: string
  installUrl: string
  isInstalled: boolean
}

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBitcoinWalletSelect: (walletId: 'unisat' | 'leather' | 'xverse' | 'okx') => Promise<void>
  onFilecoinConnect: () => Promise<void>
  onWalletSelect?: (walletId: 'unisat' | 'leather' | 'xverse' | 'okx') => Promise<void>
}

type Tab = 'filecoin' | 'bitcoin'

export function WalletModal({ open, onOpenChange, onBitcoinWalletSelect, onFilecoinConnect, onWalletSelect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [selectedWallet, setSelectedWallet] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<Tab>('filecoin')

  const handleBtcSelect = onBitcoinWalletSelect || onWalletSelect

  const bitcoinWallets: WalletOption[] = React.useMemo(() => {
    if (typeof window === 'undefined') return []
    return [
      {
        id: 'unisat',
        name: 'Unisat',
        description: 'Popular Bitcoin wallet with ordinals support',
        icon: '🟠',
        installUrl: 'https://unisat.io',
        isInstalled: !!(window as any).unisat,
      },
      {
        id: 'leather',
        name: 'Leather',
        description: 'Stacks & Bitcoin wallet by Hiro',
        icon: '🔶',
        installUrl: 'https://leather.io',
        isInstalled: !!(window as any).LeatherProvider || !!(window as any).HiroWalletProvider,
      },
      {
        id: 'xverse',
        name: 'Xverse',
        description: 'Bitcoin, Ordinals & Stacks wallet',
        icon: '💜',
        installUrl: 'https://www.xverse.app/',
        isInstalled: !!(window as any).xverse || !!(window as any).XverseProviders,
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        description: 'Multi-chain wallet by OKX',
        icon: '⚫',
        installUrl: 'https://www.okx.com/web3',
        isInstalled: !!(window as any).okxwallet?.bitcoin,
      },
    ]
  }, [])

  const filecoinWallets: WalletOption[] = React.useMemo(() => {
    if (typeof window === 'undefined') return []
    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        description: 'Connect to Filecoin Calibration testnet',
        icon: '🦊',
        installUrl: 'https://metamask.io',
        isInstalled: !!(window as any).ethereum,
      },
    ]
  }, [])

  const handleBitcoinClick = async (wallet: WalletOption) => {
    if (!wallet.isInstalled) {
      toast.info(`${wallet.name} not detected. Opening installation page...`)
      window.open(wallet.installUrl, '_blank')
      return
    }

    setIsConnecting(true)
    setSelectedWallet(wallet.id)

    try {
      if (handleBtcSelect) {
        await handleBtcSelect(wallet.id as 'unisat' | 'leather' | 'xverse' | 'okx')
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleFilecoinClick = async (wallet: WalletOption) => {
    if (!wallet.isInstalled) {
      toast.info(`${wallet.name} not detected. Opening installation page...`)
      window.open(wallet.installUrl, '_blank')
      return
    }

    setIsConnecting(true)
    setSelectedWallet(wallet.id)

    try {
      await onFilecoinConnect()
      onOpenChange(false)
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const currentWallets = activeTab === 'bitcoin' ? bitcoinWallets : filecoinWallets
  const handleClick = activeTab === 'bitcoin' ? handleBitcoinClick : handleFilecoinClick

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-1 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-5 h-5 text-[#D6FF34]" />
            <span className="text-white font-bold uppercase">
              Connect Wallet
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/45">
            Connect your wallet to use Heritaz
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[12px] bg-surface-2 border border-white/10">
          <button
            onClick={() => setActiveTab('filecoin')}
            className={`flex-1 px-4 py-2 rounded-[8px] text-[13px] font-bold uppercase tracking-[0.96px] transition-colors ${
              activeTab === 'filecoin'
                ? 'bg-[#D6FF34] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Filecoin
          </button>
          <button
            onClick={() => setActiveTab('bitcoin')}
            className={`flex-1 px-4 py-2 rounded-[8px] text-[13px] font-bold uppercase tracking-[0.96px] transition-colors ${
              activeTab === 'bitcoin'
                ? 'bg-[#D6FF34] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Bitcoin
          </button>
        </div>

        <div className="grid gap-3 py-4">
          {currentWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleClick(wallet)}
              disabled={isConnecting}
              className={`
                group relative flex items-center gap-4 p-4 rounded-[16px] border transition-all duration-300
                ${wallet.isInstalled
                  ? 'border-white/10 bg-surface-2 hover:bg-surface-3 hover:border-[#D6FF34]/50 cursor-pointer'
                  : 'border-white/5 bg-surface-2/50 cursor-pointer hover:border-white/10'
                }
                ${isConnecting && selectedWallet === wallet.id ? 'opacity-50' : ''}
                disabled:opacity-50
              `}
            >
              <div className="text-4xl flex-shrink-0">{wallet.icon}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{wallet.name}</h3>
                  {wallet.isInstalled && (
                    <CheckCircle2 className="w-4 h-4 text-card-mint" />
                  )}
                </div>
                <p className="text-sm text-white/45">{wallet.description}</p>
              </div>
              {!wallet.isInstalled ? (
                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#D6FF34] transition-colors" />
              ) : isConnecting && selectedWallet === wallet.id ? (
                <div className="w-5 h-5 border-2 border-[#D6FF34] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-[#D6FF34] transition-colors" />
              )}
            </button>
          ))}
        </div>

        {/* Testnet Badge */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-1">
          <div className="px-3 py-1 rounded-full bg-[#D6FF34]/10 border border-[#D6FF34]/20">
            <span className="text-xs text-[#D6FF34] font-bold uppercase tracking-[1.2px]">Testnet Mode</span>
          </div>
        </div>

        <p className="text-xs text-center text-white/30 pt-2">
          By connecting, you agree to our Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  )
}
