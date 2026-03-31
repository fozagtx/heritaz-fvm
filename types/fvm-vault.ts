export enum FVMVaultStatus {
  Active = 0,
  GracePeriod = 1,
  Triggered = 2,
  Claimed = 3,
}

export interface FVMBeneficiary {
  wallet: string;
  btcAddress: string;
  percentage: number;
  publicKeyHash: string;
}

export interface FVMLegacyDocument {
  cid: string;
  encryptedKeyShares: string[];
  timestamp: number;
}

export interface FVMVaultInfo {
  vaultAddress: string;
  owner: string;
  status: FVMVaultStatus;
  checkInInterval: bigint;
  gracePeriod: bigint;
  lastCheckIn: bigint;
  btcVaultId: string;
  beneficiaryCount: number;
  documentCount: number;
}

export interface CreateFVMVaultParams {
  beneficiaries: FVMBeneficiary[];
  checkInInterval: number; // seconds
  gracePeriod: number; // seconds
  btcVaultId: string;
}

export interface FVMVaultEvent {
  type: 'VaultCreated' | 'CheckIn' | 'InheritanceTriggered' | 'LegacyClaimed' | 'DocumentAdded' | 'DocumentRemoved' | 'BeneficiariesUpdated' | 'VaultRevoked';
  timestamp: number;
  data: Record<string, unknown>;
}
