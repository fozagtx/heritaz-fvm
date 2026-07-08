import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const FHEVM_RPC = process.env.NEXT_PUBLIC_FHEVM_RPC_URL || 'https://devnet.zama.ai';

const VAULT_ABI = [
  "function getVaultInfo() external view returns (address vaultOwner, uint8 vaultStatus, uint256 _checkInInterval, uint256 _gracePeriod, uint256 _lastCheckIn, uint256 beneficiaryCount, uint256 documentCount)",
  "function getDeadlineTimestamp() external view returns (uint256)",
  "function getGraceDeadlineTimestamp() external view returns (uint256)",
  "function isExpired() external view returns (bool)",
  "function isTriggerable() external view returns (bool)",
];

/**
 * Read confidential vault state from fhEVM network
 */
export async function POST(request: NextRequest) {
  try {
    const { vaultAddress } = await request.json();

    if (!vaultAddress || !ethers.isAddress(vaultAddress)) {
      return NextResponse.json(
        { success: false, message: 'Valid vault address required' },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(FHEVM_RPC, {
      name: 'fhevm-testnet',
      chainId: Number(process.env.NEXT_PUBLIC_FHEVM_CHAIN_ID || 9000),
    });

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

    const [info, deadline, graceDeadline, expired, triggerable] = await Promise.all([
      vault.getVaultInfo(),
      vault.getDeadlineTimestamp(),
      vault.getGraceDeadlineTimestamp(),
      vault.isExpired(),
      vault.isTriggerable(),
    ]);

    return NextResponse.json({
      success: true,
      vault: {
        address: vaultAddress,
        owner: info.vaultOwner,
        status: Number(info.vaultStatus),
        statusLabel: ['Active', 'GracePeriod', 'Triggered', 'Claimed'][Number(info.vaultStatus)],
        checkInInterval: Number(info._checkInInterval),
        gracePeriod: Number(info._gracePeriod),
        lastCheckIn: Number(info._lastCheckIn),
        beneficiaryCount: Number(info.beneficiaryCount),
        documentCount: Number(info.documentCount),
        deadline: Number(deadline),
        graceDeadline: Number(graceDeadline),
        isExpired: expired,
        isTriggerable: triggerable,
        network: 'fhEVM Network',
        chainId: Number(process.env.NEXT_PUBLIC_FHEVM_CHAIN_ID || 9000),
      },
    });
  } catch (error) {
    console.error('FHEVM vault state error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to read vault state',
      },
      { status: 500 }
    );
  }
}
