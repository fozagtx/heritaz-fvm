import { expect } from "chai";
import { ethers } from "hardhat";
import { HeritazConfidentialFactory, HeritazConfidentialVault } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FHE } from "@fhevm/solidity/lib/FHE.sol";

describe("HeritazConfidentialVault", function () {
  let factory: HeritazConfidentialFactory;
  let owner: HardhatEthersSigner;
  let beneficiary1: HardhatEthersSigner;
  let beneficiary2: HardhatEthersSigner;
  let outsider: HardhatEthersSigner;

  const ONE_DAY = 86400;
  const ONE_HOUR = 3600;
  const CHECK_IN_INTERVAL = 30 * ONE_DAY;
  const GRACE_PERIOD = 7 * ONE_DAY;

  /**
   * Helper: create an encrypted address handle for a given address.
   * In a real fhEVM environment, this would use the coprocessor to encrypt.
   * For testing, we use the test helper to create encrypted inputs.
   */
  async function encryptAddress(addr: string): Promise<string> {
    // This simulates FHE encryption — in real fhEVM tests,
    // you'd use FHE.encryptAddress() or the test harness
    return ethers.zeroPadValue(addr, 32);
  }

  async function encryptUint8(value: number): Promise<string> {
    return ethers.zeroPadValue(ethers.toBeHex(value), 32);
  }

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2, outsider] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("HeritazConfidentialFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();
  });

  describe("Factory", function () {
    it("should deploy a vault through the factory", async function () {
      const ben1Enc = await encryptAddress(beneficiary1.address);
      const ben2Enc = await encryptAddress(beneficiary2.address);
      const pct1 = await encryptUint8(60);
      const pct2 = await encryptUint8(40);

      const tx = await factory.createVault(
        [ben1Enc, ben2Enc],
        [pct1, pct2],
        CHECK_IN_INTERVAL,
        GRACE_PERIOD
      );
      const receipt = await tx.wait();

      const vaults = await factory.getVaultsByOwner(owner.address);
      expect(vaults.length).to.equal(1);
    });

    it("should index vaults by beneficiary", async function () {
      const ben1Enc = await encryptAddress(beneficiary1.address);
      const ben2Enc = await encryptAddress(beneficiary2.address);
      const pct1 = await encryptUint8(60);
      const pct2 = await encryptUint8(40);

      await factory.createVault([ben1Enc, ben2Enc], [pct1, pct2], CHECK_IN_INTERVAL, GRACE_PERIOD);

      const ben1Vaults = await factory.getVaultsByBeneficiary(beneficiary1.address);
      const ben2Vaults = await factory.getVaultsByBeneficiary(beneficiary2.address);
      expect(ben1Vaults.length).to.equal(1);
      expect(ben2Vaults.length).to.equal(1);
    });
  });

  describe("Vault Lifecycle", function () {
    let vault: HeritazConfidentialVault;

    beforeEach(async function () {
      const ben1Enc = await encryptAddress(beneficiary1.address);
      const ben2Enc = await encryptAddress(beneficiary2.address);
      const pct1 = await encryptUint8(60);
      const pct2 = await encryptUint8(40);

      const tx = await factory.createVault(
        [ben1Enc, ben2Enc],
        [pct1, pct2],
        CHECK_IN_INTERVAL,
        GRACE_PERIOD
      );
      await tx.wait();

      const vaults = await factory.getVaultsByOwner(owner.address);
      vault = await ethers.getContractAt("HeritazConfidentialVault", vaults[0]);
    });

    it("should initialize with correct state", async function () {
      const info = await vault.getVaultInfo();
      expect(info.vaultOwner).to.equal(owner.address);
      expect(info.vaultStatus).to.equal(0); // Active
      expect(info.beneficiaryCount).to.equal(2n);
    });

    it("should allow owner to check in", async function () {
      const tx = await vault.checkIn();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(vault, "CheckIn")
        .withArgs(owner.address, block!.timestamp);
    });

    it("should reject check-in from non-owner", async function () {
      await expect(vault.connect(outsider).checkIn())
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should trigger inheritance after deadline + grace", async function () {
      await ethers.provider.send("evm_increaseTime", [CHECK_IN_INTERVAL + GRACE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(vault.connect(outsider).triggerInheritance())
        .to.emit(vault, "InheritanceTriggered");
    });

    it("should reject trigger if owner checks in", async function () {
      await ethers.provider.send("evm_increaseTime", [20 * ONE_DAY]);
      await ethers.provider.send("evm_mine", []);
      await vault.checkIn();

      await expect(vault.triggerInheritance())
        .to.be.revertedWith("Deadline + grace not passed");
    });

    it("should allow owner to add a legacy document", async function () {
      const testCid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const testKey = await encryptUint8(42); // Simulated encrypted key

      await expect(vault.addLegacyDocument(testCid, testKey))
        .to.emit(vault, "DocumentAdded");

      expect(await vault.getDocumentCount()).to.equal(1n);
    });

    it("should allow owner to update beneficiaries", async function () {
      const newBen1 = await encryptAddress(beneficiary1.address);
      const newPct1 = await encryptUint8(100);

      await expect(vault.updateBeneficiaries([newBen1], [newPct1]))
        .to.emit(vault, "BeneficiariesUpdated")
        .withArgs(1);

      expect(await vault.getBeneficiaryCount()).to.equal(1n);
    });

    it("should allow owner to emergency revoke", async function () {
      await expect(vault.emergencyRevoke())
        .to.emit(vault, "VaultRevoked");

      await expect(vault.checkIn())
        .to.be.revertedWith("Vault is not active");
    });
  });
});
