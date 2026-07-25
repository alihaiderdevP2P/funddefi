"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Eye,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/admin-api";
import type { Campaign } from "@/lib/api";
import { CampaignReviewDialog } from "./campaign-review-dialog";

interface AdminCampaignsTabProps {
  onStatsChange?: () => void;
}

export function AdminCampaignsTab({ onStatsChange }: AdminCampaignsTabProps) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewCampaign, setReviewCampaign] = useState<Campaign | null>(null);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fraudResult, setFraudResult] = useState<Record<string, unknown> | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        search?: string;
        status?: string;
        limit?: number;
      } = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all" && statusFilter !== "pending") {
        params.status = statusFilter;
      }

      const data = await adminAPI.getCampaigns(params);
      setCampaigns(data.campaigns);
      setTotal(data.total);
    } catch {
      toast({
        title: "Failed to load campaigns",
        description: "Ensure the backend is running and you are logged in as admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleStatus = async (
    id: string,
    status: "active" | "cancelled",
    label: string
  ) => {
    setActionId(id);
    try {
      await adminAPI.updateCampaignStatus(id, status);
      toast({ title: `Campaign ${label}` });
      await load();
      onStatsChange?.();
    } catch {
      toast({
        title: "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  const openReview = async (campaign: Campaign) => {
    setReviewCampaign(campaign);
    setFraudResult(null);
    setFraudLoading(true);
    try {
      const res = await fetch("/api/ai/fraud-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignData: {
            title: campaign.title,
            description: campaign.description,
            goal: campaign.goalAmount,
            duration: Math.max(
              1,
              Math.ceil(
                (new Date(campaign.endDate).getTime() - Date.now()) /
                  (86400000)
              )
            ),
            category: campaign.category,
          },
          creatorData: {
            verified:
              typeof campaign.creator === "object"
                ? campaign.creator?.isVerified
                : false,
            previousCampaigns: 0,
          },
        }),
      });
      const json = await res.json();
      setFraudResult(json.fraudAnalysis || null);
    } catch {
      setFraudResult(null);
    } finally {
      setFraudLoading(false);
    }
  };

  const pending = campaigns.filter((c) => c.status === "draft");
  const displayList =
    statusFilter === "pending"
      ? pending
      : campaigns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Campaign Management</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {pending.length} campaign(s) awaiting review • {total} total in
            filter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No campaigns match your filters.
            </p>
          ) : (
            <div className="space-y-4">
              {displayList.map((campaign) => {
                const creatorName =
                  typeof campaign.creator === "object"
                    ? campaign.creator?.name
                    : "Unknown";
                const busy = actionId === campaign.id;

                return (
                  <div
                    key={campaign.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{campaign.title}</h3>
                        <Badge variant="outline">{campaign.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {creatorName} • {campaign.goalAmount} ETH goal •{" "}
                        {campaign.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReview(campaign)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      {campaign.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            disabled={busy}
                            onClick={() =>
                              handleStatus(campaign.id, "active", "approved")
                            }
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={busy}
                            onClick={() =>
                              handleStatus(
                                campaign.id,
                                "cancelled",
                                "rejected"
                              )
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {campaign.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          disabled={busy}
                          onClick={() =>
                            handleStatus(
                              campaign.id,
                              "cancelled",
                              "cancelled"
                            )
                          }
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignReviewDialog
        campaign={reviewCampaign}
        open={!!reviewCampaign}
        onOpenChange={(o) => !o && setReviewCampaign(null)}
        fraudLoading={fraudLoading}
        fraudResult={
          fraudResult as {
            riskLevel?: string;
            riskScore?: number;
            overallAssessment?: string;
          } | null
        }
      />
    </div>
  );
}
