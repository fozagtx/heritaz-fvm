'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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
  initializing: boolean;
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
  const [initializing, setInitializing] = useState(true);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [wallet, setWallet] = useState<FilecoinWalletContextType['wallet']>({
    isConnected: false,
    address: '',
    chainId: 0,
    balance: '0',
  });

  // Flag to suppress chain-change handling during intentional connect
  const isConnectingRef = useRef(false);

  const setupWallet = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
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
      return true;
    } catch {
      return false;
    }
  }, []);

  const switchToCalibration = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CALIBRATION_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
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
    isConnectingRef.current = true;
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const switched = await switchToCalibration();
      if (!switched) return;

      const success = await setupWallet();
      if (success) {
        const address = accounts[0];
        toast.success(`Connected to Filecoin Calibration: ${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    } catch (error) {
      console.error('Filecoin wallet connection error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
      // Small delay so any pending chainChanged events from switchToCalibration are ignored
      setTimeout(() => { isConnectingRef.current = false; }, 1000);
    }
  }, [switchToCalibration, setupWallet]);

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

  // Auto-reconnect if MetaMask is already connected
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setInitializing(false);
      return;
    }

    (async () => {
      try {
        const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          await setupWallet();
        }
      } catch (err) {
        console.warn('Auto-reconnect failed:', err);
      } finally {
        setInitializing(false);
      }
    })();
  }, [setupWallet]);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (isConnectingRef.current) return;
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // Re-setup wallet with new account
        setupWallet();
      }
    };

    const handleChainChanged = () => {
      if (isConnectingRef.current) return;
      // Re-setup wallet with new chain instead of reloading
      setupWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet, setupWallet]);

  return (
    <FilecoinWalletContext.Provider
      value={{ wallet, provider, signer, isLoading, initializing, connectWallet, disconnectWallet }}
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
