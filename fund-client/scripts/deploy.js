const { ethers, network } = require("hardhat")

async function main() {
  console.log("Deploying CrowdfundingFactory contract...")

  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory")
  const crowdfundingFactory = await CrowdfundingFactory.deploy()

  // ethers v5 API (project uses ethers@5.7.2)
  await crowdfundingFactory.deployed()

  const address = crowdfundingFactory.address
  console.log("CrowdfundingFactory deployed to:", address)

  console.log("Verifying deployment...")
  const campaignCount = await crowdfundingFactory.getCampaignCount()
  console.log("Initial campaign count:", campaignCount.toString())

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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
