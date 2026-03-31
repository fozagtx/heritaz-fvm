'use client';

import React, { ReactNode } from 'react';
import { Web3Provider } from './web3Provider';
import { BitcoinWalletProvider } from './bitcoinWalletProvider';
import { FilecoinWalletProvider } from './filecoinWalletProvider';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <BitcoinWalletProvider>
      <Web3Provider>
        <FilecoinWalletProvider>
          {children}
        </FilecoinWalletProvider>
      </Web3Provider>
    </BitcoinWalletProvider>
  );
};
