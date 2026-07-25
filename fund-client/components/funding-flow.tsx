"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RewardSelector, type RewardOption } from "./reward-selector";
import { WalletGuard } from "./wallet-guard";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fundingAPI } from "@/lib/api";
import { smartContractService } from "@/lib/smart-contract-service";
import { formatEthAmount, formatEthLabel, calcFundingProgress } from "@/lib/format-eth";
import { EtherscanTransactionLink } from "@/components/ui/etherscan-link";
import { ethers } from "ethers";

interface Campaign {
  id: string;
  title: string;
  creator: string;
  goal: number;
  raised: number;
  contractAddress?: string;
}

interface FundingFlowProps {
  campaign: Campaign;
  rewards: RewardOption[];
  isOpen: boolean;
  onClose: () => void;
  preselectedRewardId?: string;
  onSuccess?: () => void;
  minPledgeEth?: number;
}

type FundingStep = "rewards" | "details" | "payment" | "confirmation";

const STEPS: FundingStep[] = ["rewards", "details", "payment", "confirmation"];

export function FundingFlow({
  campaign,
  rewards,
  isOpen,
  onClose,
  preselectedRewardId,
  onSuccess,
  minPledgeEth = 0.01,
}: FundingFlowProps) {
  const [currentStep, setCurrentStep] = useState<FundingStep>("rewards");
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [backerDetails, setBackerDetails] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && preselectedRewardId) {
      const reward = rewards.find((r) => r.id === preselectedRewardId);
      if (reward) {
        setSelectedReward(reward);
        setCurrentStep("details");
      }
    }
  }, [isOpen, preselectedRewardId, rewards]);

  const pledgeAmount = selectedReward
    ? Number(selectedReward.amount)
    : Number(customAmount) || 0;

  const resetFlow = () => {
    setCurrentStep("rewards");
    setSelectedReward(null);
    setCustomAmount("");
    setBackerDetails({ name: "", email: "", message: "" });
    setIsProcessing(false);
    setTxHash("");
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const nextStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  };

  const prevStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  };

  const handlePayment = async () => {
    if (pledgeAmount < minPledgeEth) {
      toast({
        title: "Invalid amount",
        description: `Minimum pledge is ${minPledgeEth} ETH`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let transactionHash: string;

      if (campaign.contractAddress) {
        const result = await smartContractService.contributeToCampaign(
          campaign.contractAddress,
          String(pledgeAmount)
        );
        if (!result.success || !result.transactionHash) {
          throw new Error(result.error || "Blockchain transaction failed");
        }
        transactionHash = result.transactionHash;
      } else if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (!accounts?.length) throw new Error("No wallet connected");

        const valueHex = ethers.utils.parseEther(String(pledgeAmount)).toHexString();
        transactionHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: accounts[0],
              to: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              value: valueHex,
              gas: "0x5208",
            },
          ],
        });
      } else {
        throw new Error("Wallet not available. Connect MetaMask to continue.");
      }

      setTxHash(transactionHash);

      try {
        await fundingAPI.create({
          amount: pledgeAmount,
          transactionHash,
          campaignId: campaign.id,
          rewardId: selectedReward?.id,
          message: backerDetails.message || undefined,
          backerInfo: {
            name: backerDetails.name,
            email: backerDetails.email,
          },
          status: "confirmed",
        });
      } catch (apiErr) {
        console.warn("Funding recorded on-chain; API sync pending:", apiErr);
        toast({
          title: "Transaction sent",
          description:
            "Your payment was submitted. Backer record may sync shortly.",
        });
      }

      toast({
        title: "Funding successful!",
        description: `You backed ${campaign.title} with ${formatEthLabel(pledgeAmount)}`,
      });

      setCurrentStep("confirmation");
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to process funding";
      console.error("Payment error:", error);
      toast({
        title: "Transaction failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = calcFundingProgress(campaign.raised, campaign.goal);

  const renderStepContent = () => {
    switch (currentStep) {
      case "rewards":
        return (
          <RewardSelector
            rewards={rewards}
            selectedReward={selectedReward}
            customAmount={customAmount}
            onRewardSelect={setSelectedReward}
            onCustomAmountChange={setCustomAmount}
            onProceed={nextStep}
            minPledgeEth={minPledgeEth}
          />
        );

      case "details":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Backer information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={backerDetails.name}
                    onChange={(e) =>
                      setBackerDetails({
                        ...backerDetails,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={backerDetails.email}
                    onChange={(e) =>
                      setBackerDetails({
                        ...backerDetails,
                        email: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For project updates and reward delivery
                  </p>
                </div>
                <div>
                  <Label htmlFor="message">Message to Creator (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why you're excited about this project..."
                    value={backerDetails.message}
                    onChange={(e) =>
                      setBackerDetails({
                        ...backerDetails,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Pledge Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      {selectedReward ? selectedReward.title : "Custom pledge"}
                    </span>
                    <span className="tabular-nums">
                      {formatEthLabel(pledgeAmount)}
                    </span>
                  </div>
                  {selectedReward && (
                    <p className="text-xs text-muted-foreground">
                      Estimated delivery: {selectedReward.estimated}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review and pay</h3>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Payment breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Your pledge</span>
                      <span className="tabular-nums font-medium">
                        {formatEthLabel(pledgeAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Network</span>
                      <span>Ethereum (wallet gas applies)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start space-x-2 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">All-or-nothing funding</p>
                  <p className="text-muted-foreground">
                    Funds are held in the campaign smart contract until the goal
                    is met or the deadline passes.
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={
                  isProcessing || !backerDetails.name || !backerDetails.email
                }
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing transaction...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Confirm pledge {formatEthLabel(pledgeAmount)}
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Thank you for your support!
              </h3>
              <p className="text-muted-foreground">
                You backed &quot;{campaign.title}&quot; with{" "}
                {formatEthLabel(pledgeAmount)}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {txHash && (
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span>Transaction</span>
                    <EtherscanTransactionLink txHash={txHash} />
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Amount</span>
                  <span className="tabular-nums">
                    {formatEthLabel(pledgeAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reward</span>
                  <span>{selectedReward?.title ?? "No reward"}</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles: Record<FundingStep, string> = {
    rewards: "Choose your reward",
    details: "Your information",
    payment: "Complete your pledge",
    confirmation: "Pledge confirmed",
  };

  const stepDescriptions: Record<FundingStep, string> = {
    rewards: "Select a reward tier or pledge a custom ETH amount",
    details: "Details for project updates and reward delivery",
    payment: "Review your pledge and sign with your wallet",
    confirmation: "Your support means everything to this creator",
  };

  return (
    <WalletGuard
      title="Connect to back project"
      description="Connect your wallet to support this campaign"
    >
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{stepTitles[currentStep]}</DialogTitle>
                <DialogDescription>
                  {stepDescriptions[currentStep]}
                </DialogDescription>
              </div>
              {currentStep !== "confirmation" && (
                <Badge variant="outline">
                  Step {STEPS.indexOf(currentStep) + 1} of 4
                </Badge>
              )}
            </div>
          </DialogHeader>

          {currentStep !== "confirmation" && (
            <Progress
              value={((STEPS.indexOf(currentStep) + 1) / 4) * 100}
              className="mb-6"
            />
          )}

          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium">{campaign.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    by {campaign.creator}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium tabular-nums">
                    {formatEthAmount(campaign.raised)} /{" "}
                    {formatEthAmount(campaign.goal)} ETH
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress.toFixed(0)}% funded
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">{renderStepContent()}</div>

          {currentStep !== "confirmation" && currentStep !== "rewards" && (
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep === "details" && (
                <Button
                  onClick={nextStep}
                  disabled={!backerDetails.name || !backerDetails.email}
                >
                  Continue to payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </WalletGuard>
  );
}
