"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  MessageSquare,
  Search,
  Heart,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  formatStatusLabel,
  getStatusColor,
  type BackedCampaignView,
} from "@/lib/dashboard-utils";
import { formatEthLabel } from "@/lib/format-eth";

type StatusFilter = "all" | "active" | "funded" | "failed";
type SortOption = "recent" | "amount" | "ending";

interface DashboardBackedTabProps {
  campaigns: BackedCampaignView[];
  loading?: boolean;
}

function BackedSkeleton() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="overflow-hidden p-6">
          <div className="md:flex gap-6">
            <Skeleton className="md:w-48 aspect-video md:aspect-square rounded-lg" />
            <div className="flex-1 space-y-4 mt-4 md:mt-0">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DashboardBackedTab({
  campaigns,
  loading = false,
}: DashboardBackedTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filtered = useMemo(() => {
    let result = [...campaigns];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.creator.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.pledgeAmount - a.pledgeAmount;
        case "ending":
          return a.daysLeft - b.daysLeft;
        default:
          return (
            new Date(b.backedAt).getTime() - new Date(a.backedAt).getTime()
          );
      }
    });

    return result;
  }, [campaigns, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <BackedSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Campaigns You&apos;ve Backed</h2>
        <Button variant="outline" asChild>
          <Link href="/campaigns">Discover More Campaigns</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search backed campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Backed</SelectItem>
            <SelectItem value="amount">Pledge Amount</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {campaigns.length === 0
              ? "No backed campaigns yet"
              : "No campaigns match your filters"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {campaigns.length === 0
              ? "Explore campaigns and support projects you believe in."
              : "Try adjusting your search or filter criteria."}
          </p>
          {campaigns.length === 0 && (
            <Button asChild>
              <Link href="/campaigns">
                <Heart className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6">
          {filtered.map((campaign) => (
            <Card key={campaign.fundingId} className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-48 aspect-video md:aspect-square relative">
                  <ImageWithFallback
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full"
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {formatStatusLabel(campaign.status)}
                        </Badge>
                        {campaign.daysLeft > 0 && campaign.status === "active" && (
                          <span className="text-sm text-muted-foreground">
                            {campaign.daysLeft} days left
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {campaign.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        by {campaign.creator}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {formatEthLabel(campaign.pledgeAmount, true)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your pledge
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatEthLabel(campaign.raised, true)} /{" "}
                        {formatEthLabel(campaign.goal, true)}
                      </span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        Reward: {campaign.reward}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Backed:{" "}
                        {new Date(campaign.backedAt).toLocaleDateString()} •
                        Last update:{" "}
                        {new Date(campaign.lastUpdate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Campaign
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/contact?campaign=${campaign.id}&creator=${campaign.creatorId ?? ""}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message Creator
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
