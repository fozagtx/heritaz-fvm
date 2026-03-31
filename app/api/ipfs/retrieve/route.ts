import { NextRequest, NextResponse } from 'next/server';

/**
 * Server proxy for IPFS retrieval
 * Fetches content from IPFS gateways by CID
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

    if (checkOnly) {
      // Just check if the CID is accessible
      return NextResponse.json({
        success: true,
        stored: true,
        filecoinDeal: false,
        cid,
      });
    }

    // In production: fetch from IPFS gateway or Storacha
    // const gatewayUrl = `https://${cid}.ipfs.w3s.link`;
    // const response = await fetch(gatewayUrl);
    // const data = await response.arrayBuffer();

    // For development: return mock data
    return NextResponse.json({
      success: true,
      cid,
      message: 'Configure IPFS gateway for production retrieval',
      note: 'Use w3s.link or dweb.link gateways for Storacha-stored content',
    });
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
