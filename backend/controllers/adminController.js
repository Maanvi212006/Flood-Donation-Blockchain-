const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc  Admin login
// @route POST /api/auth/login
// @access Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all pending campaigns
// @route GET /api/admin/campaigns?status=pending
// @access Admin
const getAllCampaigns = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const campaigns = await Campaign.find({ status }).sort({ createdAt: -1 });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Approve or reject a campaign
// @route PATCH /api/admin/campaigns/:id/verify
// @access Admin
const verifyCampaign = async (req, res) => {
  try {
    const { status, adminNote } = req.body; // status: "approved" | "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, verifiedAt: new Date() },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get dashboard stats
// @route GET /api/admin/stats
// @access Admin
const getStats = async (req, res) => {
  try {
    const [totalCampaigns, pending, approved, rejected, totalDonations] = await Promise.all([
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: "pending" }),
      Campaign.countDocuments({ status: "approved" }),
      Campaign.countDocuments({ status: "rejected" }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalCampaigns,
        pending,
        approved,
        rejected,
        totalDonationsETH: totalDonations[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { loginAdmin, getAllCampaigns, verifyCampaign, getStats };
