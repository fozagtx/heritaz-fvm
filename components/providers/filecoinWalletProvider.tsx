'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserProvider, Signer } from 'ethers';
import { toast } from 'sonner';

const CALIBRATION_CHAIN_ID = '0x4CB2F'; // 314159 in hex
const CALIBRATION_CHAIN_CONFIG = {
  chainId: CALIBRATION_CHAIN_ID,
  chainName: 'Filecoin Calibration',
  nativeCurrency: {
    name: 'Test Filecoin',
    symbol: 'tFIL',
    decimals: 18,
  },
  rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
  blockExplorerUrls: ['https://filecoin-testnet.blockscout.com/'],
};

interface FilecoinWalletContextType {
  wallet: {
    isConnected: boolean;
    address: string;
    chainId: number;
    balance: string;
  };
  provider: BrowserProvider | null;
  signer: Signer | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const FilecoinWalletContext = createContext<FilecoinWalletContextType | null>(null);

export const useFilecoinWallet = () => {
  const context = useContext(FilecoinWalletContext);
  if (!context) {
    throw new Error('useFilecoinWallet must be used within FilecoinWalletProvider');
  }
  return context;
};

interface FilecoinWalletProviderProps {
  children: ReactNode;
}

export const FilecoinWalletProvider: React.FC<FilecoinWalletProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [wallet, setWallet] = useState<FilecoinWalletContextType['wallet']>({
    isConnected: false,
    address: '',
    chainId: 0,
    balance: '0',
  });

  const switchToCalibration = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CALIBRATION_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added yet — add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CALIBRATION_CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Calibration network:', addError);
          toast.error('Failed to add Filecoin Calibration network');
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Install MetaMask to connect Filecoin wallet.');
      return;
    }

    setIsLoading(true);
    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      // Switch to Calibration testnet
      const switched = await switchToCalibration();
      if (!switched) return;

      const browserProvider = new BrowserProvider(window.ethereum);
      const walletSigner = await browserProvider.getSigner();
      const address = await walletSigner.getAddress();
      const balance = await browserProvider.getBalance(address);
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setWallet({
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        balance: (Number(balance) / 1e18).toFixed(4),
      });

      toast.success(`Connected to Filecoin Calibration: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error) {
      console.error('Filecoin wallet connection error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [switchToCalibration]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setWallet({
      isConnected: false,
      address: '',
      chainId: 0,
      balance: '0',
    });
    toast.success('Filecoin wallet disconnected');
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (wallet.isConnected) {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = () => {
      // Reload on chain change to reset provider state
      if (wallet.isConnected) {
        window.location.reload();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet.isConnected, disconnectWallet]);

  return (
    <FilecoinWalletContext.Provider
      value={{ wallet, provider, signer, isLoading, connectWallet, disconnectWallet }}
    >
      {children}
    </FilecoinWalletContext.Provider>
  );
};

// Extend Window for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
