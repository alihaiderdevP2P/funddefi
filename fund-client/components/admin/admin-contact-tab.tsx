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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Loader2, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  contactAPI,
  type ContactMessage,
  type ContactMessageStatus,
} from "@/lib/contact-api";
import websocketService from "@/lib/websocket";

const STATUS_OPTIONS: ContactMessageStatus[] = [
  "new",
  "read",
  "replied",
  "resolved",
  "spam",
];

const STATUS_COLORS: Record<ContactMessageStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  replied: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  spam: "bg-red-100 text-red-800",
};

export function AdminContactTab() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const params: {
        search?: string;
        status?: ContactMessageStatus;
        limit?: number;
      } = { limit: 100 };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all")
        params.status = statusFilter as ContactMessageStatus;

      const data = await contactAPI.getMessagesAdmin(params);
      setMessages(data.messages);
      setTotal(data.total);
    } catch {
      toast({
        title: "Failed to load contact messages",
        description:
          "Ensure the backend is running and contact migration is applied (npm run db:migrate:contact).",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const t = setTimeout(loadMessages, 300);
    return () => clearTimeout(t);
  }, [loadMessages]);

  useEffect(() => {
    websocketService.connect();
    websocketService.joinContactFeed();

    const handleUpdate = () => loadMessages();
    websocketService.onContactUpdate(handleUpdate);
    websocketService.onContactFeedChanged(handleUpdate);

    return () => {
      websocketService.off("contact-updated", handleUpdate);
      websocketService.off("contact-feed-changed", handleUpdate);
      websocketService.leaveContactFeed();
    };
  }, [loadMessages]);

  const handleStatusChange = async (
    id: string,
    status: ContactMessageStatus
  ) => {
    setActionId(id);
    try {
      await contactAPI.updateMessageStatus(id, status);
      toast({ title: "Status updated" });
      await loadMessages();
      if (viewMessage?.id === id) {
        setViewMessage((m) => (m ? { ...m, status } : null));
      }
    } catch {
      toast({
        title: "Update failed",
        variant: "destructive",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Inbox
          </CardTitle>
          <CardDescription>
            Messages from the public contact form ({total} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, reference..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No contact messages yet.
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {msg.fullName}
                      </span>
                      <Badge className={STATUS_COLORS[msg.status]}>
                        {msg.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {msg.referenceNumber}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {msg.email} · {msg.subject} · {msg.category}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMessage(msg)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {msg.status === "new" && (
                      <Button
                        size="sm"
                        disabled={actionId === msg.id}
                        onClick={() => handleStatusChange(msg.id, "read")}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!viewMessage}
        onOpenChange={(open) => !open && setViewMessage(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{viewMessage.fullName}</DialogTitle>
                <DialogDescription>
                  {viewMessage.referenceNumber} · {viewMessage.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <Label>Subject / Category</Label>
                  <p>
                    {viewMessage.subject} / {viewMessage.category}
                  </p>
                </div>
                {(viewMessage.relatedCampaignId ||
                  viewMessage.relatedCreatorId ||
                  viewMessage.relatedBackerId) && (
                  <div>
                    <Label>Related context</Label>
                    <p className="text-muted-foreground font-mono text-xs">
                      {[
                        viewMessage.relatedCampaignId &&
                          `campaign=${viewMessage.relatedCampaignId}`,
                        viewMessage.relatedCreatorId &&
                          `creator=${viewMessage.relatedCreatorId}`,
                        viewMessage.relatedBackerId &&
                          `backer=${viewMessage.relatedBackerId}`,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                )}
                <div>
                  <Label>Message</Label>
                  <p className="whitespace-pre-wrap mt-1 rounded-md bg-muted p-3">
                    {viewMessage.message}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.filter((s) => s !== viewMessage.status).map(
                    (s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        disabled={actionId === viewMessage.id}
                        onClick={() =>
                          handleStatusChange(viewMessage.id, s)
                        }
                      >
                        Mark {s}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
