// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DonationLib
 * @notice Pure utility functions shared across Campaign and Factory contracts.
 *         Keeping math here makes contracts easier to audit.
 */
library DonationLib {

    uint256 public constant MAX_FEE_PERCENT = 10;
    uint256 public constant PERCENT_BASE    = 100;

    /**
     * @notice Split a total amount into NGO payout and platform fee.
     * @param total      Total wei to split
     * @param feePercent Platform fee percentage (e.g. 2 = 2%)
     * @return ngoAmount Amount sent to NGO
     * @return feeAmount Amount kept as platform fee
     */
    function splitAmount(uint256 total, uint256 feePercent)
        internal
        pure
        returns (uint256 ngoAmount, uint256 feeAmount)
    {
        require(feePercent <= MAX_FEE_PERCENT, "DonationLib: fee too high");
        feeAmount = (total * feePercent) / PERCENT_BASE;
        ngoAmount = total - feeAmount;
    }

    /**
     * @notice Calculate campaign progress as a percentage (0â€“100).
     * @param raised    Amount raised so far (wei)
     * @param target    Campaign goal (wei)
     */
    function progressPercent(uint256 raised, uint256 target)
        internal
        pure
        returns (uint256)
    {
        if (target == 0) return 0;
        uint256 pct = (raised * PERCENT_BASE) / target;
        return pct > PERCENT_BASE ? PERCENT_BASE : pct; // cap at 100
    }

    /**
     * @notice Validate an Ethereum address is not zero.
     */
    function validAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }
}

