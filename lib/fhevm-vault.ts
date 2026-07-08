import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import type {
  FHEVMVaultInfo,
  CreateFHEVMVaultParams,
  FHEVMVaultStatus,
} from '@/types/fhevm-vault';

// ABI for the fhEVM Confidential Factory
const FACTORY_ABI = [
  "function createVault(bytes[] _beneficiaries, bytes[] _percentages, uint256 _checkInInterval, uint256 _gracePeriod) external returns (address)",
  "function getVaultsByOwner(address owner) external view returns (address[])",
  "function getVaultsByBeneficiary(address beneficiary) external view returns (address[])",
  "function getAllVaults() external view returns (address[])",
  "function getVaultCount() external view returns (uint256)",
  "event VaultDeployed(address indexed owner, address indexed vault, uint256 timestamp)",
];

// ABI for the Confidential Vault
const VAULT_ABI = [
  "function checkIn() external",
  "function addLegacyDocument(string cid, bytes encryptedKey) external",
  "function removeLegacyDocument(uint256 index) external",
  "function triggerInheritance() external",
  "function claimLegacy(uint256 beneficiaryIndex) external",
  "function updateBeneficiaries(bytes[] newBeneficiaries, bytes[] newPercentages) external",
  "function emergencyRevoke() external",
  "function getVaultInfo() external view returns (address vaultOwner, uint8 vaultStatus, uint256 _checkInInterval, uint256 _gracePeriod, uint256 _lastCheckIn, uint256 beneficiaryCount, uint256 documentCount)",
  "function getBeneficiary(uint256 index) external view returns (bytes wallet, bytes percentage)",
  "function getBeneficiaryCount() external view returns (uint256)",
  "function getDocumentCount() external view returns (uint256)",
  "function getDocument(uint256 index) external view returns (string cid, uint256 timestamp)",
  "function getDocumentEncryptedKey(uint256 index) external view returns (bytes)",
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

// Default fhEVM testnet chain info
const FHEVM_CHAIN_ID = Number(process.env.NEXT_PUBLIC_FHEVM_CHAIN_ID || 9000);
const FHEVM_RPC = process.env.NEXT_PUBLIC_FHEVM_RPC_URL || 'https://devnet.zama.ai';

export class FHEVMVaultManager {
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

  private getSigner(): Signer {
    if (!this.signer) {
      throw new Error('Signer not set — connect wallet first');
    }
    return this.signer;
  }

  private getFactory(withSigner = true): Contract {
    const runner = withSigner ? this.getSigner() : this.provider;
    return new Contract(this.factoryAddress, FACTORY_ABI, runner);
  }

  private getVault(vaultAddress: string, withSigner = true): Contract {
    const runner = withSigner ? this.getSigner() : this.provider;
    return new Contract(vaultAddress, VAULT_ABI, runner);
  }

  /**
   * Create a new confidential inheritance vault
   */
  async createVault(params: CreateFHEVMVaultParams): Promise<{
    success: boolean;
    vaultAddress?: string;
    error?: string;
  }> {
    try {
      const factory = this.getFactory();
      const beneficiaryAddresses = params.beneficiaries.map(b => b.encryptedAddress);
      const beneficiaryPercentages = params.beneficiaries.map(b => b.encryptedPercentage);

      const tx = await factory.createVault(
        beneficiaryAddresses,
        beneficiaryPercentages,
        params.checkInInterval,
        params.gracePeriod
      );
      const receipt = await tx.wait();

      // Find the VaultDeployed event
      const event = receipt!.logs.find(
        (log: any) => log.eventName === 'VaultDeployed'
      );
      const vaultAddress = event?.args?.vault;

      return {
        success: true,
        vaultAddress: vaultAddress || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.reason || error?.message || 'Unknown error',
      };
    }
  }

  /**
   * Check in to reset the deadline timer
   */
  async checkIn(vaultAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.getVault(vaultAddress);
      const tx = await vault.checkIn();
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.reason || error?.message };
    }
  }

  /**
   * Add a legacy document with its encrypted key
   */
  async addLegacyDocument(
    vaultAddress: string,
    cid: string,
    encryptedKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.getVault(vaultAddress);
      const tx = await vault.addLegacyDocument(cid, encryptedKey);
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.reason || error?.message };
    }
  }

  /**
   * Remove a legacy document
   */
  async removeLegacyDocument(
    vaultAddress: string,
    index: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.getVault(vaultAddress);
      const tx = await vault.removeLegacyDocument(index);
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.reason || error?.message };
    }
  }

  /**
   * Trigger inheritance (anyone can call if owner missed check-in)
   */
  async triggerInheritance(vaultAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.getVault(vaultAddress);
      const tx = await vault.triggerInheritance();
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.reason || error?.message };
    }
  }

  /**
   * Claim legacy as a beneficiary
   */
  async claimLegacy(
    vaultAddress: string,
    beneficiaryIndex: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.getVault(vaultAddress);
      const tx = await vault.claimLegacy(beneficiaryIndex);
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.reason || error?.message };
    }
  }

  /**
   * Get full vault state (read-only)
   */
  async getVaultState(vaultAddress: string): Promise<FHEVMVaultInfo | null> {
    try {
      const vault = this.getVault(vaultAddress, false);
      const info = await vault.getVaultInfo();
      return {
        vaultAddress,
        owner: info.vaultOwner,
        status: Number(info.vaultStatus) as FHEVMVaultStatus,
        checkInInterval: info._checkInInterval,
        gracePeriod: info._gracePeriod,
        lastCheckIn: info._lastCheckIn,
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
   * Get document metadata from a vault
   */
  async getDocument(vaultAddress: string, index: number): Promise<{ cid: string; timestamp: number } | null> {
    try {
      const vault = this.getVault(vaultAddress, false);
      const doc = await vault.getDocument(index);
      return { cid: doc.cid, timestamp: Number(doc.timestamp) };
    } catch {
      return null;
    }
  }

  /**
   * Get the FHE-encrypted document key for a specific document.
   * Only authorized beneficiaries (via FHE.allow()) can decrypt this.
   */
  async getDocumentEncryptedKey(vaultAddress: string, index: number): Promise<string | null> {
    try {
      const vault = this.getVault(vaultAddress, true);
      const key = await vault.getDocumentEncryptedKey(index);
      return key;
    } catch {
      return null;
    }
  }

  /**
   * Check if vault deadline has passed
   */
  async isExpired(vaultAddress: string): Promise<boolean> {
    try {
      const vault = this.getVault(vaultAddress, false);
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
      const vault = this.getVault(vaultAddress, false);
      return await vault.isTriggerable();
    } catch {
      return false;
    }
  }

  /**
   * Create a read-only provider for the fhEVM network
   */
  static createReadOnlyProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(FHEVM_RPC, {
      name: 'fhevm-testnet',
      chainId: FHEVM_CHAIN_ID,
    });
  }
}

export default FHEVMVaultManager;
