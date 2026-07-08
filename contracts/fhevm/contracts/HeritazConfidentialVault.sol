// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import {CoprocessorConfig} from "@fhevm/solidity/lib/Impl.sol";
import {CoprocessorSetup} from "./CoprocessorSetup.sol";

/**
 * @title HeritazConfidentialVault
 * @notice Confidential digital inheritance vault using Zama fhEVM.
 *         Beneficiary data, document keys, and access control use FHE encryption.
 *         Owners check in periodically; if they stop, beneficiaries can claim legacies.
 *
 *         Instead of Shamir's Secret Sharing + AES (old Filecoin approach),
 *         this uses FHE re-encryption: document keys are stored as encrypted
 *         ebytes256 handles, and beneficiaries are authorized via FHE.allow().
 */
contract HeritazConfidentialVault is Ownable, ReentrancyGuard {
    enum VaultStatus { Active, GracePeriod, Triggered, Claimed }

    struct ConfidentialBeneficiary {
        eaddress wallet;
        euint8 percentage;
        bool initialized;
    }

    struct ConfidentialDocument {
        string cid;
        ebytes256 encryptedKey;
        uint256 timestamp;
    }

    VaultStatus public status;
    uint256 public checkInInterval;
    uint256 public gracePeriod;
    uint256 public lastCheckIn;

    ConfidentialBeneficiary[] private beneficiaries;
    ConfidentialDocument[] private legacyDocuments;
    mapping(address => bool) public isBeneficiary;

    event VaultCreated(address indexed owner, uint256 checkInInterval, uint256 gracePeriod);
    event CheckIn(address indexed owner, uint256 timestamp);
    event InheritanceTriggered(address indexed triggeredBy, uint256 timestamp);
    event LegacyClaimed(address indexed beneficiary, uint256 index);
    event DocumentAdded(string cid, uint256 timestamp);
    event DocumentRemoved(uint256 index, uint256 timestamp);
    event BeneficiariesUpdated(uint256 count);
    event VaultRevoked(address indexed owner, uint256 timestamp);

    modifier onlyActive() {
        require(status == VaultStatus.Active, "Vault is not active");
        _;
    }

    constructor(
        address _owner,
        eaddress[] memory _beneficiaries,
        euint8[] memory _percentages,
        uint256 _checkInInterval,
        uint256 _gracePeriod
    ) Ownable(_owner) {
        require(_beneficiaries.length > 0, "Need at least one beneficiary");
        require(_beneficiaries.length == _percentages.length, "Array length mismatch");
        require(_checkInInterval >= 1 days, "Interval too short");
        require(_gracePeriod >= 1 hours, "Grace too short");

        FHE.setCoprocessor(CoprocessorSetup.defaultConfig());

        // Validate percentages sum to 100 using FHE
        euint8 total;
        for (uint256 i = 0; i < _percentages.length; i++) {
            total = FHE.add(total, _percentages[i]);
        }
        require(FHE.decrypt(total) == 100, "Percentages must sum to 100");

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            beneficiaries.push(ConfidentialBeneficiary({
                wallet: _beneficiaries[i],
                percentage: _percentages[i],
                initialized: true
            }));
            FHE.allowThis(_beneficiaries[i]);
            FHE.allow(_beneficiaries[i], _owner);
        }

        checkInInterval = _checkInInterval;
        gracePeriod = _gracePeriod;
        lastCheckIn = block.timestamp;
        status = VaultStatus.Active;
        emit VaultCreated(_owner, _checkInInterval, _gracePeriod);
    }

    // ─── Owner Operations ──────────────────────────────────────────────

    function checkIn() external onlyOwner onlyActive {
        lastCheckIn = block.timestamp;
        emit CheckIn(msg.sender, block.timestamp);
    }

    function addLegacyDocument(
        string calldata cid,
        ebytes256 calldata encryptedKey
    ) external onlyOwner onlyActive {
        legacyDocuments.push();
        ConfidentialDocument storage doc = legacyDocuments[legacyDocuments.length - 1];
        doc.cid = cid;
        doc.encryptedKey = encryptedKey;
        doc.timestamp = block.timestamp;

        FHE.allowThis(encryptedKey);
        FHE.allow(encryptedKey, owner());
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            address resolvedAddr = FHE.decrypt(beneficiaries[i].wallet);
            if (resolvedAddr != address(0)) {
                FHE.allow(encryptedKey, resolvedAddr);
            }
        }
        emit DocumentAdded(cid, block.timestamp);
    }

    function removeLegacyDocument(uint256 index) external onlyOwner onlyActive {
        require(index < legacyDocuments.length, "Invalid index");
        if (index != legacyDocuments.length - 1) {
            legacyDocuments[index] = legacyDocuments[legacyDocuments.length - 1];
        }
        legacyDocuments.pop();
        emit DocumentRemoved(index, block.timestamp);
    }

    function updateBeneficiaries(
        eaddress[] memory _newBeneficiaries,
        euint8[] memory _newPercentages
    ) external onlyOwner onlyActive {
        require(_newBeneficiaries.length > 0, "Need at least one");
        require(_newBeneficiaries.length == _newPercentages.length, "Length mismatch");

        euint8 total;
        for (uint256 i = 0; i < _newPercentages.length; i++) {
            total = FHE.add(total, _newPercentages[i]);
        }
        require(FHE.decrypt(total) == 100, "Must sum to 100");

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            address resolvedAddr = FHE.decrypt(beneficiaries[i].wallet);
            if (resolvedAddr != address(0)) isBeneficiary[resolvedAddr] = false;
        }
        delete beneficiaries;

        for (uint256 i = 0; i < _newBeneficiaries.length; i++) {
            beneficiaries.push(ConfidentialBeneficiary({
                wallet: _newBeneficiaries[i],
                percentage: _newPercentages[i],
                initialized: true
            }));
            FHE.allowThis(_newBeneficiaries[i]);
            FHE.allow(_newBeneficiaries[i], owner());
            address resolvedAddr = FHE.decrypt(_newBeneficiaries[i]);
            if (resolvedAddr != address(0)) isBeneficiary[resolvedAddr] = true;
        }
        emit BeneficiariesUpdated(beneficiaries.length);
    }

    function emergencyRevoke() external onlyOwner {
        require(status == VaultStatus.Active || status == VaultStatus.GracePeriod, "Cannot revoke");
        status = VaultStatus.Claimed;
        emit VaultRevoked(msg.sender, block.timestamp);
    }

    // ─── Inheritance Operations ─────────────────────────────────────────

    function triggerInheritance() external nonReentrant {
        require(isTriggerable(), "Deadline + grace not passed");
        status = VaultStatus.Triggered;
        emit InheritanceTriggered(msg.sender, block.timestamp);

        // Authorize all beneficiaries for all document keys
        for (uint256 d = 0; d < legacyDocuments.length; d++) {
            for (uint256 b = 0; b < beneficiaries.length; b++) {
                address resolvedAddr = FHE.decrypt(beneficiaries[b].wallet);
                if (resolvedAddr != address(0)) {
                    FHE.allow(legacyDocuments[d].encryptedKey, resolvedAddr);
                }
            }
        }
    }

    function claimLegacy(uint256 beneficiaryIndex) external nonReentrant {
        require(status == VaultStatus.Triggered, "Not triggered");
        require(beneficiaryIndex < beneficiaries.length, "Invalid index");

        eaddress callerAddr = FHE.asEaddress(msg.sender);
        eaddress storedAddr = beneficiaries[beneficiaryIndex].wallet;
        ebool isAuthorized = FHE.eq(callerAddr, storedAddr);
        require(FHE.decrypt(isAuthorized), "Not authorized beneficiary");

        emit LegacyClaimed(msg.sender, beneficiaryIndex);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    function getVaultInfo()
        external view returns (
            address vaultOwner,
            VaultStatus vaultStatus,
            uint256 _checkInInterval,
            uint256 _gracePeriod,
            uint256 _lastCheckIn,
            uint256 beneficiaryCount,
            uint256 documentCount
        )
    {
        return (owner(), status, checkInInterval, gracePeriod, lastCheckIn, beneficiaries.length, legacyDocuments.length);
    }

    function getBeneficiaryCount() external view returns (uint256) { return beneficiaries.length; }
    function getDocumentCount() external view returns (uint256) { return legacyDocuments.length; }

    function getDocument(uint256 index) external view returns (string memory cid, uint256 timestamp) {
        require(index < legacyDocuments.length, "Invalid index");
        return (legacyDocuments[index].cid, legacyDocuments[index].timestamp);
    }

    function getDeadlineTimestamp() external view returns (uint256) { return lastCheckIn + checkInInterval; }
    function getGraceDeadlineTimestamp() external view returns (uint256) { return lastCheckIn + checkInInterval + gracePeriod; }
    function isExpired() external view returns (bool) { return block.timestamp > lastCheckIn + checkInInterval; }
    function isTriggerable() public view returns (bool) {
        return (status == VaultStatus.Active || status == VaultStatus.GracePeriod) &&
               block.timestamp > lastCheckIn + checkInInterval + gracePeriod;
    }

    function getBeneficiary(uint256 index) external view returns (eaddress wallet, euint8 percentage) {
        require(index < beneficiaries.length, "Invalid index");
        require(FHE.isSenderAllowed(beneficiaries[index].wallet), "Not authorized");
        return (beneficiaries[index].wallet, beneficiaries[index].percentage);
    }

    function getDocumentEncryptedKey(uint256 index) external view returns (ebytes256) {
        require(index < legacyDocuments.length, "Invalid index");
        require(FHE.isSenderAllowed(legacyDocuments[index].encryptedKey), "Not authorized");
        return legacyDocuments[index].encryptedKey;
    }
}
