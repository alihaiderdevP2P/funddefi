"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, Users, Target, Calendar, Loader2 } from "lucide-react";
import type { DashboardData } from "@/lib/api";
import { formatEthLabel } from "@/lib/format-eth";
import { formatRelativeTime } from "@/lib/dashboard-utils";
import Link from "next/link";

const DEFAULT_TREND = [{ date: "N/A", amount: 0, backers: 0 }];

interface DashboardAnalyticsProps {
  detailed?: boolean;
  data?: DashboardData | null;
  loading?: boolean;
}

function MetricSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatGrowth(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
}

function activityLabel(type: string): string {
  switch (type) {
    case "new_backer":
      return "New backer";
    case "campaign_update":
      return "Campaign update";
    default:
      return type.replace(/_/g, " ");
  }
}

export function DashboardAnalytics({
  detailed = false,
  data,
  loading = false,
}: DashboardAnalyticsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <MetricSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = data?.metrics;
  const fundingTrends =
    data?.fundingTrends && data.fundingTrends.length > 0
      ? data.fundingTrends
      : DEFAULT_TREND;
  const campaignPerformance = data?.campaignPerformance ?? [];
  const categoryDistribution = data?.categoryDistribution ?? [];
  const pledgeDistribution = data?.pledgeDistribution ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Funding Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatGrowth(metrics?.fundingGrowth ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              New Backers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.newBackersThisMonth ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="w-4 h-4 mr-2 text-purple-500" />
              Avg. Pledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatEthLabel(metrics?.avgPledge ?? 0, true)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatGrowth(metrics?.avgPledgeGrowth ?? 0)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.conversionRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">visitors to backers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding Trends</CardTitle>
          <CardDescription>
            Monthly funding and backer growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fundingTrends.length === 1 && fundingTrends[0].date === "N/A" ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No funding data yet. Launch a campaign to see trends.
            </div>
          ) : (
            <ChartContainer
              config={{
                amount: { label: "Funding (ETH)", color: "#10b981" },
                backers: { label: "Backers", color: "#3b82f6" },
              }}
              className="h-[300px]"
            >
              <AreaChart data={fundingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="backers"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Funding progress by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {campaignPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No campaigns yet.{" "}
                <Link href="/create" className="text-primary hover:underline">
                  Create your first campaign
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {campaignPerformance.map((campaign) => (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {campaign.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatEthLabel(campaign.raised, true)} /{" "}
                        {formatEthLabel(campaign.goal, true)}
                      </span>
                    </div>
                    <Progress
                      value={
                        campaign.goal > 0
                          ? (campaign.raised / campaign.goal) * 100
                          : 0
                      }
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{campaign.backers} backers</span>
                      <span>
                        {campaign.goal > 0
                          ? Math.round((campaign.raised / campaign.goal) * 100)
                          : 0}
                        % funded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Funding by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryDistribution.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No category data available
              </div>
            ) : (
              <ChartContainer
                config={{ value: { label: "Raised (ETH)" } }}
                className="h-[250px]"
              >
                <PieChart>
                  <Pie
                    data={
                      categoryDistribution as unknown as Array<
                        Record<string, unknown>
                      >
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {detailed && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pledge Distribution</CardTitle>
              <CardDescription>
                Backer pledge sizes across your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pledgeDistribution.every((p) => p.count === 0) ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No backer pledge data yet
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Backers", color: "#8b5cf6" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={pledgeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions on your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={`${activity.type}-${activity.timestamp}-${index}`}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {activityLabel(activity.type)}
                        </p>
                        <Link
                          href={`/campaigns/${activity.campaignId}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {activity.campaign}
                        </Link>
                      </div>
                      <div className="text-right">
                        {activity.amount != null && (
                          <p className="font-medium text-green-600">
                            {formatEthLabel(activity.amount, true)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export function DashboardAnalyticsLoader() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
