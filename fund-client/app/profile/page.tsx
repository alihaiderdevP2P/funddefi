"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings,
  Calendar,
  Mail,
  Wallet,
  CheckCircle,
  Award,
  TrendingUp,
  Heart,
  ExternalLink,
  Edit,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAddress } from "@/lib/utils";
import { EtherscanAddressLink } from "@/components/ui/etherscan-link";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock data - replace with actual API calls
  const stats = {
    campaignsCreated: 3,
    campaignsBacked: 8,
    totalContributed: 1250.5,
    totalRaised: 34500.0,
    successRate: 75,
  };

  const recentCampaigns = [
    {
      id: 1,
      title: "Solar-Powered Charging Stations",
      status: "active",
      raised: 45230,
      goal: 75000,
      progress: 60,
    },
  ];

  const backedCampaigns = [
    {
      id: 1,
      title: "EcoCharge Solar Stations",
      amount: 100,
      date: "2024-01-15",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Profile</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/campaigns"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Campaign
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.name}
                </h1>
                {user.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {user.role && <Badge variant="secondary">{user.role}</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.walletAddress && (
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <EtherscanAddressLink
                      address={user.walletAddress}
                      network="sepolia"
                      showFormatted={true}
                    />
                  </div>
                )}
              </div>

              {user.bio && (
                <p className="text-muted-foreground mb-4">{user.bio}</p>
              )}

              <div className="flex items-center space-x-4">
                <Button asChild>
                  <Link href="/settings">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/create">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Campaigns Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.campaignsCreated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Campaigns Backed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.campaignsBacked}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Contributed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalContributed.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRaised.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="backed">Backed Campaigns</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">
                    {user.bio || "No bio available"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Member Since</h3>
                  <p className="text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Wallet Address</h3>
                  {user.walletAddress ? (
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {formatAddress(user.walletAddress)}
                      </code>
                      <EtherscanAddressLink
                        address={user.walletAddress}
                        network="sepolia"
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No wallet connected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Campaigns</CardTitle>
                <CardDescription>
                  Campaigns you've created on FundFlow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${campaign.raised.toLocaleString()} of $
                            {campaign.goal.toLocaleString()} (
                            {campaign.progress}%)
                          </p>
                        </div>
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No campaigns yet.{" "}
                    <Link
                      href="/create"
                      className="text-primary hover:underline"
                    >
                      Create your first campaign
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backed Campaigns Tab */}
          <TabsContent value="backed" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Backed Campaigns</CardTitle>
                <CardDescription>
                  Campaigns you've supported with funding
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backedCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {backedCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Contributed ${campaign.amount} on{" "}
                            {new Date(campaign.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/campaigns/${campaign.id}`}>
                            View <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    You haven't backed any campaigns yet.{" "}
                    <Link
                      href="/campaigns"
                      className="text-primary hover:underline"
                    >
                      Explore campaigns
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent actions on FundFlow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Campaign Created</p>
                      <p className="text-sm text-muted-foreground">
                        Solar-Powered Charging Stations
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      2 days ago
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Campaign Backed</p>
                      <p className="text-sm text-muted-foreground">
                        Contributed $100 to EcoCharge Solar Stations
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      5 days ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
