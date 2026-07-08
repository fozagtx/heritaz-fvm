// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import "./HeritazConfidentialVault.sol";

/// @title HeritazConfidentialFactory
/// @notice Factory for deploying confidential inheritance vaults on fhEVM.
///         Maintains encrypted index of owner-to-vaults and beneficiary-to-vaults.
contract HeritazConfidentialFactory {
    address[] public allVaults;
    mapping(address => address[]) public ownerToVaults;
    mapping(address => address[]) public beneficiaryToVaults;

    event VaultDeployed(address indexed owner, address indexed vault, uint256 timestamp);

    function createVault(
        eaddress[] calldata _beneficiaries,
        euint8[] calldata _percentages,
        uint256 _checkInInterval,
        uint256 _gracePeriod
    ) external returns (address) {
        HeritazConfidentialVault vault = new HeritazConfidentialVault(
            msg.sender,
            _beneficiaries,
            _percentages,
            _checkInInterval,
            _gracePeriod
        );

        address vaultAddr = address(vault);
        allVaults.push(vaultAddr);
        ownerToVaults[msg.sender].push(vaultAddr);

        // Index vaults by beneficiary (decrypting eaddress to resolve actual address)
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address resolvedAddr = FHE.decrypt(_beneficiaries[i]);
            if (resolvedAddr != address(0)) {
                beneficiaryToVaults[resolvedAddr].push(vaultAddr);
            }
        }

        emit VaultDeployed(msg.sender, vaultAddr, block.timestamp);
        return vaultAddr;
    }

    function getVaultsByOwner(address owner) external view returns (address[] memory) {
        return ownerToVaults[owner];
    }

    function getVaultsByBeneficiary(address beneficiary) external view returns (address[] memory) {
        return beneficiaryToVaults[beneficiary];
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}
