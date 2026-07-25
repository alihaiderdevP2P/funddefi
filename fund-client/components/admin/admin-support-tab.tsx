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
import {
  HeadphonesIcon,
  Loader2,
  Search,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  supportAPI,
  type SupportTicket,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/lib/support-api";
import websocketService from "@/lib/websocket";

const STATUS_OPTIONS: SupportTicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

const PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function AdminSupportTab() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      const params: {
        search?: string;
        status?: SupportTicketStatus;
        priority?: SupportTicketPriority;
        limit?: number;
      } = { limit: 100 };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all")
        params.status = statusFilter as SupportTicketStatus;
      if (priorityFilter !== "all")
        params.priority = priorityFilter as SupportTicketPriority;

      const data = await supportAPI.getTicketsAdmin(params);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch {
      toast({
        title: "Failed to load support tickets",
        description:
          "Ensure the backend is running and support migration is applied.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, toast]);

  useEffect(() => {
    const t = setTimeout(loadTickets, 300);
    return () => clearTimeout(t);
  }, [loadTickets]);

  useEffect(() => {
    websocketService.connect();
    websocketService.joinSupportFeed();

    const handleUpdate = () => loadTickets();
    websocketService.onSupportUpdate(handleUpdate);
    websocketService.onSupportFeedChanged(handleUpdate);

    return () => {
      websocketService.off("support-updated", handleUpdate);
      websocketService.off("support-feed-changed", handleUpdate);
      websocketService.leaveSupportFeed();
    };
  }, [loadTickets]);

  const handleStatusChange = async (
    id: string,
    status: SupportTicketStatus
  ) => {
    setActionId(id);
    try {
      await supportAPI.updateTicket(id, { status });
      toast({ title: "Ticket status updated" });
      await loadTickets();
    } catch {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const urgentCount = tickets.filter(
    (t) => t.priority === "urgent" && t.status !== "closed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? "—" : openCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "—" : urgentCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Manage and respond to user support requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
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
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No support tickets found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Ticket ID</th>
                    <th className="pb-3 pr-4 font-medium">Subject</th>
                    <th className="pb-3 pr-4 font-medium">From</th>
                    <th className="pb-3 pr-4 font-medium">Priority</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3 pr-4 max-w-[200px] truncate">
                        {ticket.subject}
                      </td>
                      <td className="py-3 pr-4">
                        <div>{ticket.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {ticket.email}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={PRIORITY_COLORS[ticket.priority]}
                          variant="secondary"
                        >
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={ticket.status}
                          onValueChange={(v) =>
                            handleStatusChange(
                              ticket.id,
                              v as SupportTicketStatus
                            )
                          }
                          disabled={actionId === ticket.id}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewTicket(ticket)}
                          aria-label={`View ticket ${ticket.ticketNumber}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewTicket} onOpenChange={() => setViewTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewTicket?.subject}</DialogTitle>
            <DialogDescription>
              {viewTicket?.ticketNumber} · {viewTicket?.category}
            </DialogDescription>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">From</Label>
                  <p>{viewTicket.fullName}</p>
                  <p className="text-muted-foreground">{viewTicket.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={PRIORITY_COLORS[viewTicket.priority]}>
                    {viewTicket.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {viewTicket.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
