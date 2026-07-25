"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletConnect } from "@/components/wallet-connect";
import { ArrowLeft, TrendingUp, MapPin } from "lucide-react";
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
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/campaigns"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Campaign
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletConnect />
            <Button size="sm" asChild>
              <Link href="/create">Launch Campaign</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>

      <section className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 capitalize">
                {campaign.category}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                {campaign.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
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
                className="w-full rounded-lg aspect-video"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <CampaignFundingSidebar
              campaign={campaign}
              onFunded={handleFunded}
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
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
