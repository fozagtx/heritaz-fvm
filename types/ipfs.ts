export interface EncryptedDocument {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
}

export interface KeyShare {
  index: number;
  share: string;
  beneficiaryAddress: string;
}

export interface DocumentBundle {
  encryptedData: EncryptedDocument;
  cid: string;
  keyShares: KeyShare[];
  originalName: string;
  originalSize: number;
  uploadedAt: number;
}

export interface StorageReceipt {
  cid: string;
  size: number;
  uploadedAt: number;
  filecoinDealId?: string;
}

export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  error?: string;
  receipt?: StorageReceipt;
}

export interface IPFSRetrieveResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
}
