"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Ban, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminAPI, formatRelativeTime, type ModerationReport } from "@/lib/admin-api";
import Link from "next/link";

interface AdminModerationTabProps {
  onStatsChange?: () => void;
}

export function AdminModerationTab({ onStatsChange }: AdminModerationTabProps) {
  const { toast } = useToast();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [investigateId, setInvestigateId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getModeration();
      setReports(
        data.filter(
          (r) => r.status === "open" || r.status === "investigating"
        )
      );
    } catch {
      toast({
        title: "Moderation queue unavailable",
        description:
          "Run database/migrations/add_admin_features.sql on your database.",
        variant: "destructive",
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (
    id: string,
    action: "investigate" | "cancel_campaign",
    successMsg: string
  ) => {
    setActionId(id);
    try {
      await adminAPI.moderationAction(id, action);
      if (notes.trim()) {
        await adminAPI.updateModeration(id, { adminNotes: notes.trim() });
      }
      toast({ title: successMsg });
      setInvestigateId(null);
      setNotes("");
      await load();
      onStatsChange?.();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const dismiss = async (id: string) => {
    setActionId(id);
    try {
      await adminAPI.updateModeration(id, {
        status: "dismissed",
        adminNotes: notes || "Dismissed — no violation found",
      });
      toast({ title: "Report dismissed" });
      setInvestigateId(null);
      await load();
      onStatsChange?.();
    } catch {
      toast({ title: "Failed to dismiss", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const openReports = reports.filter(
    (r) => r.status === "open" || r.status === "investigating"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Moderation</h2>
        <Badge variant="destructive">{openReports.length} flagged items</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
          <CardDescription>
            User reports and automated risk flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : openReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No open moderation items. The system auto-flags suspicious
              campaigns when the moderation table is configured.
            </p>
          ) : (
            <div className="space-y-4">
              {openReports.map((item) => {
                const busy = actionId === item.id;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium">{item.campaignTitle}</h3>
                        <Badge
                          variant={
                            item.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            item.severity === "medium"
                              ? "bg-yellow-500/15 text-yellow-700"
                              : ""
                          }
                        >
                          {item.severity} priority
                        </Badge>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reason: {item.reason}
                        {item.reporterName
                          ? ` • Reported by ${item.reporterName}`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          setInvestigateId(item.id);
                          setNotes(item.adminNotes || "");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Investigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={busy || !item.campaignId}
                        onClick={() =>
                          runAction(
                            item.id,
                            "cancel_campaign",
                            "Campaign cancelled — report resolved"
                          )
                        }
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Take Action
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!investigateId}
        onOpenChange={(o) => !o && setInvestigateId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Investigation</DialogTitle>
            <DialogDescription>
              Document findings and resolve or escalate this report.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Admin notes (audit trail)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          {investigateId && (
            <p className="text-xs text-muted-foreground">
              Report ID: {investigateId}
            </p>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {reports.find((r) => r.id === investigateId)?.campaignId && (
              <Button variant="outline" asChild>
                <Link
                  href={`/campaigns/${reports.find((r) => r.id === investigateId)?.campaignId}`}
                  target="_blank"
                >
                  View campaign
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              disabled={!!actionId}
              onClick={() =>
                investigateId &&
                runAction(investigateId, "investigate", "Marked as investigating")
              }
            >
              Mark investigating
            </Button>
            <Button
              variant="outline"
              disabled={!!actionId}
              onClick={() => investigateId && dismiss(investigateId)}
            >
              Dismiss
            </Button>
            <Button
              variant="destructive"
              disabled={!!actionId}
              onClick={() =>
                investigateId &&
                runAction(
                  investigateId,
                  "cancel_campaign",
                  "Action taken — campaign cancelled"
                )
              }
            >
              Cancel campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
