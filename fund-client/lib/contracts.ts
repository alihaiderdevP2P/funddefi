import { ethers } from "ethers";

// Contract ABIs (simplified for demo)
export const CROWDFUNDING_FACTORY_ABI = [
  "function createCampaign(string memory _title, string memory _description, uint256 _goal, uint256 _durationInDays, string memory _category) public",
  "function getDeployedCampaigns() public view returns (address[] memory)",
  "function getCampaignsByCreator(address creator) public view returns (address[] memory)",
  "function getCampaignCount() public view returns (uint256)",
  "event CampaignCreated(address indexed campaignAddress, address indexed creator, string title, uint256 goal, uint256 deadline)",
];

export const CAMPAIGN_ABI = [
  "function contribute() public payable",
  "function withdrawFunds() public",
  "function requestRefund() public",
  "function cancelCampaign() public",
  "function getSummary() public view returns (address, string memory, string memory, uint256, uint256, uint256, uint256, bool, bool, bool)",
  "function getContributorCount() public view returns (uint256)",
  "function isActive() public view returns (bool)",
  "function getTimeRemaining() public view returns (uint256)",
  "function contributions(address) public view returns (uint256, uint256, bool)",
  "event ContributionMade(address indexed contributor, uint256 amount)",
  "event GoalReached(uint256 totalAmount)",
  "event FundsWithdrawn(address indexed creator, uint256 amount)",
  "event RefundIssued(address indexed contributor, uint256 amount)",
];

// Contract addresses (replace with actual deployed addresses)
export const CONTRACT_ADDRESSES = {
  CROWDFUNDING_FACTORY: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x...",
  // Add other contract addresses as needed
};

// Network configurations
export const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum Mainnet", rpcUrl: "https://mainnet.infura.io/v3/..." },
  11155111: {
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/...",
  },
  137: { name: "Polygon", rpcUrl: "https://polygon-rpc.com" },
  80001: {
    name: "Mumbai Testnet",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
  },
};

// Utility functions for contract interactions
export class ContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  async getFactoryContract() {
    if (!this.signer) await this.initialize();
    if (!this.signer) throw new Error("No signer available");
    return new ethers.Contract(
      CONTRACT_ADDRESSES.CROWDFUNDING_FACTORY,
      CROWDFUNDING_FACTORY_ABI,
      this.signer
    );
  }

  async getCampaignContract(address: string) {
    if (!this.signer) await this.initialize();
    if (!this.signer) throw new Error("No signer available");
    return new ethers.Contract(address, CAMPAIGN_ABI, this.signer);
  }

  async createCampaign(
    title: string,
    description: string,
    goalInEth: string,
    durationInDays: number,
    category: string
  ) {
    const factory = await this.getFactoryContract();
    const goalInWei = ethers.utils.parseEther(goalInEth);

    const tx = await factory.createCampaign(
      title,
      description,
      goalInWei,
      durationInDays,
      category
    );

    return await tx.wait();
  }

  async contributeToCampaign(campaignAddress: string, amountInEth: string) {
    const campaign = await this.getCampaignContract(campaignAddress);
    const amountInWei = ethers.utils.parseEther(amountInEth);

    const tx = await campaign.contribute({ value: amountInWei });
    return await tx.wait();
  }

  async getCampaignDetails(campaignAddress: string) {
    const campaign = await this.getCampaignContract(campaignAddress);
    const summary = await campaign.getSummary();

    return {
      creator: summary[0],
      title: summary[1],
      description: summary[2],
      goal: ethers.utils.formatEther(summary[3]),
      deadline: new Date(Number(summary[4]) * 1000),
      totalRaised: ethers.utils.formatEther(summary[5]),
      contributorCount: Number(summary[6]),
      goalReached: summary[7],
      fundsWithdrawn: summary[8],
      campaignCancelled: summary[9],
    };
  }

  async getAllCampaigns() {
    const factory = await this.getFactoryContract();
    const campaignAddresses = await factory.getDeployedCampaigns();

    const campaigns = await Promise.all(
      campaignAddresses.map(async (address: string) => {
        try {
          const details = await this.getCampaignDetails(address);
          return { address, ...details };
        } catch (error) {
          console.error(`Error fetching campaign ${address}:`, error);
          return null;
        }
      })
    );

    return campaigns.filter(Boolean);
  }

  async getUserContribution(campaignAddress: string, userAddress: string) {
    const campaign = await this.getCampaignContract(campaignAddress);
    const contribution = await campaign.contributions(userAddress);

    return {
      amount: ethers.utils.formatEther(contribution[0]),
      timestamp: new Date(Number(contribution[1]) * 1000),
      refunded: contribution[2],
    };
  }
}

// Export singleton instance
export const contractService = new ContractService();
