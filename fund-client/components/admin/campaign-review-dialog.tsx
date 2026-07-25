"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { Campaign } from "@/lib/api";

interface CampaignReviewDialogProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fraudLoading?: boolean;
  fraudResult?: {
    riskLevel?: string;
    riskScore?: number;
    overallAssessment?: string;
    requiresManualReview?: boolean;
  } | null;
}

export function CampaignReviewDialog({
  campaign,
  open,
  onOpenChange,
  fraudLoading,
  fraudResult,
}: CampaignReviewDialogProps) {
  if (!campaign) return null;

  const creatorName =
    typeof campaign.creator === "object"
      ? campaign.creator?.name
      : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign.title}</DialogTitle>
          <DialogDescription>
            Review before approval — by {creatorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{campaign.status}</Badge>
            <Badge variant="outline">{campaign.category}</Badge>
          </div>

          <p className="text-muted-foreground">{campaign.summary}</p>

          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="font-medium">{campaign.goalAmount} ETH</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Raised</p>
              <p className="font-medium">{campaign.raisedAmount} ETH</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Backers</p>
              <p className="font-medium">{campaign.backersCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ends</p>
              <p className="font-medium">
                {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {fraudLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running AI fraud analysis...
            </div>
          )}

          {fraudResult && (
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk assessment</span>
                <Badge
                  variant={
                    fraudResult.riskLevel === "HIGH" ||
                    fraudResult.riskLevel === "CRITICAL"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {fraudResult.riskLevel} ({fraudResult.riskScore}/100)
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {fraudResult.overallAssessment}
              </p>
            </div>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link href={`/campaigns/${campaign.id}`} target="_blank">
              Open public campaign page
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
