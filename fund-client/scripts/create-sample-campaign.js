const { ethers } = require("hardhat")

async function main() {
  // Replace with your deployed factory address
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0x..."

  console.log("Creating sample campaign...")

  // Get contract instance
  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory")
  const factory = CrowdfundingFactory.attach(FACTORY_ADDRESS)

  // Sample campaign data
  const campaignData = {
    title: "EcoCharge Solar Stations",
    description: "Revolutionary solar charging stations for electric vehicles in urban areas.",
    goal: ethers.parseEther("75"), // 75 ETH
    durationInDays: 30,
    category: "Technology",
  }

  // Create campaign
  const tx = await factory.createCampaign(
    campaignData.title,
    campaignData.description,
    campaignData.goal,
    campaignData.durationInDays,
    campaignData.category,
  )

  console.log("Transaction hash:", tx.hash)

  // Wait for transaction confirmation
  const receipt = await tx.wait()
  console.log("Campaign created successfully!")

  // Get the campaign address from events
  const event = receipt.logs.find((log) => {
    try {
      return factory.interface.parseLog(log).name === "CampaignCreated"
    } catch {
      return false
    }
  })

  if (event) {
    const parsedEvent = factory.interface.parseLog(event)
    console.log("Campaign address:", parsedEvent.args.campaignAddress)
    console.log("Creator:", parsedEvent.args.creator)
    console.log("Goal:", ethers.formatEther(parsedEvent.args.goal), "ETH")
  }

  // Get all campaigns
  const campaigns = await factory.getDeployedCampaigns()
  console.log("Total campaigns:", campaigns.length)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
