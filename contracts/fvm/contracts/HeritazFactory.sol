// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./HeritazVault.sol";

contract HeritazFactory {
    address[] public allVaults;
    mapping(address => address[]) public ownerToVaults;
    mapping(address => address[]) public beneficiaryToVaults;

    event VaultDeployed(address indexed owner, address indexed vault, uint256 timestamp);

    function createVault(
        HeritazVault.Beneficiary[] calldata _beneficiaries,
        uint256 _checkInInterval,
        uint256 _gracePeriod,
        string calldata _btcVaultId
    ) external returns (address) {
        HeritazVault vault = new HeritazVault(
            msg.sender,
            _beneficiaries,
            _checkInInterval,
            _gracePeriod,
            _btcVaultId
        );

        address vaultAddr = address(vault);
        allVaults.push(vaultAddr);
        ownerToVaults[msg.sender].push(vaultAddr);

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            beneficiaryToVaults[_beneficiaries[i].wallet].push(vaultAddr);
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
