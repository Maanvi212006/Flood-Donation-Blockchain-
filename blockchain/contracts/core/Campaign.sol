// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/ICampaign.sol";
import "../libraries/DonationLib.sol";

/**
 * @title Campaign
 * @notice One contract is deployed per campaign by the CampaignFactory.
 *
 *  Lifecycle:
 *    PENDING  → admin calls factory.activateCampaign() → ACTIVE
 *    ACTIVE   → deadline passes or target met → NGO calls withdraw() → COMPLETED
 *    ACTIVE   → admin detects fraud → calls revoke() → REVOKED
 *    REVOKED  → donors call claimRefund()
 *
 * Security:
 *    - ReentrancyGuard on all ETH-moving functions
 *    - Only NGO wallet can withdraw
 *    - Only factory admin can revoke
 *    - All state changes happen before transfers (CEI pattern)
 */
contract Campaign is ICampaign, ReentrancyGuard {
    using DonationLib for uint256;

    // ── Immutable campaign metadata (set once at deploy) ──────────────────────
    string  public title;
    address payable public ngoWallet;
    uint256 public targetAmount;
    uint256 public deadline;
    address public admin;           // CampaignFactory admin address
    uint256 public platformFee;     // fee percent (e.g. 2)

    // ── Mutable state ─────────────────────────────────────────────────────────
    uint256 public raisedAmount;
    Status  public status;
    string  public revokeReason;

    // ── Donor tracking ────────────────────────────────────────────────────────
    mapping(address => uint256) private _donations;   // donor → total donated
    address[] private _donors;                         // unique donor list

    // ── Constructor (called by CampaignFactory) ───────────────────────────────
    constructor(
        string  memory _title,
        address payable _ngoWallet,
        uint256 _targetAmount,
        uint256 _deadline,
        address _admin,
        uint256 _platformFee
    ) {
        require(DonationLib.validAddress(_ngoWallet), "Campaign: invalid NGO wallet");
        require(_targetAmount > 0,                    "Campaign: target must be > 0");
        require(_deadline > block.timestamp,          "Campaign: deadline in the past");
        require(DonationLib.validAddress(_admin),     "Campaign: invalid admin");

        title        = _title;
        ngoWallet    = _ngoWallet;
        targetAmount = _targetAmount;
        deadline     = _deadline;
        admin        = _admin;
        platformFee  = _platformFee;
        status       = Status.PENDING;   // admin must activate before donations open
    }

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Campaign: caller is not admin");
        _;
    }

    modifier onlyActive() {
        require(status == Status.ACTIVE,       "Campaign: not active");
        require(block.timestamp < deadline,    "Campaign: deadline passed");
        _;
    }

    modifier onlyNGO() {
        require(msg.sender == ngoWallet, "Campaign: caller is not NGO wallet");
        _;
    }

    // ── Admin Functions ───────────────────────────────────────────────────────

    /**
     * @notice Admin activates campaign after off-chain verification.
     *         Called by CampaignFactory.activateCampaign().
     */
    function activate() external onlyAdmin {
        require(status == Status.PENDING, "Campaign: already activated");
        status = Status.ACTIVE;
    }

    /**
     * @notice Admin revokes a fraudulent campaign — refunds unlock for donors.
     * @param reason Human-readable reason stored on-chain for transparency.
     */
    function revoke(string calldata reason) external override onlyAdmin nonReentrant {
        require(status == Status.ACTIVE, "Campaign: can only revoke active campaign");
        status       = Status.REVOKED;
        revokeReason = reason;
        emit CampaignRevoked(admin, reason);
    }

    // ── Donor Functions ───────────────────────────────────────────────────────

    /**
     * @notice Send MATIC to donate. Campaign must be ACTIVE and before deadline.
     */
    function donate() external payable override onlyActive nonReentrant {
        require(msg.value > 0, "Campaign: donation must be > 0");

        // Track first-time donors
        if (_donations[msg.sender] == 0) {
            _donors.push(msg.sender);
        }

        _donations[msg.sender] += msg.value;
        raisedAmount            += msg.value;

        emit DonationReceived(msg.sender, msg.value, raisedAmount);
    }

    /**
     * @notice Donor claims refund if campaign was revoked.
     */
    function claimRefund() external override nonReentrant {
        require(status == Status.REVOKED, "Campaign: not revoked");

        uint256 amount = _donations[msg.sender];
        require(amount > 0, "Campaign: nothing to refund");

        // CEI: clear state before transfer
        _donations[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Campaign: refund transfer failed");

        emit RefundClaimed(msg.sender, amount);
    }

    // ── NGO Withdrawal ────────────────────────────────────────────────────────

    /**
     * @notice NGO withdraws funds.
     *         Allowed when: deadline passed OR target reached.
     *         Platform fee is deducted and sent to admin.
     */
    function withdraw() external override onlyNGO nonReentrant {
        require(status == Status.ACTIVE,   "Campaign: not active");
        require(raisedAmount > 0,          "Campaign: nothing raised");
        require(
            block.timestamp >= deadline || raisedAmount >= targetAmount,
            "Campaign: deadline not passed and target not reached"
        );

        // CEI: mark completed before transfer
        status = Status.COMPLETED;

        (uint256 ngoAmount, uint256 feeAmount) =
            DonationLib.splitAmount(raisedAmount, platformFee);

        raisedAmount = 0; // clear raised amount

        // Send fee to admin
        if (feeAmount > 0) {
            (bool feeSent, ) = payable(admin).call{value: feeAmount}("");
            require(feeSent, "Campaign: fee transfer failed");
        }

        // Send remainder to NGO
        (bool sent, ) = ngoWallet.call{value: ngoAmount}("");
        require(sent, "Campaign: NGO transfer failed");

        emit FundsWithdrawn(ngoWallet, ngoAmount, feeAmount);
    }

    // ── View Functions ────────────────────────────────────────────────────────

    function getDetails() external view override returns (
        string  memory _title,
        address _ngoWallet,
        uint256 _targetAmount,
        uint256 _raisedAmount,
        uint256 _deadline,
        uint8   _status,
        uint256 _progressPercent,
        uint256 _donorCount
    ) {
        return (
            title,
            ngoWallet,
            targetAmount,
            raisedAmount,
            deadline,
            uint8(status),
            DonationLib.progressPercent(raisedAmount, targetAmount),
            _donors.length
        );
    }

    function getDonorAmount(address donor) external view override returns (uint256) {
        return _donations[donor];
    }

    function getAllDonors() external view override returns (address[] memory) {
        return _donors;
    }

    function isActive() external view override returns (bool) {
        return status == Status.ACTIVE && block.timestamp < deadline;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

