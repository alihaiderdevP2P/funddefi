import { ethers } from "ethers";
import { contractService } from "./contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class SmartContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  async isWalletConnected(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts.length > 0;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) return null;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Error getting connected address:", error);
      return null;
    }
  }

  async createCampaign(campaignData: {
    title: string;
    description: string;
    goal: string;
    duration: number;
    category: string;
  }) {
    if (!this.signer) await this.initialize();

    try {
      const result = await contractService.createCampaign(
        campaignData.title,
        campaignData.description,
        campaignData.goal,
        campaignData.duration,
        campaignData.category
      );

      return {
        success: true,
        transactionHash: result.hash,
        campaignAddress: result.logs?.[0]?.address || null,
      };
    } catch (error: any) {
      console.error("Campaign creation error:", error);
      return {
        success: false,
        error: error.message || "Failed to create campaign",
      };
    }
  }

  async contributeToCampaign(campaignAddress: string, amount: string) {
    if (!this.signer) await this.initialize();

    try {
      const result = await contractService.contributeToCampaign(
        campaignAddress,
        amount
      );

      return {
        success: true,
        transactionHash: result.hash,
        amount: amount,
      };
    } catch (error: any) {
      console.error("Contribution error:", error);
      return {
        success: false,
        error: error.message || "Failed to contribute to campaign",
      };
    }
  }

  async getCampaignDetails(campaignAddress: string) {
    try {
      const details = await contractService.getCampaignDetails(campaignAddress);
      return {
        success: true,
        campaign: details,
      };
    } catch (error: any) {
      console.error("Error fetching campaign details:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch campaign details",
      };
    }
  }

  async getUserContributions(campaignAddress: string, userAddress: string) {
    try {
      const contribution = await contractService.getUserContribution(
        campaignAddress,
        userAddress
      );
      return {
        success: true,
        contribution,
      };
    } catch (error: any) {
      console.error("Error fetching user contributions:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch contributions",
      };
    }
  }

  async getAllCampaigns() {
    try {
      const campaigns = await contractService.getAllCampaigns();
      return {
        success: true,
        campaigns,
      };
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch campaigns",
      };
    }
  }

  // Utility methods
  formatEther(wei: string): string {
    return ethers.utils.formatEther(wei);
  }

  parseEther(ether: string): string {
    return ethers.utils.parseEther(ether).toString();
  }

  isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }
}

// Export singleton instance
export const smartContractService = new SmartContractService();
