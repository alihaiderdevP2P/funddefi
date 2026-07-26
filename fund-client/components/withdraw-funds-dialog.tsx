"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WalletConnect } from "@/components/wallet-connect";
import { useToast } from "@/hooks/use-toast";
import { campaignsAPI } from "@/lib/api";
import { formatEthLabel } from "@/lib/format-eth";
import {
  calcPlatformFee,
  formatFeePercent,
  getConfiguredFeeBps,
} from "@/lib/platform-fees";
import { smartContractService } from "@/lib/smart-contract-service";
import { EtherscanTransactionLink } from "@/components/ui/etherscan-link";
import { Banknote, Loader2 } from "lucide-react";

interface WithdrawFundsDialogProps {
  campaignId: string;
  campaignTitle: string;
  contractAddress: string;
  raisedEth: number;
  onSuccess?: () => void;
}

export function WithdrawFundsDialog({
  campaignId,
  campaignTitle,
  contractAddress,
  raisedEth,
  onSuccess,
}: WithdrawFundsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [fundsWithdrawn, setFundsWithdrawn] = useState(false);
  const [goalReached, setGoalReached] = useState(false);
  const [supportsFee, setSupportsFee] = useState(true);
  const [gross, setGross] = useState(raisedEth);
  const [fee, setFee] = useState(0);
  const [net, setNet] = useState(raisedEth);
  const [feeBps, setFeeBps] = useState(getConfiguredFeeBps());

  const checkWallet = useCallback(async () => {
    const connected = await smartContractService.isWalletConnected();
    setWalletConnected(connected);
  }, []);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const details = await smartContractService.getCampaignDetails(
        contractAddress
      );
      if (details.success && details.campaign) {
        setFundsWithdrawn(Boolean(details.campaign.fundsWithdrawn));
        setGoalReached(Boolean(details.campaign.goalReached));
      }

      const previewRes =
        await smartContractService.getWithdrawPreview(contractAddress);
      if (previewRes.success && previewRes.preview) {
        const p = previewRes.preview;
        setSupportsFee(p.supportsFee);
        setGross(Number(p.gross));
        setFee(Number(p.fee));
        setNet(Number(p.creatorNet));
        setFeeBps(p.feeBps);
      } else {
        const fallback = calcPlatformFee(raisedEth);
        setSupportsFee(false);
        setGross(fallback.gross);
        setFee(fallback.fee);
        setNet(fallback.net);
        setFeeBps(fallback.bps);
      }
    } catch {
      const fallback = calcPlatformFee(raisedEth);
      setGross(fallback.gross);
      setFee(fallback.fee);
      setNet(fallback.net);
      setFeeBps(fallback.bps);
      setSupportsFee(false);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, raisedEth]);

  useEffect(() => {
    if (open) {
      setTxHash("");
      checkWallet();
      loadPreview();
    }
  }, [open, loadPreview, checkWallet]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const result = await smartContractService.withdrawFunds(contractAddress);
      if (!result.success || !result.transactionHash) {
        throw new Error(result.error || "Withdraw failed");
      }

      setTxHash(result.transactionHash);
      setFundsWithdrawn(true);

      try {
        await campaignsAPI.update(campaignId, { status: "funded" });
      } catch (apiErr) {
        console.warn("On-chain withdraw ok; status sync pending:", apiErr);
      }

      toast({
        title: "Funds withdrawn",
        description: supportsFee
          ? `You received ~${formatEthLabel(net)} after ${formatFeePercent(feeBps)} platform fee.`
          : "Funds sent to your wallet.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Withdraw failed",
        description: error?.message || "Transaction rejected or failed",
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Banknote className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw campaign funds</DialogTitle>
          <DialogDescription>
            {campaignTitle} — goal reached. Confirm MetaMask to receive your
            share.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading on-chain balance…
          </div>
        ) : fundsWithdrawn && !txHash ? (
          <p className="text-sm text-muted-foreground py-4">
            Funds were already withdrawn for this campaign.
          </p>
        ) : (
          <div className="space-y-4">
            {!goalReached && (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                On-chain goal not marked reached yet. Withdraw may fail until
                the goal is met on the contract.
              </p>
            )}

            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross raised</span>
                <span className="font-medium">{formatEthLabel(gross, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Platform fee ({formatFeePercent(feeBps)})
                </span>
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  −{formatEthLabel(fee, true)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">You receive</span>
                <span className="font-bold text-primary">
                  {formatEthLabel(net, true)}
                </span>
              </div>
            </div>

            {!supportsFee && (
              <p className="text-xs text-muted-foreground">
                This campaign uses a legacy contract without on-chain fee split.
                Redeploy the factory for new campaigns to collect the{" "}
                {formatFeePercent(getConfiguredFeeBps())} fee automatically.
              </p>
            )}

            {txHash && (
              <div className="text-sm space-y-1">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Withdrawal confirmed
                </p>
                <EtherscanTransactionLink txHash={txHash} />
              </div>
            )}

            {!walletConnected ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Connect the creator wallet to withdraw.
                </p>
                <WalletConnect />
              </div>
            ) : (
              !txHash && (
                <Button
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={withdrawing || fundsWithdrawn}
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirm in wallet…
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-2" />
                      Confirm withdraw
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
