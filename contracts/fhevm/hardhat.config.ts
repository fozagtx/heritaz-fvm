import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    fhevmTestnet: {
      url: process.env.FHEVM_RPC_URL || "https://devnet.zama.ai",
      chainId: process.env.FHEVM_CHAIN_ID ? parseInt(process.env.FHEVM_CHAIN_ID) : 9000,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
