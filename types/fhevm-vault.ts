export enum FHEVMVaultStatus {
  Active = 0,
  GracePeriod = 1,
  Triggered = 2,
  Claimed = 3,
}

export interface FHEVMVaultInfo {
  vaultAddress: string;
  owner: string;
  status: FHEVMVaultStatus;
  checkInInterval: bigint;
  gracePeriod: bigint;
  lastCheckIn: bigint;
  beneficiaryCount: number;
  documentCount: number;
}

export interface CreateFHEVMVaultParams {
  beneficiaries: {
    encryptedAddress: string;
    encryptedPercentage: string;
  }[];
  checkInInterval: number;
  gracePeriod: number;
}

export interface FHEVMVaultEvent {
  type: 'VaultCreated' | 'CheckIn' | 'InheritanceTriggered' | 'LegacyClaimed' | 'DocumentAdded' | 'DocumentRemoved' | 'BeneficiariesUpdated' | 'VaultRevoked';
  timestamp: number;
  data: Record<string, unknown>;
}
