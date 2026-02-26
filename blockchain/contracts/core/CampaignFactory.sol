// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/ICampaignFactory.sol";
import "../libraries/DonationLib.sol";
import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @notice Single entry-point contract. Admin uses this to:
 *           1. deployCampaign()  — deploy a new Campaign contract
 *           2. activateCampaign()— open it for donations
 *           3. revokeCampaign()  — shut down a fraudulent campaign
 *
 * @dev Uses OpenZeppelin Ownable for access control and Pausable
 *      to emergency-stop the whole platform if needed.
 *
 * Why a Factory?
 *   - Each campaign is an isolated contract → one bug can't drain ALL campaigns
 *   - Clean separation of concerns
 *   - Donors can verify they're interacting with a real campaign address
 */
contract CampaignFactory is ICampaignFactory, Ownable, Pausable {
    using DonationLib for uint256;

    // ── State ──────────────────────────────────────────────────────────────────
    uint256 public platformFeePercent;
    uint256 public campaignCount;

    // campaignId (1-based) → Campaign contract address
    mapping(uint256 => address) private _campaigns;

    // All deployed campaign addresses in order
    address[] private _allCampaigns;

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(uint256 _feePercent) Ownable(msg.sender) {
        require(_feePercent <= DonationLib.MAX_FEE_PERCENT, "Factory: fee too high");
        platformFeePercent = _feePercent;
    }

    // ── Admin: Deploy ──────────────────────────────────────────────────────────

    /**
     * @notice Deploy a new Campaign contract (off-chain admin verification done first).
     * @param title        Campaign title
     * @param ngoWallet    NGO wallet that will receive funds after withdrawal
     * @param targetAmount Fundraising goal in wei
     * @param deadline     Unix timestamp — campaign ends here
     * @return campaignId      Auto-incrementing ID (1, 2, 3...)
     * @return campaignAddress Deployed contract address (save this in your backend DB)
     */
    function deployCampaign(
        string  calldata title,
        address payable  ngoWallet,
        uint256 targetAmount,
        uint256 deadline
    )
        external
        override
        onlyOwner
        whenNotPaused
        returns (uint256 campaignId, address campaignAddress)
    {
        require(DonationLib.validAddress(ngoWallet), "Factory: invalid NGO wallet");
        require(bytes(title).length > 0,             "Factory: title required");

        campaignCount++;
        campaignId = campaignCount;

        // Deploy a new isolated Campaign contract
        Campaign campaign = new Campaign(
            title,
            ngoWallet,
            targetAmount,
            deadline,
            owner(),             // admin = this factory's owner
            platformFeePercent
        );

        campaignAddress = address(campaign);
        _campaigns[campaignId] = campaignAddress;
        _allCampaigns.push(campaignAddress);

        emit CampaignDeployed(campaignId, campaignAddress, ngoWallet, title);
    }

    /**
     * @notice Activate a deployed campaign so donors can start sending MATIC.
     *         Call this after final admin review.
     * @param campaignId The ID returned from deployCampaign()
     */
    function activateCampaign(uint256 campaignId)
        external
        override
        onlyOwner
        whenNotPaused
    {
        address addr = _getCampaignOrRevert(campaignId);
        Campaign(addr).activate();
        emit CampaignActivated(campaignId, addr);
    }

    /**
     * @notice Revoke a campaign (fraud detected). Donors can then claimRefund().
     * @param campaignId Campaign to revoke
     * @param reason     Stored on-chain for public accountability
     */
    function revokeCampaign(uint256 campaignId, string calldata reason)
        external
        onlyOwner
    {
        address addr = _getCampaignOrRevert(campaignId);
        Campaign(addr).revoke(reason);
    }

    // ── Admin: Platform Settings ───────────────────────────────────────────────

    /**
     * @notice Update platform fee for future campaigns (does NOT affect existing ones).
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= DonationLib.MAX_FEE_PERCENT, "Factory: fee too high");
        emit PlatformFeeUpdated(platformFeePercent, newFee);
        platformFeePercent = newFee;
    }

    /**
     * @notice Emergency pause — stops new campaign deployments and activations.
     */
    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ── View Functions ─────────────────────────────────────────────────────────

    function getCampaignAddress(uint256 campaignId)
        external
        view
        override
        returns (address)
    {
        return _getCampaignOrRevert(campaignId);
    }

    function getAllCampaigns() external view override returns (address[] memory) {
        return _allCampaigns;
    }

    function getTotalCampaigns() external view override returns (uint256) {
        return campaignCount;
    }

    /**
     * @notice Convenience: get full details of a campaign by factory ID.
     */
    function getCampaignDetails(uint256 campaignId) external view returns (
        string  memory title,
        address ngoWallet,
        uint256 targetAmount,
        uint256 raisedAmount,
        uint256 deadline,
        uint8   status,
        uint256 progressPercent,
        uint256 donorCount,
        address campaignAddress
    ) {
        campaignAddress = _getCampaignOrRevert(campaignId);
        (title, ngoWallet, targetAmount, raisedAmount, deadline, status, progressPercent, donorCount)
            = Campaign(campaignAddress).getDetails();
    }

    // ── Internal Helpers ──────────────────────────────────────────────────────

    function _getCampaignOrRevert(uint256 campaignId) internal view returns (address) {
        address addr = _campaigns[campaignId];
        require(addr != address(0), "Factory: campaign does not exist");
        return addr;
    }
}

