import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy HeritazFactory
  const HeritazFactory = await ethers.getContractFactory("HeritazFactory");
  const factory = await HeritazFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("HeritazFactory deployed to:", factoryAddress);

  // Save deployment info
  const deployment = {
    factory: factoryAddress,
    network: "calibration",
    chainId: 314159,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "calibration.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("Deployment info saved to deployments/calibration.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
