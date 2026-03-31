import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import type {
  FVMVaultInfo,
  FVMBeneficiary,
  CreateFVMVaultParams,
  FVMVaultStatus,
} from '@/types/fvm-vault';

// ABI subsets — in production, import from Hardhat artifacts
const FACTORY_ABI = [
  "function createVault(tuple(address wallet, string btcAddress, uint8 percentage, bytes32 publicKeyHash)[] _beneficiaries, uint256 _checkInInterval, uint256 _gracePeriod, string _btcVaultId) external returns (address)",
  "function getVaultsByOwner(address owner) external view returns (address[])",
  "function getVaultsByBeneficiary(address beneficiary) external view returns (address[])",
  "function getAllVaults() external view returns (address[])",
  "function getVaultCount() external view returns (uint256)",
  "event VaultDeployed(address indexed owner, address indexed vault, uint256 timestamp)",
];

const VAULT_ABI = [
  "function checkIn() external",
  "function addLegacyDocument(string cid, bytes[] encryptedKeyShares) external",
  "function removeLegacyDocument(uint256 index) external",
  "function triggerInheritance() external",
  "function claimLegacy(uint256 beneficiaryIndex) external",
  "function updateBeneficiaries(tuple(address wallet, string btcAddress, uint8 percentage, bytes32 publicKeyHash)[] newBeneficiaries) external",
  "function emergencyRevoke() external",
  "function getVaultInfo() external view returns (address vaultOwner, uint8 vaultStatus, uint256 _checkInInterval, uint256 _gracePeriod, uint256 _lastCheckIn, string _btcVaultId, uint256 beneficiaryCount, uint256 documentCount)",
  "function getBeneficiary(uint256 index) external view returns (tuple(address wallet, string btcAddress, uint8 percentage, bytes32 publicKeyHash))",
  "function getBeneficiaryCount() external view returns (uint256)",
  "function getDocumentCount() external view returns (uint256)",
  "function getDocument(uint256 index) external view returns (string cid, uint256 timestamp)",
  "function getBeneficiaryKeyShares(uint256 docIndex, uint256 benIndex) external view returns (bytes)",
  "function getDeadlineTimestamp() external view returns (uint256)",
  "function getGraceDeadlineTimestamp() external view returns (uint256)",
  "function isExpired() external view returns (bool)",
  "function isTriggerable() external view returns (bool)",
  "function status() external view returns (uint8)",
  "event VaultCreated(address indexed owner, uint256 checkInInterval, uint256 gracePeriod)",
  "event CheckIn(address indexed owner, uint256 timestamp)",
  "event InheritanceTriggered(address indexed triggeredBy, uint256 timestamp)",
  "event LegacyClaimed(address indexed beneficiary, uint256 beneficiaryIndex)",
  "event DocumentAdded(string cid, uint256 timestamp)",
  "event DocumentRemoved(uint256 index, uint256 timestamp)",
  "event BeneficiariesUpdated(uint256 count)",
  "event VaultRevoked(address indexed owner, uint256 timestamp)",
];

// Filecoin Calibration testnet
const CALIBRATION_CHAIN_ID = 314159;
const CALIBRATION_RPC = 'https://api.calibration.node.glif.io/rpc/v1';

export class FVMVaultManager {
  private provider: BrowserProvider | ethers.JsonRpcProvider;
  private signer: Signer | null = null;
  private factoryAddress: string;

  constructor(
    provider: BrowserProvider | ethers.JsonRpcProvider,
    factoryAddress: string,
    signer?: Signer
  ) {
    this.provider = provider;
    this.factoryAddress = factoryAddress;
    this.signer = signer || null;
  }

  async setSigner(signer: Signer) {
    this.signer = signer;
  }

  private getFactory(withSigner = false): Contract {
    const signerOrProvider = withSigner && this.signer ? this.signer : this.provider;
    return new Contract(this.factoryAddress, FACTORY_ABI, signerOrProvider);
  }

  private getVault(address: string, withSigner = false): Contract {
    const signerOrProvider = withSigner && this.signer ? this.signer : this.provider;
    return new Contract(address, VAULT_ABI, signerOrProvider);
  }

  /**
   * Create a new vault through the factory
   */
  async createVault(params: CreateFVMVaultParams): Promise<{
    success: boolean;
    vaultAddress?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const factory = this.getFactory(true);
      const tx = await factory.createVault(
        params.beneficiaries.map(b => ({
          wallet: b.wallet,
          btcAddress: b.btcAddress,
          percentage: b.percentage,
          publicKeyHash: b.publicKeyHash,
        })),
        params.checkInInterval,
        params.gracePeriod,
        params.btcVaultId
      );

      const receipt = await tx.wait();

      // Extract vault address from VaultDeployed event
      const event = receipt.logs.find(
        (log: any) => {
          try {
            const parsed = factory.interface.parseLog({ topics: log.topics, data: log.data });
            return parsed?.name === 'VaultDeployed';
          } catch { return false; }
        }
      );

      let vaultAddress: string | undefined;
      if (event) {
        const parsed = factory.interface.parseLog({ topics: event.topics, data: event.data });
        vaultAddress = parsed?.args?.vault;
      }

      return {
        success: true,
        vaultAddress,
        txHash: receipt.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create vault',
      };
    }
  }

  /**
   * Owner check-in to reset the dead-man's switch
   */
  async checkIn(vaultAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.checkIn();
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Check-in failed',
      };
    }
  }

  /**
   * Trigger inheritance after deadline + grace period has passed
   */
  async triggerInheritance(vaultAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.triggerInheritance();
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Trigger failed',
      };
    }
  }

  /**
   * Beneficiary claims their legacy
   */
  async claimLegacy(vaultAddress: string, beneficiaryIndex: number): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.claimLegacy(beneficiaryIndex);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Claim failed',
      };
    }
  }

  /**
   * Add a legacy document CID + encrypted key shares on-chain
   */
  async addLegacyDocument(
    vaultAddress: string,
    cid: string,
    encryptedKeyShares: Uint8Array[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.addLegacyDocument(cid, encryptedKeyShares);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add document',
      };
    }
  }

  /**
   * Remove a legacy document
   */
  async removeLegacyDocument(
    vaultAddress: string,
    index: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.removeLegacyDocument(index);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove document',
      };
    }
  }

  /**
   * Update vault beneficiaries
   */
  async updateBeneficiaries(
    vaultAddress: string,
    beneficiaries: FVMBeneficiary[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.updateBeneficiaries(
        beneficiaries.map(b => ({
          wallet: b.wallet,
          btcAddress: b.btcAddress,
          percentage: b.percentage,
          publicKeyHash: b.publicKeyHash,
        }))
      );
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update beneficiaries',
      };
    }
  }

  /**
   * Emergency revoke the vault
   */
  async emergencyRevoke(vaultAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!this.signer) return { success: false, error: 'Wallet not connected' };

      const vault = this.getVault(vaultAddress, true);
      const tx = await vault.emergencyRevoke();
      const receipt = await tx.wait();

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Revoke failed',
      };
    }
  }

  /**
   * Get full vault state
   */
  async getVaultState(vaultAddress: string): Promise<FVMVaultInfo | null> {
    try {
      const vault = this.getVault(vaultAddress);
      const info = await vault.getVaultInfo();

      return {
        vaultAddress,
        owner: info.vaultOwner,
        status: Number(info.vaultStatus) as FVMVaultStatus,
        checkInInterval: info._checkInInterval,
        gracePeriod: info._gracePeriod,
        lastCheckIn: info._lastCheckIn,
        btcVaultId: info._btcVaultId,
        beneficiaryCount: Number(info.beneficiaryCount),
        documentCount: Number(info.documentCount),
      };
    } catch (error) {
      console.error('Error getting vault state:', error);
      return null;
    }
  }

  /**
   * Get all vault addresses owned by an address
   */
  async getVaultsByOwner(ownerAddress: string): Promise<string[]> {
    try {
      const factory = this.getFactory();
      return await factory.getVaultsByOwner(ownerAddress);
    } catch (error) {
      console.error('Error getting vaults by owner:', error);
      return [];
    }
  }

  /**
   * Get all vault addresses where address is beneficiary
   */
  async getVaultsByBeneficiary(beneficiaryAddress: string): Promise<string[]> {
    try {
      const factory = this.getFactory();
      return await factory.getVaultsByBeneficiary(beneficiaryAddress);
    } catch (error) {
      console.error('Error getting vaults by beneficiary:', error);
      return [];
    }
  }

  /**
   * Get beneficiary details from a vault
   */
  async getBeneficiary(vaultAddress: string, index: number): Promise<FVMBeneficiary | null> {
    try {
      const vault = this.getVault(vaultAddress);
      const ben = await vault.getBeneficiary(index);
      return {
        wallet: ben.wallet,
        btcAddress: ben.btcAddress,
        percentage: Number(ben.percentage),
        publicKeyHash: ben.publicKeyHash,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get document details from a vault
   */
  async getDocument(vaultAddress: string, index: number): Promise<{ cid: string; timestamp: number } | null> {
    try {
      const vault = this.getVault(vaultAddress);
      const doc = await vault.getDocument(index);
      return { cid: doc.cid, timestamp: Number(doc.timestamp) };
    } catch {
      return null;
    }
  }

  /**
   * Get a beneficiary's key share for a document
   */
  async getBeneficiaryKeyShare(
    vaultAddress: string,
    docIndex: number,
    benIndex: number
  ): Promise<Uint8Array | null> {
    try {
      const vault = this.getVault(vaultAddress, true);
      const share = await vault.getBeneficiaryKeyShares(docIndex, benIndex);
      return ethers.getBytes(share);
    } catch {
      return null;
    }
  }

  /**
   * Check if vault deadline has passed
   */
  async isExpired(vaultAddress: string): Promise<boolean> {
    try {
      const vault = this.getVault(vaultAddress);
      return await vault.isExpired();
    } catch {
      return false;
    }
  }

  /**
   * Check if vault can be triggered
   */
  async isTriggerable(vaultAddress: string): Promise<boolean> {
    try {
      const vault = this.getVault(vaultAddress);
      return await vault.isTriggerable();
    } catch {
      return false;
    }
  }

  /**
   * Get deadline timestamp
   */
  async getDeadlineTimestamp(vaultAddress: string): Promise<number> {
    try {
      const vault = this.getVault(vaultAddress);
      const deadline = await vault.getDeadlineTimestamp();
      return Number(deadline);
    } catch {
      return 0;
    }
  }

  /**
   * Listen for vault events (contract event polling — reliable fallback)
   */
  onVaultEvent(
    vaultAddress: string,
    eventName: string,
    callback: (...args: any[]) => void
  ): () => void {
    const vault = this.getVault(vaultAddress);
    vault.on(eventName, callback);
    return () => {
      vault.off(eventName, callback);
    };
  }

  /**
   * Create a read-only provider for Calibration testnet
   */
  static createReadOnlyProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(CALIBRATION_RPC, {
      name: 'filecoin-calibration',
      chainId: CALIBRATION_CHAIN_ID,
    });
  }
}

export default FVMVaultManager;
