// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HeritazVault is Ownable, ReentrancyGuard {
    enum VaultStatus {
        Active,
        GracePeriod,
        Triggered,
        Claimed
    }

    struct Beneficiary {
        address wallet;
        string btcAddress;
        uint8 percentage;
        bytes32 publicKeyHash;
    }

    struct LegacyDocument {
        string cid;
        bytes[] encryptedKeyShares;
        uint256 timestamp;
    }

    VaultStatus public status;
    uint256 public checkInInterval;
    uint256 public gracePeriod;
    uint256 public lastCheckIn;
    string public btcVaultId;

    Beneficiary[] private beneficiaries;
    LegacyDocument[] private legacyDocuments;

    event VaultCreated(address indexed owner, uint256 checkInInterval, uint256 gracePeriod);
    event CheckIn(address indexed owner, uint256 timestamp);
    event InheritanceTriggered(address indexed triggeredBy, uint256 timestamp);
    event LegacyClaimed(address indexed beneficiary, uint256 beneficiaryIndex);
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
        Beneficiary[] memory _beneficiaries,
        uint256 _checkInInterval,
        uint256 _gracePeriod,
        string memory _btcVaultId
    ) Ownable(_owner) {
        require(_beneficiaries.length > 0, "Must have at least one beneficiary");
        require(_checkInInterval >= 1 days, "Check-in interval too short");
        require(_gracePeriod >= 1 hours, "Grace period too short");

        _validateBeneficiaryPercentages(_beneficiaries);

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            beneficiaries.push(_beneficiaries[i]);
        }

        checkInInterval = _checkInInterval;
        gracePeriod = _gracePeriod;
        lastCheckIn = block.timestamp;
        btcVaultId = _btcVaultId;
        status = VaultStatus.Active;

        emit VaultCreated(_owner, _checkInInterval, _gracePeriod);
    }

    function checkIn() external onlyOwner onlyActive {
        lastCheckIn = block.timestamp;
        emit CheckIn(msg.sender, block.timestamp);
    }

    function addLegacyDocument(
        string calldata cid,
        bytes[] calldata encryptedKeyShares
    ) external onlyOwner onlyActive {
        require(encryptedKeyShares.length == beneficiaries.length, "Must provide key share for each beneficiary");

        legacyDocuments.push();
        LegacyDocument storage doc = legacyDocuments[legacyDocuments.length - 1];
        doc.cid = cid;
        doc.timestamp = block.timestamp;
        for (uint256 i = 0; i < encryptedKeyShares.length; i++) {
            doc.encryptedKeyShares.push(encryptedKeyShares[i]);
        }

        emit DocumentAdded(cid, block.timestamp);
    }

    function removeLegacyDocument(uint256 index) external onlyOwner onlyActive {
        require(index < legacyDocuments.length, "Invalid document index");

        // Move last element to deleted position
        if (index < legacyDocuments.length - 1) {
            legacyDocuments[index] = legacyDocuments[legacyDocuments.length - 1];
        }
        legacyDocuments.pop();

        emit DocumentRemoved(index, block.timestamp);
    }

    function triggerInheritance() external {
        require(
            status == VaultStatus.Active || status == VaultStatus.GracePeriod,
            "Vault cannot be triggered"
        );
        require(
            block.timestamp > lastCheckIn + checkInInterval + gracePeriod,
            "Check-in deadline + grace period not passed"
        );

        status = VaultStatus.Triggered;
        emit InheritanceTriggered(msg.sender, block.timestamp);
    }

    function claimLegacy(uint256 beneficiaryIndex) external {
        require(status == VaultStatus.Triggered, "Inheritance not triggered");
        require(beneficiaryIndex < beneficiaries.length, "Invalid beneficiary index");
        require(
            beneficiaries[beneficiaryIndex].wallet == msg.sender,
            "Not authorized beneficiary"
        );

        emit LegacyClaimed(msg.sender, beneficiaryIndex);
    }

    function updateBeneficiaries(Beneficiary[] calldata newBeneficiaries) external onlyOwner onlyActive {
        require(newBeneficiaries.length > 0, "Must have at least one beneficiary");
        _validateBeneficiaryPercentages(newBeneficiaries);

        delete beneficiaries;
        for (uint256 i = 0; i < newBeneficiaries.length; i++) {
            beneficiaries.push(newBeneficiaries[i]);
        }

        emit BeneficiariesUpdated(newBeneficiaries.length);
    }

    function emergencyRevoke() external onlyOwner {
        require(
            status == VaultStatus.Active || status == VaultStatus.GracePeriod,
            "Cannot revoke in current state"
        );

        status = VaultStatus.Claimed; // Permanently deactivate
        emit VaultRevoked(msg.sender, block.timestamp);
    }

    // View functions

    function getVaultInfo()
        external
        view
        returns (
            address vaultOwner,
            VaultStatus vaultStatus,
            uint256 _checkInInterval,
            uint256 _gracePeriod,
            uint256 _lastCheckIn,
            string memory _btcVaultId,
            uint256 beneficiaryCount,
            uint256 documentCount
        )
    {
        return (
            owner(),
            status,
            checkInInterval,
            gracePeriod,
            lastCheckIn,
            btcVaultId,
            beneficiaries.length,
            legacyDocuments.length
        );
    }

    function getBeneficiary(uint256 index) external view returns (Beneficiary memory) {
        require(index < beneficiaries.length, "Invalid index");
        return beneficiaries[index];
    }

    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }

    function getDocumentCount() external view returns (uint256) {
        return legacyDocuments.length;
    }

    function getDocument(uint256 index) external view returns (string memory cid, uint256 timestamp) {
        require(index < legacyDocuments.length, "Invalid index");
        return (legacyDocuments[index].cid, legacyDocuments[index].timestamp);
    }

    function getBeneficiaryKeyShares(
        uint256 docIndex,
        uint256 benIndex
    ) external view returns (bytes memory) {
        require(docIndex < legacyDocuments.length, "Invalid doc index");
        require(benIndex < legacyDocuments[docIndex].encryptedKeyShares.length, "Invalid ben index");

        // Only allow beneficiary to read their own key share, or owner
        require(
            msg.sender == owner() ||
            (benIndex < beneficiaries.length && beneficiaries[benIndex].wallet == msg.sender),
            "Not authorized"
        );

        return legacyDocuments[docIndex].encryptedKeyShares[benIndex];
    }

    function getDeadlineTimestamp() external view returns (uint256) {
        return lastCheckIn + checkInInterval;
    }

    function getGraceDeadlineTimestamp() external view returns (uint256) {
        return lastCheckIn + checkInInterval + gracePeriod;
    }

    function isExpired() external view returns (bool) {
        return block.timestamp > lastCheckIn + checkInInterval;
    }

    function isTriggerable() external view returns (bool) {
        return (status == VaultStatus.Active || status == VaultStatus.GracePeriod) &&
               block.timestamp > lastCheckIn + checkInInterval + gracePeriod;
    }

    // Internal

    function _validateBeneficiaryPercentages(Beneficiary[] memory _beneficiaries) internal pure {
        uint256 total = 0;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i].wallet != address(0), "Invalid beneficiary address");
            total += _beneficiaries[i].percentage;
        }
        require(total == 100, "Percentages must sum to 100");
    }
}
