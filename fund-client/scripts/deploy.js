const { ethers, network } = require("hardhat")

async function main() {
  console.log("Deploying CrowdfundingFactory contract...")

  const [deployer] = await ethers.getSigners()
  const feeRecipient =
    process.env.PLATFORM_TREASURY_ADDRESS ||
    process.env.NEXT_PUBLIC_PLATFORM_TREASURY_ADDRESS ||
    deployer.address
  const feeBps = Number(
    process.env.PLATFORM_FEE_BPS ||
      process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ||
      500
  )

  if (feeBps < 0 || feeBps > 1000) {
    throw new Error("PLATFORM_FEE_BPS must be between 0 and 1000")
  }

  console.log("Deployer:", deployer.address)
  console.log("Fee recipient (treasury):", feeRecipient)
  console.log("Platform fee (bps):", feeBps, `(${feeBps / 100}%)`)

  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory")
  const crowdfundingFactory = await CrowdfundingFactory.deploy(feeRecipient, feeBps)

  // ethers v5 API (project uses ethers@5.7.2)
  await crowdfundingFactory.deployed()

  const address = crowdfundingFactory.address
  console.log("CrowdfundingFactory deployed to:", address)

  console.log("Verifying deployment...")
  const campaignCount = await crowdfundingFactory.getCampaignCount()
  console.log("Initial campaign count:", campaignCount.toString())
  console.log("Factory feeBps:", (await crowdfundingFactory.feeBps()).toString())
  console.log("Factory feeRecipient:", await crowdfundingFactory.feeRecipient())

  const deploymentInfo = {
    contractAddress: address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    feeRecipient,
    feeBps,
  }

  console.log("Deployment completed successfully!")
  console.log("Deployment info:", deploymentInfo)
  console.log(
    "\nSet NEXT_PUBLIC_FACTORY_ADDRESS=" +
      address +
      " and NEXT_PUBLIC_PLATFORM_TREASURY_ADDRESS=" +
      feeRecipient +
      " in fund-client/.env"
  )

  return deploymentInfo
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
