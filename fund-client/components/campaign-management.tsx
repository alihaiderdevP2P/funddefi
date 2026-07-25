"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Pause,
  MessageSquare,
  Settings,
  ExternalLink,
  Send,
  Package,
  BarChart3,
  Loader2,
  Rocket,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Link from "next/link";
import {
  campaignsAPI,
  fundingAPI,
  type Funding,
} from "@/lib/api";
import {
  formatStatusLabel,
  getStatusColor,
  type CreatedCampaignView,
} from "@/lib/dashboard-utils";
import { formatEthLabel } from "@/lib/format-eth";
import { useToast } from "@/hooks/use-toast";

interface CampaignManagementProps {
  campaigns: CreatedCampaignView[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onViewAnalytics?: () => void;
}

function ManagementSkeleton() {
  return (
    <Card className="overflow-hidden p-6">
      <div className="md:flex gap-6">
        <Skeleton className="md:w-48 aspect-video md:aspect-square rounded-lg" />
        <div className="flex-1 space-y-4 mt-4 md:mt-0">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>
    </Card>
  );
}

function CampaignEditDialog({
  campaign,
  onSaved,
}: {
  campaign: CreatedCampaignView;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [backers, setBackers] = useState<Funding[]>([]);
  const [updates, setUpdates] = useState<
    Array<{ id: string; title: string; content: string; createdAt: string }>
  >([]);
  const [loadingBackers, setLoadingBackers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);

  const loadDialogData = useCallback(async () => {
    setLoadingBackers(true);
    try {
      const [backerData, updateData] = await Promise.all([
        fundingAPI.getByCampaign(campaign.id),
        campaignsAPI.getUpdates(campaign.id),
      ]);
      setBackers(backerData.filter((f: Funding) => f.status === "confirmed"));
      setUpdates(updateData);
    } catch {
      toast({
        title: "Failed to load campaign details",
        variant: "destructive",
      });
    } finally {
      setLoadingBackers(false);
    }
  }, [campaign.id, toast]);

  useEffect(() => {
    if (open) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      loadDialogData();
    }
  }, [open, campaign.title, campaign.description, loadDialogData]);

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await campaignsAPI.update(campaign.id, { title, description });
      toast({ title: "Campaign updated successfully" });
      onSaved();
    } catch {
      toast({ title: "Failed to update campaign", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePostUpdate = async () => {
    if (!updateTitle.trim() || !updateContent.trim()) {
      toast({
        title: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    setPostingUpdate(true);
    try {
      await campaignsAPI.createUpdate(campaign.id, {
        title: updateTitle,
        content: updateContent,
      });
      toast({ title: "Update posted successfully" });
      setUpdateTitle("");
      setUpdateContent("");
      const updateData = await campaignsAPI.getUpdates(campaign.id);
      setUpdates(updateData);
      onSaved();
    } catch {
      toast({ title: "Failed to post update", variant: "destructive" });
    } finally {
      setPostingUpdate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update your campaign details and settings
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="backers">Backers</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            <Button onClick={handleSaveDetails} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Update Title</label>
              <Input
                placeholder="Update title..."
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Post Update</label>
              <Textarea
                placeholder="Share news about your campaign progress..."
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handlePostUpdate} disabled={postingUpdate}>
              {postingUpdate ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Update
            </Button>
            {updates.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Previous Updates</p>
                {updates.map((u) => (
                  <div key={u.id} className="p-3 bg-muted/50 rounded text-sm">
                    <p className="font-medium">{u.title}</p>
                    <p className="text-muted-foreground line-clamp-2">
                      {u.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="backers" className="space-y-4">
            {loadingBackers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : backers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No backers yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {backers.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {b.user?.name ||
                          b.backerInfo?.name ||
                          "Anonymous Backer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pledged {formatEthLabel(Number(b.amount), true)} •{" "}
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/contact?backer=${b.user?.id ?? ""}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            {campaign.rewards.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No rewards configured
              </p>
            ) : (
              <div className="space-y-2">
                {campaign.rewards.map((reward) => (
                  <div key={reward.id} className="p-3 bg-muted/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {reward.title} — {formatEthLabel(reward.minAmount, true)}
                      </p>
                      <Badge variant="secondary">
                        {reward.currentBackers} claimed
                        {reward.maxBackers ? ` / ${reward.maxBackers}` : ""}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      disabled
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Manage Fulfillment
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function CampaignManagement({
  campaigns,
  loading = false,
  onRefresh,
  onViewAnalytics,
}: CampaignManagementProps) {
  const { toast } = useToast();
  const [pausingId, setPausingId] = useState<string | null>(null);

  const handlePause = async (campaignId: string) => {
    setPausingId(campaignId);
    try {
      await campaignsAPI.update(campaignId, { status: "cancelled" });
      toast({ title: "Campaign paused successfully" });
      await onRefresh?.();
    } catch {
      toast({ title: "Failed to pause campaign", variant: "destructive" });
    } finally {
      setPausingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <ManagementSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campaign Management</h2>
        <Button asChild>
          <Link href="/create">
            <Settings className="w-4 h-4 mr-2" />
            Create New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Launch your first campaign and start raising funds from backers
            worldwide.
          </p>
          <Button asChild>
            <Link href="/create">
              <Settings className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
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
                        {campaign.status === "active" && campaign.daysLeft > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {campaign.daysLeft} days left
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.backers} backers
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {formatEthLabel(campaign.raised, true)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {formatEthLabel(campaign.goal, true)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round(campaign.progress)}% funded
                      </span>
                    </div>
                    <Progress value={campaign.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {campaign.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {campaign.conversionRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Conversion
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {formatEthLabel(campaign.avgPledge, true)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Pledge
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                      Last update:{" "}
                      {new Date(campaign.lastUpdate).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <CampaignEditDialog
                        campaign={campaign}
                        onSaved={() => onRefresh?.()}
                      />

                      {campaign.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pausingId === campaign.id}
                            >
                              {pausingId === campaign.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Pause className="w-4 h-4 mr-2" />
                              )}
                              Pause
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Pause campaign?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the campaign and stop accepting
                                new pledges. Existing backers will be notified.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handlePause(campaign.id)}
                              >
                                Pause Campaign
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onViewAnalytics}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Public
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
