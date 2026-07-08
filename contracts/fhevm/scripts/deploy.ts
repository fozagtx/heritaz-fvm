import { ethers } from "hardhat";

/**
 * Deploy the HeritazConfidentialFactory to a fhEVM-compatible chain.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network fhevmTestnet
 */
async function main() {
  console.log("Deploying Heritaz Confidential Inheritance contracts...");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy factory
  const Factory = await ethers.getContractFactory("HeritazConfidentialFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("\n=== Deployment Complete ===");
  console.log("HeritazConfidentialFactory:", factoryAddress);

  // Save deployment info
  const fs = require("fs");
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    factory: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deployDir = __dirname + "/../deployments";
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  fs.writeFileSync(
    deployDir + "/fhevm-testnet.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("Deployment saved to deployments/fhevm-testnet.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
