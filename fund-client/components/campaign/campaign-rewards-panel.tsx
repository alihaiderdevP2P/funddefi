"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { FundingFlow } from "@/components/funding-flow";
import { formatEthLabel } from "@/lib/format-eth";
import type { Campaign, Reward } from "@/lib/api";
import type { FundingRewardOption } from "./campaign-funding-sidebar";

function mapRewards(rewards: Reward[]): FundingRewardOption[] {
  return rewards.map((reward) => ({
    id: reward.id,
    amount: reward.minAmount,
    title: reward.title,
    description: reward.description,
    backers: reward.currentBackers,
    estimated: reward.deliveryDate
      ? new Date(reward.deliveryDate).toLocaleDateString()
      : "TBD",
    quantity: reward.maxBackers,
    available: reward.maxBackers
      ? reward.maxBackers - reward.currentBackers
      : undefined,
  }));
}

interface CampaignRewardsPanelProps {
  campaign: Campaign;
  onFunded?: () => void;
}

export function CampaignRewardsPanel({
  campaign,
  onFunded,
}: CampaignRewardsPanelProps) {
  const [flowOpen, setFlowOpen] = useState(false);
  const [preselectedRewardId, setPreselectedRewardId] = useState<
    string | undefined
  >();

  const rewardOptions = mapRewards(campaign.rewards);

  const openWithReward = (rewardId: string) => {
    setPreselectedRewardId(rewardId);
    setFlowOpen(true);
  };

  const handleClose = () => {
    setFlowOpen(false);
    setPreselectedRewardId(undefined);
  };

  const handleSuccess = () => {
    handleClose();
    onFunded?.();
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          Support this project
        </h3>
        {campaign.rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reward tiers — back with any amount using &quot;Back This
            Project&quot;.
          </p>
        ) : (
          campaign.rewards.map((reward) => {
            const soldOut =
              reward.maxBackers != null &&
              reward.currentBackers >= reward.maxBackers;

            return (
              <Card
                key={reward.id}
                className={`transition-all ${
                  soldOut
                    ? "opacity-60"
                    : "cursor-pointer hover:ring-2 hover:ring-primary/20"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg tabular-nums">
                      {formatEthLabel(reward.minAmount)}
                    </CardTitle>
                    <Badge variant="outline">
                      {reward.currentBackers} backers
                    </Badge>
                  </div>
                  <CardDescription className="font-medium text-foreground">
                    {reward.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>
                  {reward.deliveryDate && (
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3 mr-1" aria-hidden />
                      Estimated delivery:{" "}
                      {new Date(reward.deliveryDate).toLocaleDateString()}
                    </div>
                  )}
                  {reward.maxBackers != null && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {Math.max(0, reward.maxBackers - reward.currentBackers)}{" "}
                      of {reward.maxBackers} remaining
                    </p>
                  )}
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={soldOut}
                    onClick={() => openWithReward(reward.id)}
                  >
                    {soldOut ? "Sold out" : "Select Reward"}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <FundingFlow
        campaign={{
          id: campaign.id,
          title: campaign.title,
          creator: campaign.creator.name,
          goal: campaign.goalAmount,
          raised: campaign.raisedAmount,
          contractAddress: campaign.contractAddress,
        }}
        rewards={rewardOptions}
        isOpen={flowOpen}
        onClose={handleClose}
        preselectedRewardId={preselectedRewardId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
