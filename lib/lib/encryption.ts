import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';
import type { EncryptedDocument } from '@/types/ipfs';

/**
 * Generate a random 256-bit AES key for document encryption.
 * The document itself is encrypted client-side with AES-256-GCM.
 * The symmetric key is then encrypted on-chain using Zama FHE (as ebytes256).
 */
export function generateDocumentKey(): Uint8Array {
  return randomBytes(32); // 256 bits
}

/**
 * Encrypt a document using AES-256-GCM
 * All encryption happens client-side — server never sees plaintext.
 * The key is later stored on-chain as an FHE-encrypted ebytes256 handle,
 * ensuring only authorized beneficiaries can decrypt it.
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
 * Serialize an EncryptedDocument for storage/transmission
 * Format: [4 bytes iv length][iv][4 bytes tag length][tag][ciphertext]
 */
export function serializeEncryptedDocument(doc: EncryptedDocument): Uint8Array {
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

/**
 * Prepare document key for on-chain FHE storage.
 * In the fhEVM flow, the AES key is encrypted client-side into an
 * ebytes256-compatible format for the addLegacyDocument() call.
 * The fhEVM coprocessor handles the actual FHE encryption on-chain.
 */
export function prepareKeyForFHE(key: Uint8Array): string {
  // The key gets wrapped as an FHE encrypted input (einput) by the SDK.
  // This function prepares the raw bytes for that process.
  return '0x' + Array.from(key)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

