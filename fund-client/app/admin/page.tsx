"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  DollarSign,
  AlertTriangle,
  Settings,
  BarChart3,
  Loader2,
  BookOpen,
  Briefcase,
  HeadphonesIcon,
  Mail,
} from "lucide-react";
import Link from "next/link";
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-foreground">
                Admin Dashboard
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                User Dashboard
              </Link>
              <Link
                href="/campaigns"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Public View
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {statsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Badge variant="destructive" className="animate-pulse">
                  {stats.pendingApprovals + stats.flaggedCampaigns} Pending
                </Badge>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Platform Administration
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage the crowdfunding platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:grid-cols-9">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="blog">
                <BookOpen className="w-4 h-4 mr-1 hidden sm:inline" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="careers">
                <Briefcase className="w-4 h-4 mr-1 hidden sm:inline" />
                Careers
              </TabsTrigger>
              <TabsTrigger value="support">
                <HeadphonesIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                Support
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Mail className="w-4 h-4 mr-1 hidden sm:inline" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

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
