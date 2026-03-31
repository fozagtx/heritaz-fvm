import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

export const filecoinCalibration = defineChain({
  id: 314159,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    name: 'Test Filecoin',
    symbol: 'tFIL',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://filecoin-testnet.blockscout.com' },
  },
  testnet: true,
});

export const config = createConfig(
  getDefaultConfig({
    chains: [filecoinCalibration],
    transports: {
      [filecoinCalibration.id]: http('https://api.calibration.node.glif.io/rpc/v1'),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
    appName: 'Heritaz',
    appDescription: 'Digital Legacy Platform on Filecoin',
  })
);
