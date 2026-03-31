import type { IPFSUploadResult, IPFSRetrieveResult, StorageReceipt } from '@/types/ipfs';

/**
 * Upload encrypted document data to IPFS via server proxy
 * Server handles Storacha credentials; client never sees API keys
 * Storacha stores on Filecoin Calibration testnet with automatic deal creation
 */
export async function uploadEncryptedDocument(data: Uint8Array): Promise<IPFSUploadResult> {
  try {
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data as unknown as BodyInit,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Upload failed' };
    }

    const result = await response.json();
    return {
      success: true,
      cid: result.cid,
      receipt: {
        cid: result.cid,
        size: data.length,
        uploadedAt: Date.now(),
        filecoinDealId: result.dealId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Retrieve document from IPFS by CID via server proxy
 */
export async function retrieveDocument(cid: string): Promise<IPFSRetrieveResult> {
  try {
    const response = await fetch(`/api/ipfs/retrieve?cid=${encodeURIComponent(cid)}`);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Retrieval failed' };
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      success: true,
      data: new Uint8Array(arrayBuffer),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Retrieval failed',
    };
  }
}

/**
 * Upload a file with full encryption pipeline:
 * 1. Read file as Uint8Array
 * 2. Encrypt client-side
 * 3. Upload encrypted data to IPFS
 * 4. Return CID for on-chain storage
 */
export async function uploadFileToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    return await uploadEncryptedDocument(data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File upload failed',
    };
  }
}

/**
 * Get storage status for a CID
 */
export async function getStorageStatus(cid: string): Promise<{
  stored: boolean;
  filecoinDeal: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/ipfs/retrieve?cid=${encodeURIComponent(cid)}&check=true`);
    if (!response.ok) {
      return { stored: false, filecoinDeal: false };
    }
    const result = await response.json();
    return {
      stored: result.stored ?? true,
      filecoinDeal: result.filecoinDeal ?? false,
    };
  } catch {
    return { stored: false, filecoinDeal: false };
  }
}
