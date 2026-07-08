import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

/**
 * fhEVM testnet — a Zama-managed chain with FHE coprocessor support.
 * Replace with your target fhEVM-compatible chain.
 */
export const fhevmTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_FHEVM_CHAIN_ID || 9000),
  name: process.env.NEXT_PUBLIC_FHEVM_CHAIN_NAME || 'fhEVM Testnet',
  nativeCurrency: {
    name: 'Test Token',
    symbol: 'tFHE',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_FHEVM_RPC_URL || 'https://devnet.zama.ai'] },
  },
  blockExplorers: {
    default: { name: 'Zama Explorer', url: process.env.NEXT_PUBLIC_FHEVM_EXPLORER_URL || 'https://explorer.zama.ai' },
  },
  testnet: true,
});

export const config = createConfig(
  getDefaultConfig({
    chains: [fhevmTestnet],
    transports: {
      [fhevmTestnet.id]: http(process.env.NEXT_PUBLIC_FHEVM_RPC_URL || 'https://devnet.zama.ai'),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo',
    appName: 'Heritaz',
    appDescription: 'Confidential Digital Inheritance on Zama fhEVM',
  })
);
