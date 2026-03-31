'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAccount, useBalance, useConnectorClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';

interface FilecoinWalletContextType {
  wallet: {
    isConnected: boolean;
    address: string;
    chainId: number;
    balance: string;
  };
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isLoading: boolean;
  initializing: boolean;
}

const FilecoinWalletContext = createContext<FilecoinWalletContextType | null>(null);

export const useFilecoinWallet = () => {
  const context = useContext(FilecoinWalletContext);
  if (!context) {
    throw new Error('useFilecoinWallet must be used within FilecoinWalletProvider');
  }
  return context;
};

/** Convert a viem WalletClient to an ethers.js Signer */
function clientToSigner(client: Client<Transport, Chain, Account>): {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
} {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return { provider, signer };
}

interface FilecoinWalletProviderProps {
  children: ReactNode;
}

export const FilecoinWalletProvider: React.FC<FilecoinWalletProviderProps> = ({ children }) => {
  const { address, isConnected, isConnecting, isReconnecting, chain } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { data: connectorClient } = useConnectorClient();

  const initializing = isReconnecting;
  const isLoading = isConnecting;

  const { provider, signer } = useMemo(() => {
    if (!connectorClient) return { provider: null, signer: null };
    try {
      return clientToSigner(connectorClient);
    } catch {
      return { provider: null, signer: null };
    }
  }, [connectorClient]);

  const wallet = useMemo(() => ({
    isConnected,
    address: address || '',
    chainId: chain?.id || 0,
    balance: balanceData ? (Number(balanceData.value) / 1e18).toFixed(4) : '0',
  }), [isConnected, address, chain, balanceData]);

  return (
    <FilecoinWalletContext.Provider
      value={{ wallet, provider, signer, isLoading, initializing }}
    >
      {children}
    </FilecoinWalletContext.Provider>
  );
};

// Keep global type for window.ethereum (used by ethers elsewhere)
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
