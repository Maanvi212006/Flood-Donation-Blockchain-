/**
 * deploy/01_deploy_factory.js
 * Deploys CampaignFactory to Polygon Mumbai or Mainnet.
 *
 * Run:
 *   npx hardhat run deploy/01_deploy_factory.js --network mumbai
 *   npx hardhat run deploy/01_deploy_factory.js --network polygon
 */

const hre    = require("hardhat");
const fs     = require("fs");
const path   = require("path");

const PLATFORM_FEE = 2; // 2% taken from each withdrawal

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network    = hre.network.name;

  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Deploying CampaignFactory to", network.padEnd(13), "║");
  console.log("╚═══════════════════════════════════════════════╝");
  console.log(`Deployer  : ${deployer.address}`);
  console.log(`Fee       : ${PLATFORM_FEE}%\n`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Balance   : ${hre.ethers.formatEther(balance)} MATIC\n`);

  // ── Deploy ────────────────────────────────────────────────────────────────
  const Factory   = await hre.ethers.getContractFactory("CampaignFactory");
  const factory   = await Factory.deploy(PLATFORM_FEE);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ CampaignFactory: ${factoryAddress}`);

  // ── Save deployment info ──────────────────────────────────────────────────
  const artifact = await hre.artifacts.readArtifact("CampaignFactory");
  const campaignArtifact = await hre.artifacts.readArtifact("Campaign");

  const info = {
    network,
    factoryAddress,
    deployer: deployer.address,
    platformFee: PLATFORM_FEE,
    deployedAt: new Date().toISOString(),
    factoryAbi: artifact.abi,
    campaignAbi: campaignArtifact.abi,
  };

  const outDir = path.join(__dirname, "../config");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Full deployment info (used by scripts)
  fs.writeFileSync(
    path.join(outDir, `deployment.${network}.json`),
    JSON.stringify(info, null, 2)
  );

  // ABIs separately (shared with frontend + backend teams)
  fs.writeFileSync(
    path.join(outDir, "CampaignFactory.abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  fs.writeFileSync(
    path.join(outDir, "Campaign.abi.json"),
    JSON.stringify(campaignArtifact.abi, null, 2)
  );

  console.log(`📄 deployment.${network}.json saved`);
  console.log(`📄 CampaignFactory.abi.json saved`);
  console.log(`📄 Campaign.abi.json saved`);

  // ── Verify on Polygonscan ─────────────────────────────────────────────────
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n⏳ Waiting 30s for Polygonscan indexing...");
    await new Promise(r => setTimeout(r, 30000));
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [PLATFORM_FEE],
      });
      console.log("✅ Verified on Polygonscan!");
    } catch (e) {
      console.warn("⚠️  Verification failed:", e.message);
    }
  }

  console.log("\n🚀 Done! Share config/Campaign*.abi.json with your frontend team.\n");
}

main().catch(e => { console.error(e); process.exit(1); });
