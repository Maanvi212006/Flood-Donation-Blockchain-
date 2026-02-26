const Campaign = require("../models/Campaign");

// @desc  Create a new campaign (by NGO)
// @route POST /api/campaigns
// @access Public
const createCampaign = async (req, res) => {
  try {
    const {
      title, description, targetAmount, walletAddress,
      ngoName, ngoEmail, ngoPhone, category, deadline,
    } = req.body;

    const image = req.files?.image?.[0]
      ? `${process.env.BASE_URL}/uploads/${req.files.image[0].filename}`
      : null;

    const ngoDocument = req.files?.ngoDocument?.[0]
      ? `${process.env.BASE_URL}/uploads/${req.files.ngoDocument[0].filename}`
      : null;

    const campaign = await Campaign.create({
      title, description, targetAmount, walletAddress,
      ngoName, ngoEmail, ngoPhone, category, deadline,
      image, ngoDocument,
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Get all approved campaigns
// @route GET /api/campaigns
// @access Public
const getCampaigns = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    const query = { status: "approved", isActive: true };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Campaign.countDocuments(query);

    res.json({ success: true, total, page: Number(page), data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single campaign by ID
// @route GET /api/campaigns/:id
// @access Public
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update raised amount (called after blockchain event)
// @route PATCH /api/campaigns/:id/raised
// @access Public (called internally by blockchain listener)
const updateRaisedAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { raisedAmount: Number(amount) } },
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

// @desc  Set contract address after blockchain deploy
// @route PATCH /api/campaigns/:id/contract
// @access Public (called by Member 1's deploy script)
const setContractAddress = async (req, res) => {
  try {
    const { contractAddress } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { contractAddress },
      { new: true }
    );
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateRaisedAmount,
  setContractAddress,
};
