'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { config } from '@/lib/web3-config';

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            '--ck-font-family': '"Space Grotesk", sans-serif',
            '--ck-accent-color': '#D6FF34',
            '--ck-accent-text-color': '#000000',
            '--ck-body-background': '#1D1E19',
            '--ck-body-color': '#EDEDED',
            '--ck-body-color-muted': 'rgba(255,255,255,0.45)',
            '--ck-primary-button-background': '#D6FF34',
            '--ck-primary-button-color': '#000000',
            '--ck-primary-button-border-radius': '9999px',
            '--ck-secondary-button-background': '#262722',
            '--ck-secondary-button-color': '#EDEDED',
            '--ck-secondary-button-border-radius': '9999px',
            '--ck-overlay-background': 'rgba(0,0,0,0.8)',
            '--ck-modal-box-shadow': '0 0 80px rgba(214,255,52,0.08)',
            '--ck-border-radius': '30px',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
