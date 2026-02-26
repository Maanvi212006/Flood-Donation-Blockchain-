/**
 * deploy/02_create_campaign.js
 * Called by Member 1 (or backend) after admin approves a campaign in the DB.
 *
 * Usage:
 *   CAMPAIGN_TITLE="Help Flood Victims" \
 *   NGO_WALLET=0xABC... \
 *   TARGET_MATIC=500 \
 *   DEADLINE_DAYS=30 \
 *   BACKEND_CAMPAIGN_ID=<mongodb_id> \
 *   npx hardhat run deploy/02_create_campaign.js --network mumbai
 */

const hre   = require("hardhat");
const fs    = require("fs");
const path  = require("path");
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function main() {
  const network    = hre.network.name;
  const configPath = path.join(__dirname, `../config/deployment.${network}.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Run 01_deploy_factory.js on ${network} first.`);
  }

  const { factoryAddress, factoryAbi } = JSON.parse(fs.readFileSync(configPath));
  const [admin] = await hre.ethers.getSigners();
  const factory = new hre.ethers.Contract(factoryAddress, factoryAbi, admin);

  // ── Campaign params ────────────────────────────────────────────────────────
  const title        = process.env.CAMPAIGN_TITLE    || "Test Campaign";
  const ngoWallet    = process.env.NGO_WALLET        || admin.address;
  const targetMatic  = parseFloat(process.env.TARGET_MATIC  || "10");
  const deadlineDays = parseInt(process.env.DEADLINE_DAYS   || "30");
  const backendId    = process.env.BACKEND_CAMPAIGN_ID;

  const targetWei = hre.ethers.parseEther(targetMatic.toString());
  const deadline  = Math.floor(Date.now() / 1000) + deadlineDays * 86400;

  console.log("\n📋 Deploying Campaign via Factory...");
  console.log(`   Title    : ${title}`);
  console.log(`   NGO      : ${ngoWallet}`);
  console.log(`   Target   : ${targetMatic} MATIC`);
  console.log(`   Deadline : ${deadlineDays} days\n`);

  // ── 1. Deploy campaign contract ────────────────────────────────────────────
  const deployTx = await factory.deployCampaign(title, ngoWallet, targetWei, deadline);
  const receipt  = await deployTx.wait();

  // Parse campaignId + campaignAddress from event
  const iface = new hre.ethers.Interface(factoryAbi);
  const log   = receipt.logs
    .map(l => { try { return iface.parseLog(l); } catch { return null; } })
    .find(e => e?.name === "CampaignDeployed");

  const onChainId       = log.args.campaignId.toString();
  const campaignAddress = log.args.campaignAddress;

  console.log(`✅ Campaign deployed`);
  console.log(`   On-chain ID : #${onChainId}`);
  console.log(`   Address     : ${campaignAddress}`);
  console.log(`   Tx hash     : ${receipt.hash}`);

  // ── 2. Activate campaign (open for donations) ──────────────────────────────
  const activateTx = await factory.activateCampaign(onChainId);
  await activateTx.wait();
  console.log(`✅ Campaign activated — donors can now send MATIC`);

  // ── 3. Sync contract address back to Express/Django backend ────────────────
  if (backendId) {
    try {
      await axios.patch(`${BACKEND_URL}/api/campaigns/${backendId}/contract`, {
        contractAddress: campaignAddress,
        onChainId,
        network,
      });
      console.log(`🔗 Synced to backend (DB id: ${backendId})`);
    } catch (e) {
      console.warn(`⚠️  Backend sync failed: ${e.message}`);
    }
  } else {
    console.log("ℹ️  Set BACKEND_CAMPAIGN_ID env to auto-sync to backend.");
  }

  console.log("\n🎉 Campaign is live on Polygon!\n");
}

main().catch(e => { console.error(e); process.exit(1); });
