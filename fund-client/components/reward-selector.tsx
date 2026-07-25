"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Check, Gift } from "lucide-react";
import { formatEthLabel } from "@/lib/format-eth";

export interface RewardOption {
  id: string;
  amount: number;
  title: string;
  description: string;
  backers: number;
  estimated: string;
  quantity?: number;
  available?: number;
}

interface RewardSelectorProps {
  rewards: RewardOption[];
  selectedReward: RewardOption | null;
  customAmount: string;
  onRewardSelect: (reward: RewardOption | null) => void;
  onCustomAmountChange: (amount: string) => void;
  onProceed: () => void;
  minPledgeEth?: number;
}

export function RewardSelector({
  rewards,
  selectedReward,
  customAmount,
  onRewardSelect,
  onCustomAmountChange,
  onProceed,
  minPledgeEth = 0.01,
}: RewardSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomPledge = () => {
    setShowCustom(true);
    onRewardSelect(null);
  };

  const customNum = Number.parseFloat(customAmount) || 0;
  const isValidCustom = customNum >= minPledgeEth;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select a reward</h3>
        <Button variant="outline" size="sm" onClick={handleCustomPledge}>
          <Gift className="w-4 h-4 mr-2" />
          Custom Amount
        </Button>
      </div>

      {showCustom && (
        <Card
          className={`border-2 transition-all ${!selectedReward ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <CardHeader>
            <CardTitle className="text-lg">Pledge without a reward</CardTitle>
            <CardDescription>
              Support the project with a custom ETH amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom-amount">Pledge Amount (ETH)</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.1"
                value={customAmount}
                onChange={(e) => onCustomAmountChange(e.target.value)}
                min={minPledgeEth}
                step="0.001"
              />
            </div>
            <Button
              onClick={onProceed}
              disabled={!isValidCustom}
              className="w-full"
              variant={!selectedReward ? "default" : "outline"}
            >
              {!selectedReward && <Check className="w-4 h-4 mr-2" />}
              Pledge {customAmount ? `${customAmount} ETH` : "—"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rewards.map((reward) => {
          const soldOut =
            reward.available !== undefined && reward.available <= 0;

          return (
            <Card
              key={reward.id}
              className={`border-2 transition-all ${
                soldOut
                  ? "opacity-60 cursor-not-allowed"
                  : `cursor-pointer hover:border-primary/50 ${
                      selectedReward?.id === reward.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`
              }`}
              onClick={() => !soldOut && onRewardSelect(reward)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg tabular-nums">
                    {formatEthLabel(reward.amount)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {reward.available !== undefined &&
                      reward.available <= 10 &&
                      reward.available > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {reward.available} left
                        </Badge>
                      )}
                    <Badge variant="outline">{reward.backers} backers</Badge>
                  </div>
                </div>
                <CardDescription className="font-medium text-foreground">
                  {reward.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Estimated delivery: {reward.estimated}
                  </div>
                  <Button
                    size="sm"
                    disabled={soldOut}
                    variant={
                      selectedReward?.id === reward.id ? "default" : "outline"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (soldOut) return;
                      if (selectedReward?.id === reward.id) onProceed();
                      else onRewardSelect(reward);
                    }}
                  >
                    {selectedReward?.id === reward.id && (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {soldOut
                      ? "Sold out"
                      : selectedReward?.id === reward.id
                        ? "Selected"
                        : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedReward && (
        <Button onClick={onProceed} size="lg" className="w-full">
          Continue with {formatEthLabel(selectedReward.amount)} pledge
        </Button>
      )}
    </div>
  );
}
