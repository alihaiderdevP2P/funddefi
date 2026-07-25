"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { Loader2, Target, TrendingUp, Users } from "lucide-react";
import { adminAPI, formatEth, type AdminAnalytics } from "@/lib/admin-api";

const CHART_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
];

export function AdminAnalyticsTab() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Analytics unavailable. Check backend connection.
      </p>
    );
  }

  const trends =
    data.fundingTrends.length > 0
      ? data.fundingTrends
      : [{ date: "N/A", amount: 0, backers: 0, fundings: 0 }];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Platform Analytics</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEth(data.totals.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totals.totalFundings} confirmed pledges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Unique Backers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totals.totalBackers}
            </div>
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
              {data.averagePledge} ETH
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
            <div className="text-2xl font-bold">{data.successRate}%</div>
            <p className="text-xs text-muted-foreground">campaigns funded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funding Trends</CardTitle>
            <CardDescription>Confirmed pledges over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: { label: "ETH", color: "hsl(var(--primary))" },
              }}
              className="h-[280px] w-full"
            >
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-amount)"
                  fill="var(--color-amount)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No campaign data yet
              </p>
            ) : (
              <ChartContainer
                config={{}}
                className="h-[280px] w-full mx-auto"
              >
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {data.categoryDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Campaigns by Raised Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.topCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaigns yet.</p>
          ) : (
            data.topCampaigns.map((c) => {
              const pct =
                c.goal > 0
                  ? Math.min(100, Math.round((c.raised / c.goal) * 100))
                  : 0;
              return (
                <div key={c.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">
                      {c.raised} / {c.goal} ETH ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[220px] w-full">
            <BarChart data={data.statusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
