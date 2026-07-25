"use client";

import { SiteHeader } from "@/components/site-header";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useCampaign } from "@/hooks/use-campaigns";
import { useFunding } from "@/hooks/use-funding";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAuth } from "@/hooks/use-auth";
import websocketService from "@/lib/websocket";
import { CampaignFundingSidebar } from "@/components/campaign/campaign-funding-sidebar";
import { CampaignDetailTabs } from "@/components/campaign/campaign-detail-tabs";
import { CampaignRewardsPanel } from "@/components/campaign/campaign-rewards-panel";

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { campaign, loading, error, refetch } = useCampaign(params.id);
  const {
    fundings,
    loading: fundingsLoading,
    refetch: refetchFundings,
  } = useFunding(params.id);
  const { user } = useAuth();

  useEffect(() => {
    if (!campaign) return;
    websocketService.joinCampaign(campaign.id);
    return () => websocketService.leaveCampaign(campaign.id);
  }, [campaign]);

  const handleFunded = () => {
    refetch();
    refetchFundings();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-48" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded w-32" />
                <div className="h-10 bg-muted rounded" />
                <div className="aspect-video bg-muted rounded" />
              </div>
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <SiteHeader />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="text-destructive text-lg mb-4">
              Campaign not found
            </div>
            <p className="text-muted-foreground mb-4">
              {error || "The campaign you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/campaigns">Back to Campaigns</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>

      <section className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 order-1">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 capitalize">
                {campaign.category}
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                {campaign.title}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground mb-6">
                {campaign.summary}
              </p>

              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={campaign.creator.avatar || "/placeholder.svg"}
                    alt={campaign.creator.name}
                  />
                  <AvatarFallback>
                    {campaign.creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {campaign.creator.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" aria-hidden />
                    {campaign.creator.bio || "Creator"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <ImageWithFallback
                src={campaign.imageUrl || "/placeholder.jpg"}
                alt={campaign.title}
                className="w-full rounded-lg aspect-video object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />
            </div>
          </div>

          <div className="lg:col-span-1 order-2">
            <CampaignFundingSidebar
              campaign={campaign}
              onFunded={handleFunded}
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <CampaignDetailTabs
              description={campaign.description}
              campaignId={campaign.id}
              creatorId={campaign.creator.id}
              currentUserId={user?.id}
              fundings={fundings}
              fundingsLoading={fundingsLoading}
            />
          </div>

          <div className="lg:col-span-1">
            <CampaignRewardsPanel
              campaign={campaign}
              onFunded={handleFunded}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
