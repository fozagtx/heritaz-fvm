import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const CALIBRATION_RPC = 'https://api.calibration.node.glif.io/rpc/v1';

const VAULT_ABI = [
  "function getVaultInfo() external view returns (address vaultOwner, uint8 vaultStatus, uint256 _checkInInterval, uint256 _gracePeriod, uint256 _lastCheckIn, string _btcVaultId, uint256 beneficiaryCount, uint256 documentCount)",
  "function getBeneficiary(uint256 index) external view returns (tuple(address wallet, string btcAddress, uint8 percentage, bytes32 publicKeyHash))",
  "function getDeadlineTimestamp() external view returns (uint256)",
  "function getGraceDeadlineTimestamp() external view returns (uint256)",
  "function isExpired() external view returns (bool)",
  "function isTriggerable() external view returns (bool)",
];

/**
 * Read FVM vault state from Filecoin Calibration testnet
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

    const provider = new ethers.JsonRpcProvider(CALIBRATION_RPC, {
      name: 'filecoin-calibration',
      chainId: 314159,
    });

    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

    const [info, deadline, graceDeadline, expired, triggerable] = await Promise.all([
      vault.getVaultInfo(),
      vault.getDeadlineTimestamp(),
      vault.getGraceDeadlineTimestamp(),
      vault.isExpired(),
      vault.isTriggerable(),
    ]);

    // Fetch beneficiary details
    const beneficiaries = [];
    for (let i = 0; i < Number(info.beneficiaryCount); i++) {
      const ben = await vault.getBeneficiary(i);
      beneficiaries.push({
        wallet: ben.wallet,
        btcAddress: ben.btcAddress,
        percentage: Number(ben.percentage),
        publicKeyHash: ben.publicKeyHash,
      });
    }

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
        btcVaultId: info._btcVaultId,
        beneficiaryCount: Number(info.beneficiaryCount),
        documentCount: Number(info.documentCount),
        beneficiaries,
        deadline: Number(deadline),
        graceDeadline: Number(graceDeadline),
        isExpired: expired,
        isTriggerable: triggerable,
        network: 'Filecoin Calibration',
        chainId: 314159,
      },
    });
  } catch (error) {
    console.error('FVM vault state error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to read vault state',
      },
      { status: 500 }
    );
  }
}
