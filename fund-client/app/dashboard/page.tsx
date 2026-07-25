"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnect } from "@/components/wallet-connect";
import { WalletGuard } from "@/components/wallet-guard";
import {
  TrendingUp,
  Heart,
  Settings,
  Plus,
  BarChart3,
  Users,
  DollarSign,
  Download,
  Bell,
  Brain,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { DashboardBackedTab } from "@/components/dashboard-backed-tab";
import { CampaignManagement } from "@/components/campaign-management";
import { AICampaignRecommendations } from "@/components/ai-campaign-recommendations";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleAuthGuard } from "@/components/role-auth-guard";
import { formatEthLabel } from "@/lib/format-eth";
import { exportDashboardCsv } from "@/lib/dashboard-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const {
    dashboard,
    backedCampaigns,
    createdCampaigns,
    loading,
    error,
    refetch,
  } = useDashboard();

  const summary = dashboard?.summary;
  const backingHistory = backedCampaigns.map((c) => ({
    campaign: c.title,
    amount: c.pledgeAmount,
    category: c.category,
  }));

  const handleExport = () => {
    if (!dashboard) {
      toast({
        title: "No data to export",
        variant: "destructive",
      });
      return;
    }
    exportDashboardCsv({
      summary: summary as unknown as Record<string, unknown>,
      metrics: dashboard.metrics as unknown as Record<string, unknown>,
      fundingTrends: dashboard.fundingTrends as unknown as Array<
        Record<string, unknown>
      >,
      campaignPerformance: dashboard.campaignPerformance as unknown as Array<
        Record<string, unknown>
      >,
    });
    toast({ title: "Dashboard data exported" });
  };

  return (
    <RoleAuthGuard requiredRoles={["user"]}>
      <WalletGuard
        title="Connect to View Dashboard"
        description="Connect your wallet to access your crowdfunding dashboard"
      >
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  FundFlow
                </span>
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
                <Link href="/dashboard" className="text-foreground font-medium">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
              </nav>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <WalletConnect />
                <Button size="sm" asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive campaign management and analytics
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  {error}
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Total Backed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatEthLabel(summary?.totalBacked ?? 0, true)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summary?.backedCampaignCount ?? 0} campaigns •{" "}
                        {(summary?.backedGrowth ?? 0) >= 0 ? "+" : ""}
                        {summary?.backedGrowth ?? 0}% this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Campaigns Created
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.campaignsCreated ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summary?.activeCampaigns ?? 0} active •{" "}
                        {summary?.totalBackersOnCreated ?? 0} backers
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Total Raised
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatEthLabel(summary?.totalRaised ?? 0, true)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summary?.goalProgress ?? 0}% of goal •{" "}
                        {summary?.daysLeft ?? 0} days left
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.backedSuccessRate ?? 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {summary?.successfulBacked ?? 0} of{" "}
                        {summary?.totalBackedCampaigns ?? 0} backed campaigns
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="backed" className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Backed
                </TabsTrigger>
                <TabsTrigger value="created" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  My Campaigns
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <DashboardAnalytics data={dashboard} loading={loading} />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      AI-Powered Recommendations
                    </h2>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Powered by AI
                    </Badge>
                  </div>
                  <AICampaignRecommendations
                    userAddress={user?.walletAddress || user?.id}
                    backingHistory={backingHistory}
                    limit={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="backed" className="mt-6">
                <DashboardBackedTab
                  campaigns={backedCampaigns}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="created" className="mt-6">
                <CampaignManagement
                  campaigns={createdCampaigns}
                  loading={loading}
                  onRefresh={refetch}
                  onViewAnalytics={() => setActiveTab("analytics")}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Detailed Analytics
                    </h2>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={loading || !dashboard}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  <DashboardAnalytics
                    detailed
                    data={dashboard}
                    loading={loading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </WalletGuard>
    </RoleAuthGuard>
  );
}
