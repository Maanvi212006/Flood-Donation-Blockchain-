const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAllCampaigns, verifyCampaign, getStats } = require("../controllers/adminController");

router.use(protect); // all admin routes require JWT

router.get("/campaigns", getAllCampaigns);
router.patch("/campaigns/:id/verify", verifyCampaign);
router.get("/stats", getStats);

module.exports = router;
