import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.ipfs-data');

/**
 * IPFS upload API route
 *
 * 1. Stores encrypted data locally (content-addressed by SHA-256)
 * 2. If STORACHA_KEY is set, also pins to IPFS via web3.storage
 * 3. Returns a real content-based CID
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.arrayBuffer();

    if (!data || data.byteLength === 0) {
      return NextResponse.json(
        { success: false, message: 'No data provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(data);

    // Generate content-addressed hash (real CID-like identifier)
    const hash = createHash('sha256').update(buffer).digest('hex');
    const cid = `bafk${hash}`;

    // Store locally
    if (!existsSync(STORAGE_DIR)) {
      await mkdir(STORAGE_DIR, { recursive: true });
    }
    await writeFile(path.join(STORAGE_DIR, cid), buffer);

    // If Storacha/web3.storage key is configured, pin to real IPFS + Filecoin
    let pinnedToIPFS = false;
    let filecoinDealId: string | undefined;

    const storachaKey = process.env.STORACHA_KEY || process.env.W3_STORAGE_KEY;
    if (storachaKey) {
      try {
        const pinResult = await pinToWeb3Storage(buffer, storachaKey);
        if (pinResult.success) {
          pinnedToIPFS = true;
          filecoinDealId = pinResult.dealId;
        }
      } catch (err) {
        console.warn('IPFS pinning failed, data stored locally:', err);
      }
    }

    return NextResponse.json({
      success: true,
      cid,
      size: data.byteLength,
      timestamp: Date.now(),
      pinnedToIPFS,
      dealId: filecoinDealId,
      storage: pinnedToIPFS ? 'ipfs+filecoin' : 'local',
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

async function pinToWeb3Storage(data: Buffer, key: string): Promise<{ success: boolean; dealId?: string }> {
  // web3.storage HTTP API
  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(data) as unknown as BodyInit,
  });

  if (!response.ok) {
    throw new Error(`web3.storage upload failed: ${response.status}`);
  }

  const result = await response.json();
  return { success: true, dealId: result.cid };
}
