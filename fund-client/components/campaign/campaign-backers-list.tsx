"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { formatEthLabel } from "@/lib/format-eth";
import type { Funding } from "@/lib/api";
import { EtherscanTransactionLink } from "@/components/ui/etherscan-link";

interface CampaignBackersListProps {
  fundings: Funding[];
  loading: boolean;
}

export function CampaignBackersList({
  fundings,
  loading,
}: CampaignBackersListProps) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (fundings.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        role="status"
      >
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden />
        <p>No backers yet. Be the first to support this campaign!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" role="list" aria-label="Campaign backers">
      {fundings.map((funding) => (
        <li key={funding.id}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar>
                    <AvatarImage
                      src={funding.user?.avatar || "/placeholder.svg"}
                      alt=""
                    />
                    <AvatarFallback>
                      {(funding.user?.name || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {funding.user?.name || "Anonymous backer"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(funding.createdAt).toLocaleDateString()}
                    </div>
                    {funding.reward && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Reward: {funding.reward.title}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold tabular-nums">
                    {formatEthLabel(funding.amount)}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                    {funding.status}
                  </Badge>
                  {funding.transactionHash && (
                    <div className="mt-1">
                      <EtherscanTransactionLink
                        txHash={funding.transactionHash}
                        label="View tx"
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
              {funding.message && (
                <p className="mt-3 text-sm text-muted-foreground border-l-2 border-muted pl-3">
                  {funding.message}
                </p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
