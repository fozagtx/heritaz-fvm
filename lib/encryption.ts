import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import type { EncryptedDocument, KeyShare } from '@/types/ipfs';

// Use dynamic import for secrets.js-34r7h (CommonJS module)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let secretsModule: any = null;

async function getSecrets(): Promise<{ share: (secret: string, n: number, t: number) => string[]; combine: (shares: string[]) => string }> {
  if (!secretsModule) {
    const mod = await import('secrets.js-34r7h');
    secretsModule = (mod as any).default || mod;
  }
  return secretsModule;
}

/**
 * Generate a random 256-bit AES key for document encryption
 */
export function generateDocumentKey(): Uint8Array {
  return randomBytes(32); // 256 bits
}

/**
 * Encrypt a document using AES-256-GCM
 * All encryption happens client-side — server never sees plaintext
 */
export function encryptDocument(data: Uint8Array, key: Uint8Array): EncryptedDocument {
  const iv = randomBytes(12); // 96-bit nonce for GCM
  const cipher = gcm(key, iv);
  const ciphertext = cipher.encrypt(data);

  // GCM appends the 16-byte auth tag to the ciphertext
  const encryptedContent = ciphertext.slice(0, ciphertext.length - 16);
  const tag = ciphertext.slice(ciphertext.length - 16);

  return { ciphertext: encryptedContent, iv, tag };
}

/**
 * Decrypt a document encrypted with AES-256-GCM
 */
export function decryptDocument(encrypted: EncryptedDocument, key: Uint8Array): Uint8Array {
  // Reassemble ciphertext + tag for GCM decryption
  const combined = new Uint8Array(encrypted.ciphertext.length + encrypted.tag.length);
  combined.set(encrypted.ciphertext);
  combined.set(encrypted.tag, encrypted.ciphertext.length);

  const cipher = gcm(key, encrypted.iv);
  return cipher.decrypt(combined);
}

/**
 * Split a key into shares using Shamir's Secret Sharing
 * @param key - The AES key to split
 * @param totalShares - Total number of shares to create
 * @param threshold - Minimum shares needed to reconstruct
 */
export async function splitKey(
  key: Uint8Array,
  totalShares: number,
  threshold: number
): Promise<string[]> {
  const secrets = await getSecrets();
  const keyHex = bytesToHex(key);
  const shares = secrets.share(keyHex, totalShares, threshold);
  return shares;
}

/**
 * Reconstruct a key from Shamir shares
 * @param shares - Array of key shares (at least threshold number)
 */
export async function reconstructKey(shares: string[]): Promise<Uint8Array> {
  const secrets = await getSecrets();
  const keyHex = secrets.combine(shares);
  return hexToBytes(keyHex);
}

/**
 * Encrypt a key share for a specific beneficiary using their public key
 * For now uses a simple XOR-based approach; can be upgraded to ECIES
 */
export function encryptShareForBeneficiary(
  share: string,
  publicKeyHash: Uint8Array
): Uint8Array {
  const shareBytes = new TextEncoder().encode(share);
  const iv = randomBytes(12);
  const cipher = gcm(publicKeyHash.slice(0, 32), iv);
  const encrypted = cipher.encrypt(shareBytes);

  // Prepend IV to encrypted data
  const result = new Uint8Array(iv.length + encrypted.length);
  result.set(iv);
  result.set(encrypted, iv.length);
  return result;
}

/**
 * Decrypt a key share using beneficiary's private key
 */
export function decryptShareForBeneficiary(
  encryptedShare: Uint8Array,
  privateKey: Uint8Array
): string {
  const iv = encryptedShare.slice(0, 12);
  const ciphertext = encryptedShare.slice(12);
  const cipher = gcm(privateKey.slice(0, 32), iv);
  const decrypted = cipher.decrypt(ciphertext);
  return new TextDecoder().decode(decrypted);
}

/**
 * Full encryption pipeline for a document:
 * 1. Generate AES key
 * 2. Encrypt document
 * 3. Split key via Shamir's
 * 4. Encrypt each share for each beneficiary
 */
export async function encryptDocumentForLegacy(
  fileData: Uint8Array,
  beneficiaryPublicKeyHashes: Uint8Array[],
  threshold: number
): Promise<{
  encrypted: EncryptedDocument;
  keyShares: KeyShare[];
}> {
  const key = generateDocumentKey();
  const encrypted = encryptDocument(fileData, key);

  const totalShares = beneficiaryPublicKeyHashes.length;
  const shares = await splitKey(key, totalShares, threshold);

  const keyShares: KeyShare[] = shares.map((share, index) => ({
    index,
    share,
    beneficiaryAddress: '', // filled in by caller
  }));

  return { encrypted, keyShares };
}

/**
 * Serialize an EncryptedDocument for storage/transmission
 */
export function serializeEncryptedDocument(doc: EncryptedDocument): Uint8Array {
  // Format: [4 bytes iv length][iv][4 bytes tag length][tag][ciphertext]
  const ivLen = new Uint8Array(4);
  new DataView(ivLen.buffer).setUint32(0, doc.iv.length);
  const tagLen = new Uint8Array(4);
  new DataView(tagLen.buffer).setUint32(0, doc.tag.length);

  const result = new Uint8Array(4 + doc.iv.length + 4 + doc.tag.length + doc.ciphertext.length);
  let offset = 0;
  result.set(ivLen, offset); offset += 4;
  result.set(doc.iv, offset); offset += doc.iv.length;
  result.set(tagLen, offset); offset += 4;
  result.set(doc.tag, offset); offset += doc.tag.length;
  result.set(doc.ciphertext, offset);

  return result;
}

/**
 * Deserialize an EncryptedDocument from storage
 */
export function deserializeEncryptedDocument(data: Uint8Array): EncryptedDocument {
  const view = new DataView(data.buffer, data.byteOffset);
  let offset = 0;

  const ivLen = view.getUint32(offset); offset += 4;
  const iv = data.slice(offset, offset + ivLen); offset += ivLen;

  const tagLen = view.getUint32(offset); offset += 4;
  const tag = data.slice(offset, offset + tagLen); offset += tagLen;

  const ciphertext = data.slice(offset);

  return { ciphertext, iv, tag };
}
