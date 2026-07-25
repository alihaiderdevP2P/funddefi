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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ban,
  CheckCircle,
  Loader2,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminAPI, type AdminUserRow } from "@/lib/admin-api";
import { useAuth } from "@/hooks/use-auth";

export function AdminUsersTab() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      setUsers(data);
    } catch {
      toast({
        title: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateUser = async (
    id: string,
    patch: { isVerified?: boolean; isSuspended?: boolean },
    label: string
  ) => {
    if (id === currentUser?.id) {
      toast({
        title: "Cannot modify your own account here",
        variant: "destructive",
      });
      return;
    }
    setActionId(id);
    try {
      await adminAPI.updateUser(id, patch);
      toast({ title: label });
      await load();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Verify, suspend, and audit platform accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 w-56"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>{users.length} users in current view</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const busy = actionId === u.id;
                    const isStaff =
                      u.role === "admin" || u.role === "superadmin";

                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isStaff ? "default" : "secondary"}>
                            {isStaff && (
                              <Shield className="w-3 h-3 mr-1 inline" />
                            )}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.isVerified && (
                              <Badge className="bg-green-500/15 text-green-600">
                                Verified
                              </Badge>
                            )}
                            {u.isSuspended && (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                            {!u.isVerified && !u.isSuspended && (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.campaignsCount} campaigns · {u.fundingsCount}{" "}
                          pledges
                        </TableCell>
                        <TableCell className="text-right">
                          {!isStaff && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy || u.isVerified}
                                onClick={() =>
                                  updateUser(
                                    u.id,
                                    { isVerified: true },
                                    "User verified"
                                  )
                                }
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={() =>
                                  updateUser(
                                    u.id,
                                    { isSuspended: !u.isSuspended },
                                    u.isSuspended
                                      ? "Suspension lifted"
                                      : "User suspended"
                                  )
                                }
                              >
                                {u.isSuspended ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Ban className="w-4 h-4 text-red-600" />
                                )}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
