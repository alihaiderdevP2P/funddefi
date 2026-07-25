const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying CrowdfundingFactory contract...")

  // Get the contract factory
  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory")

  // Deploy the contract
  const crowdfundingFactory = await CrowdfundingFactory.deploy()

  // Wait for deployment to complete
  await crowdfundingFactory.waitForDeployment()

  const address = await crowdfundingFactory.getAddress()
  console.log("CrowdfundingFactory deployed to:", address)

  // Verify deployment
  console.log("Verifying deployment...")
  const campaignCount = await crowdfundingFactory.getCampaignCount()
  console.log("Initial campaign count:", campaignCount.toString())

  // Save deployment info
  const deploymentInfo = {
    contractAddress: address,
    network: network.name,
    deployedAt: new Date().toISOString(),
    deployer: (await ethers.getSigners())[0].address,
  }

  console.log("Deployment completed successfully!")
  console.log("Deployment info:", deploymentInfo)

  return deploymentInfo
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
