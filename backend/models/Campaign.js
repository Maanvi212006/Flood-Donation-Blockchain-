const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },     // in ETH or MATIC
    raisedAmount: { type: Number, default: 0 },

    // Blockchain
    contractAddress: { type: String, default: null },   // on-chain campaign ID or address
    walletAddress: { type: String, required: true },    // NGO wallet

    // NGO info (off-chain, stored in MongoDB)
    ngoName: { type: String, required: true },
    ngoEmail: { type: String, required: true },
    ngoPhone: { type: String },
    ngoDocument: { type: String },                       // URL to uploaded NGO registration doc

    image: { type: String },                             // campaign banner image URL
    category: {
      type: String,
      enum: ["disaster", "medical", "education", "environment", "social", "other"],
      default: "other",
    },

    // Admin verification
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },            // rejection/approval note from admin
    verifiedAt: { type: Date, default: null },

    deadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
