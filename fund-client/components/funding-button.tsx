"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FundingFlow } from "./funding-flow";
import { Heart } from "lucide-react";

export interface FundingRewardOption {
  id: string;
  amount: number;
  title: string;
  description: string;
  backers: number;
  estimated: string;
  quantity?: number;
  available?: number;
}

interface FundingButtonProps {
  campaignId: string;
  campaignTitle: string;
  campaignCreator: string;
  campaignGoal: number;
  campaignRaised: number;
  contractAddress?: string;
  rewards: FundingRewardOption[];
  minAmount?: number;
  preselectedRewardId?: string;
  onSuccess?: () => void;
}

export function FundingButton({
  campaignId,
  campaignTitle,
  campaignCreator,
  campaignGoal,
  campaignRaised,
  contractAddress,
  rewards,
  minAmount = 0.01,
  preselectedRewardId,
  onSuccess,
}: FundingButtonProps) {
  const [isFlowOpen, setIsFlowOpen] = useState(false);

  const campaign = {
    id: campaignId,
    title: campaignTitle,
    creator: campaignCreator,
    goal: campaignGoal,
    raised: campaignRaised,
    contractAddress,
  };

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setIsFlowOpen(true)}>
        <Heart className="w-5 h-5 mr-2" />
        Back This Project
      </Button>

      <FundingFlow
        campaign={campaign}
        rewards={rewards}
        isOpen={isFlowOpen}
        onClose={() => setIsFlowOpen(false)}
        preselectedRewardId={preselectedRewardId}
        onSuccess={onSuccess}
        minPledgeEth={minAmount}
      />
    </>
  );
}
