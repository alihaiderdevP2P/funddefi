"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FundingButton } from "@/components/funding-button";
import { CampaignSaveButton } from "./campaign-save-button";
import { CampaignShareButton } from "./campaign-share-button";
import {
  calcFundingProgress,
  formatEthAmount,
  formatEthLabel,
} from "@/lib/format-eth";
import { useCountdown } from "@/hooks/use-countdown";
import type { Campaign, Reward } from "@/lib/api";

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

interface CampaignFundingSidebarProps {
  campaign: Campaign;
  onFunded?: () => void;
}

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

export function CampaignFundingSidebar({
  campaign,
  onFunded,
}: CampaignFundingSidebarProps) {
  const progress = calcFundingProgress(
    campaign.raisedAmount,
    campaign.goalAmount
  );
  const countdown = useCountdown(campaign.endDate);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="text-3xl font-bold text-foreground tabular-nums">
          {formatEthLabel(campaign.raisedAmount)}
        </div>
        <div className="text-muted-foreground">
          raised of {formatEthAmount(campaign.goalAmount)} ETH goal
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-3" aria-valuenow={progress} />
          <p className="text-xs text-muted-foreground text-right">
            {progress.toFixed(1)}% funded
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {campaign.backersCount}
            </div>
            <div className="text-sm text-muted-foreground">backers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {countdown.isEnded ? "0" : countdown.days}
            </div>
            <div className="text-sm text-muted-foreground">
              {countdown.label}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <FundingButton
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            campaignCreator={campaign.creator.name}
            campaignGoal={campaign.goalAmount}
            campaignRaised={campaign.raisedAmount}
            contractAddress={campaign.contractAddress}
            rewards={mapRewards(campaign.rewards)}
            minAmount={0.01}
            onSuccess={onFunded}
          />
          <div className="flex gap-2">
            <CampaignSaveButton campaignId={campaign.id} />
            <CampaignShareButton
              title={campaign.title}
              summary={campaign.summary}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          All or nothing. This project will only be funded if it reaches its
          goal by{" "}
          <span className="font-medium">
            {new Date(campaign.endDate).toLocaleDateString()}
          </span>
          .
        </div>
      </CardContent>
    </Card>
  );
}
