"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  adminAPI,
  formatRelativeTime,
  type ActivityItem,
  type SystemHealth,
} from "@/lib/admin-api";

export function AdminOverviewTab() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [act, h] = await Promise.all([
        adminAPI.getActivity(15),
        adminAPI.getHealth(),
      ]);
      setActivity(act);
      setHealth(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !health) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live platform events from the API</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.details}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            {health && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge
                    variant="secondary"
                    className={
                      health.databaseStatus === "healthy"
                        ? "bg-green-500/15 text-green-600"
                        : "bg-red-500/15 text-red-600"
                    }
                  >
                    {health.databaseStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Server Uptime</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/15 text-green-600"
                  >
                    {health.serverUptime}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transaction Success Rate</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/15 text-green-600"
                  >
                    {health.transactionSuccessRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <Badge variant="secondary">{health.averageResponseTime}ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Smart Contracts</span>
                  <Badge variant="secondary">
                    {health.activeSmartContracts}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
