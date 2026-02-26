const express = require("express");
const router = express.Router();
const {
  recordDonation,
  getDonationsByCampaign,
  getDonationsByDonor,
} = require("../controllers/donationController");

router.post("/", recordDonation);
router.get("/campaign/:campaignId", getDonationsByCampaign);
router.get("/donor/:walletAddress", getDonationsByDonor);

module.exports = router;
