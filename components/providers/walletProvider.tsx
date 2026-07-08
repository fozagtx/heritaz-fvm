'use client';

import React, { ReactNode } from 'react';
import { Web3Provider } from './web3Provider';
import { BitcoinWalletProvider } from './bitcoinWalletProvider';
import { FHEVMWalletProvider } from './fhevmWalletProvider';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <BitcoinWalletProvider>
      <Web3Provider>
        <FHEVMWalletProvider>
          {children}
        </FHEVMWalletProvider>
      </Web3Provider>
    </BitcoinWalletProvider>
  );
};
