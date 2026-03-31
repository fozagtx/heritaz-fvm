'use client';

import React, { ReactNode } from 'react';
import { BitcoinWalletProvider } from './bitcoinWalletProvider';
import { FilecoinWalletProvider } from './filecoinWalletProvider';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Unified wallet provider wrapping both Bitcoin and Filecoin wallet contexts.
 * Features gate on which wallet is connected.
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <BitcoinWalletProvider>
      <FilecoinWalletProvider>
        {children}
      </FilecoinWalletProvider>
    </BitcoinWalletProvider>
  );
};
