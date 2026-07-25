"use client";

import { SiteHeader } from "@/components/site-header";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Briefcase,
  HeadphonesIcon,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { RoleAuthGuard } from "@/components/role-auth-guard";
import { adminAPI, formatEth, type PlatformStats } from "@/lib/admin-api";
import { AdminOverviewTab } from "@/components/admin/admin-overview-tab";
import { AdminCampaignsTab } from "@/components/admin/admin-campaigns-tab";
import { AdminUsersTab } from "@/components/admin/admin-users-tab";
import { AdminModerationTab } from "@/components/admin/admin-moderation-tab";
import { AdminAnalyticsTab } from "@/components/admin/admin-analytics-tab";
import { AdminBlogTab } from "@/components/admin/admin-blog-tab";
import { AdminCareersTab } from "@/components/admin/admin-careers-tab";
import { AdminSupportTab } from "@/components/admin/admin-support-tab";
import { AdminContactTab } from "@/components/admin/admin-contact-tab";

const defaultStats: PlatformStats = {
  totalUsers: 0,
  activeCampaigns: 0,
  totalFunding: 0,
  platformFees: 0,
  pendingApprovals: 0,
  flaggedCampaigns: 0,
  userGrowthPercent: 0,
  launchedToday: 0,
  totalFundings: 0,
  totalBackers: 0,
  activeSmartContracts: 0,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<PlatformStats>(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const { user } = useAuth();

  const loadStats = useCallback(async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (e) {
      console.error("Admin stats:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const fundingDisplay =
    stats.totalFunding >= 1
      ? `${stats.totalFunding.toFixed(2)} ETH`
      : `${stats.totalFunding} ETH`;

  return (
    <RoleAuthGuard
      requiredRoles={["admin", "superadmin"]}
      title="Admin Access Required"
      description="This area is restricted to administrators only"
    >
      <div className="min-h-screen bg-background overflow-x-hidden">
        <SiteHeader variant="admin" showWallet={false} />

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Platform Administration
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage the crowdfunding platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "—" : stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.userGrowthPercent >= 0 ? "+" : ""}
                  {stats.userGrowthPercent}% this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "—" : stats.activeCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.launchedToday} launched today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "—" : fundingDisplay}
                </div>
                <p className="text-xs text-muted-foreground">
                  Platform fees: {formatEth(stats.platformFees)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {statsLoading
                    ? "—"
                    : stats.pendingApprovals + stats.flaggedCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingApprovals} approvals · {stats.flaggedCampaigns}{" "}
                  flagged
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              <TabsList className="inline-flex w-max h-auto flex-nowrap gap-1 p-1">
                <TabsTrigger value="overview" className="shrink-0">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="shrink-0">
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="blog" className="shrink-0">
                  <BookOpen className="w-4 h-4 mr-1 hidden sm:inline" />
                  Blog
                </TabsTrigger>
                <TabsTrigger value="careers" className="shrink-0">
                  <Briefcase className="w-4 h-4 mr-1 hidden sm:inline" />
                  Careers
                </TabsTrigger>
                <TabsTrigger value="support" className="shrink-0">
                  <HeadphonesIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                  Support
                </TabsTrigger>
                <TabsTrigger value="contact" className="shrink-0">
                  <Mail className="w-4 h-4 mr-1 hidden sm:inline" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="users" className="shrink-0">
                  Users
                </TabsTrigger>
                <TabsTrigger value="moderation" className="shrink-0">
                  Moderation
                </TabsTrigger>
                <TabsTrigger value="analytics" className="shrink-0">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-6">
              <AdminOverviewTab />
            </TabsContent>

            <TabsContent value="campaigns" className="mt-6">
              <AdminCampaignsTab onStatsChange={loadStats} />
            </TabsContent>

            <TabsContent value="blog" className="mt-6">
              <AdminBlogTab />
            </TabsContent>

            <TabsContent value="careers" className="mt-6">
              <AdminCareersTab />
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <AdminSupportTab />
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <AdminContactTab />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="moderation" className="mt-6">
              <AdminModerationTab onStatsChange={loadStats} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AdminAnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleAuthGuard>
  );
}
