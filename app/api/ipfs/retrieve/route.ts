import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.ipfs-data');

// Public IPFS gateways to try in order
const GATEWAYS = [
  'https://w3s.link/ipfs/',
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

/**
 * IPFS retrieval API route
 *
 * 1. Check local content-addressed store first
 * 2. If not local, try public IPFS gateways
 * 3. Returns raw binary data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    const checkOnly = searchParams.get('check') === 'true';

    if (!cid) {
      return NextResponse.json(
        { success: false, message: 'CID parameter required' },
        { status: 400 }
      );
    }

    // Check local store first
    const localPath = path.join(STORAGE_DIR, cid);
    const isLocal = existsSync(localPath);

    if (checkOnly) {
      return NextResponse.json({
        success: true,
        stored: isLocal,
        filecoinDeal: false,
        cid,
      });
    }

    // Serve from local store
    if (isLocal) {
      const data = await readFile(localPath);
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': data.byteLength.toString(),
          'X-Storage': 'local',
        },
      });
    }

    // Try public IPFS gateways
    for (const gateway of GATEWAYS) {
      try {
        const response = await fetch(`${gateway}${cid}`, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.arrayBuffer();
          return new NextResponse(Buffer.from(data), {
            status: 200,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': data.byteLength.toString(),
              'X-Storage': 'ipfs-gateway',
              'X-Gateway': gateway,
            },
          });
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json(
      { success: false, message: `Document ${cid} not found in local store or IPFS gateways` },
      { status: 404 }
    );
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Retrieval failed',
      },
      { status: 500 }
    );
  }
}
