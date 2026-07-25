import api, { type Campaign, type User } from "./api";

export interface PlatformStats {
  totalUsers: number;
  activeCampaigns: number;
  totalFunding: number;
  platformFees: number;
  pendingApprovals: number;
  flaggedCampaigns: number;
  userGrowthPercent: number;
  launchedToday: number;
  totalFundings: number;
  totalBackers: number;
  activeSmartContracts: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: string;
}

export interface SystemHealth {
  serverUptime: number;
  transactionSuccessRate: number;
  averageResponseTime: number;
  activeSmartContracts: number;
  databaseStatus: string;
}

export interface ModerationReport {
  id: string;
  campaignId?: string;
  campaignTitle: string;
  reason: string;
  reporterName?: string;
  severity: "low" | "medium" | "high";
  status: "open" | "investigating" | "resolved" | "dismissed";
  adminNotes?: string;
  createdAt: string;
  campaign?: Campaign;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: User["role"];
  isVerified: boolean;
  isSuspended: boolean;
  walletAddress?: string;
  createdAt: string;
  campaignsCount: number;
  fundingsCount: number;
}

export interface AdminAnalytics {
  fundingTrends: { date: string; amount: number; backers: number; fundings: number }[];
  categoryDistribution: { name: string; value: number }[];
  topCampaigns: {
    id: string;
    name: string;
    raised: number;
    goal: number;
    backers: number;
    status: string;
  }[];
  successRate: number;
  averagePledge: number;
  statusBreakdown: { status: string; count: number }[];
  totals: { totalAmount: number; totalFundings: number; totalBackers: number };
}

export const adminAPI = {
  getStats: async (): Promise<PlatformStats> => {
    const { data } = await api.get("/admin/stats");
    return data;
  },

  getActivity: async (limit = 20): Promise<ActivityItem[]> => {
    const { data } = await api.get("/admin/activity", { params: { limit } });
    return data;
  },

  getHealth: async (): Promise<SystemHealth> => {
    const { data } = await api.get("/admin/health");
    return data;
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const { data } = await api.get("/admin/analytics");
    return data;
  },

  getCampaigns: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/admin/campaigns", { params });
    return data as { campaigns: Campaign[]; total: number };
  },

  updateCampaignStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/admin/campaigns/${id}/status`, {
      status,
    });
    return data as Campaign;
  },

  getUsers: async (params?: { search?: string; role?: string }) => {
    const { data } = await api.get("/admin/users", { params });
    return data as AdminUserRow[];
  },

  updateUser: async (
    id: string,
    body: { isVerified?: boolean; isSuspended?: boolean }
  ) => {
    const { data } = await api.patch(`/admin/users/${id}`, body);
    return data as AdminUserRow;
  },

  getModeration: async () => {
    const { data } = await api.get("/admin/moderation");
    return data as ModerationReport[];
  },

  updateModeration: async (
    id: string,
    body: {
      status?: string;
      severity?: string;
      adminNotes?: string;
    }
  ) => {
    const { data } = await api.patch(`/admin/moderation/${id}`, body);
    return data as ModerationReport;
  },

  moderationAction: async (
    id: string,
    action: "cancel_campaign" | "investigate"
  ) => {
    const { data } = await api.post(`/admin/moderation/${id}/action`, {
      action,
    });
    return data;
  },
};

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatEth(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ETH`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K ETH`;
  return `${amount.toFixed(4)} ETH`;
}
