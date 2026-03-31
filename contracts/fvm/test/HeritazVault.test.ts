import { expect } from "chai";
import { ethers } from "hardhat";
import { HeritazFactory, HeritazVault } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("HeritazVault", function () {
  let factory: HeritazFactory;
  let owner: HardhatEthersSigner;
  let beneficiary1: HardhatEthersSigner;
  let beneficiary2: HardhatEthersSigner;
  let outsider: HardhatEthersSigner;

  const ONE_DAY = 86400;
  const ONE_HOUR = 3600;
  const CHECK_IN_INTERVAL = 30 * ONE_DAY; // 30 days
  const GRACE_PERIOD = 7 * ONE_DAY; // 7 days

  function makeBeneficiaries(ben1Addr: string, ben2Addr: string) {
    return [
      {
        wallet: ben1Addr,
        btcAddress: "tb1qtest1111111111111111111111111111",
        percentage: 60,
        publicKeyHash: ethers.zeroPadValue("0x01", 32),
      },
      {
        wallet: ben2Addr,
        btcAddress: "tb1qtest2222222222222222222222222222",
        percentage: 40,
        publicKeyHash: ethers.zeroPadValue("0x02", 32),
      },
    ];
  }

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2, outsider] = await ethers.getSigners();

    const HeritazFactory = await ethers.getContractFactory("HeritazFactory");
    factory = await HeritazFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Factory", function () {
    it("should deploy a vault through the factory", async function () {
      const bens = makeBeneficiaries(beneficiary1.address, beneficiary2.address);
      const tx = await factory.createVault(bens, CHECK_IN_INTERVAL, GRACE_PERIOD, "btc-vault-1");
      const receipt = await tx.wait();

      const vaults = await factory.getVaultsByOwner(owner.address);
      expect(vaults.length).to.equal(1);
    });

    it("should index vaults by beneficiary", async function () {
      const bens = makeBeneficiaries(beneficiary1.address, beneficiary2.address);
      await factory.createVault(bens, CHECK_IN_INTERVAL, GRACE_PERIOD, "btc-vault-1");

      const ben1Vaults = await factory.getVaultsByBeneficiary(beneficiary1.address);
      const ben2Vaults = await factory.getVaultsByBeneficiary(beneficiary2.address);
      expect(ben1Vaults.length).to.equal(1);
      expect(ben2Vaults.length).to.equal(1);
    });
  });

  describe("Vault Lifecycle", function () {
    let vault: HeritazVault;

    beforeEach(async function () {
      const bens = makeBeneficiaries(beneficiary1.address, beneficiary2.address);
      const tx = await factory.createVault(bens, CHECK_IN_INTERVAL, GRACE_PERIOD, "btc-vault-1");
      await tx.wait();

      const vaults = await factory.getVaultsByOwner(owner.address);
      vault = await ethers.getContractAt("HeritazVault", vaults[0]);
    });

    it("should initialize with correct state", async function () {
      const info = await vault.getVaultInfo();
      expect(info.vaultOwner).to.equal(owner.address);
      expect(info.vaultStatus).to.equal(0); // Active
      expect(info.beneficiaryCount).to.equal(2n);
      expect(info._btcVaultId).to.equal("btc-vault-1");
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

    it("should allow owner to add a legacy document", async function () {
      const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const keyShares = [
        ethers.toUtf8Bytes("share1-encrypted"),
        ethers.toUtf8Bytes("share2-encrypted"),
      ];

      await expect(vault.addLegacyDocument(cid, keyShares))
        .to.emit(vault, "DocumentAdded");

      expect(await vault.getDocumentCount()).to.equal(1n);
    });

    it("should allow owner to remove a legacy document", async function () {
      const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const keyShares = [
        ethers.toUtf8Bytes("share1"),
        ethers.toUtf8Bytes("share2"),
      ];
      await vault.addLegacyDocument(cid, keyShares);

      await expect(vault.removeLegacyDocument(0))
        .to.emit(vault, "DocumentRemoved");

      expect(await vault.getDocumentCount()).to.equal(0n);
    });

    it("should not allow triggering before deadline", async function () {
      await expect(vault.triggerInheritance())
        .to.be.revertedWith("Check-in deadline + grace period not passed");
    });

    it("should allow triggering after deadline + grace period", async function () {
      // Fast forward past check-in interval + grace period
      await ethers.provider.send("evm_increaseTime", [CHECK_IN_INTERVAL + GRACE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(vault.triggerInheritance())
        .to.emit(vault, "InheritanceTriggered");

      expect(await vault.status()).to.equal(2); // Triggered
    });

    it("should allow beneficiary to claim after triggering", async function () {
      // Fast forward and trigger
      await ethers.provider.send("evm_increaseTime", [CHECK_IN_INTERVAL + GRACE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      await vault.triggerInheritance();

      // Beneficiary 1 claims (index 0)
      await expect(vault.connect(beneficiary1).claimLegacy(0))
        .to.emit(vault, "LegacyClaimed")
        .withArgs(beneficiary1.address, 0);
    });

    it("should reject claim from wrong beneficiary", async function () {
      await ethers.provider.send("evm_increaseTime", [CHECK_IN_INTERVAL + GRACE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);
      await vault.triggerInheritance();

      await expect(vault.connect(outsider).claimLegacy(0))
        .to.be.revertedWith("Not authorized beneficiary");
    });

    it("should prevent triggering if owner checks in", async function () {
      // Advance 20 days
      await ethers.provider.send("evm_increaseTime", [20 * ONE_DAY]);
      await ethers.provider.send("evm_mine", []);

      // Owner checks in, resetting the clock
      await vault.checkIn();

      // Try to trigger — should fail because clock was reset
      await expect(vault.triggerInheritance())
        .to.be.revertedWith("Check-in deadline + grace period not passed");
    });

    it("should allow owner to update beneficiaries", async function () {
      const newBens = [
        {
          wallet: beneficiary1.address,
          btcAddress: "tb1qnew111111111111111111111111111",
          percentage: 100,
          publicKeyHash: ethers.zeroPadValue("0x03", 32),
        },
      ];

      await expect(vault.updateBeneficiaries(newBens))
        .to.emit(vault, "BeneficiariesUpdated")
        .withArgs(1);

      expect(await vault.getBeneficiaryCount()).to.equal(1n);
    });

    it("should reject beneficiary update with invalid percentages", async function () {
      const badBens = [
        {
          wallet: beneficiary1.address,
          btcAddress: "tb1q1",
          percentage: 50,
          publicKeyHash: ethers.zeroPadValue("0x01", 32),
        },
      ];

      await expect(vault.updateBeneficiaries(badBens))
        .to.be.revertedWith("Percentages must sum to 100");
    });

    it("should allow owner to emergency revoke", async function () {
      await expect(vault.emergencyRevoke())
        .to.emit(vault, "VaultRevoked");

      // After revoke, check-in should fail
      await expect(vault.checkIn())
        .to.be.revertedWith("Vault is not active");
    });

    it("full lifecycle: create → checkIn → miss → trigger → claim", async function () {
      // Check in once
      await vault.checkIn();

      // Add a document
      const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const keyShares = [
        ethers.toUtf8Bytes("share1"),
        ethers.toUtf8Bytes("share2"),
      ];
      await vault.addLegacyDocument(cid, keyShares);

      // Miss check-in: fast forward past deadline + grace
      await ethers.provider.send("evm_increaseTime", [CHECK_IN_INTERVAL + GRACE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      // Anyone can trigger
      await vault.connect(outsider).triggerInheritance();
      expect(await vault.status()).to.equal(2); // Triggered

      // Beneficiary 1 claims
      await vault.connect(beneficiary1).claimLegacy(0);

      // Beneficiary 1 retrieves their key share
      const share = await vault.connect(beneficiary1).getBeneficiaryKeyShares(0, 0);
      expect(ethers.toUtf8String(share)).to.equal("share1");
    });
  });

  async function getBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp;
  }
});
