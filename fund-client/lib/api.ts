import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token and language header to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add Accept-Language header for i18n
  const locale = localStorage.getItem("locale") || "en";
  const localeMap: Record<string, string> = {
    en: "en-US,en;q=0.9",
    es: "es-ES,es;q=0.9,en;q=0.8",
    fr: "fr-FR,fr;q=0.9,en;q=0.8",
  };
  config.headers["Accept-Language"] = localeMap[locale] || localeMap.en;

  return config;
});

// Handle auth errors — skip redirect for public endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isPublic =
        (url.startsWith("/blog") &&
          !url.includes("/admin/") &&
          !url.includes("newsletter/admin")) ||
        (url.startsWith("/contact") && !url.includes("/admin/"));
      if (!isPublic) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isSuspended?: boolean;
  role: "user" | "admin" | "superadmin";
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  summary: string;
  goalAmount: number;
  raisedAmount: number;
  endDate: string;
  status: "draft" | "active" | "funded" | "expired" | "cancelled";
  category:
    | "technology"
    | "creative"
    | "community"
    | "business"
    | "environment"
    | "health"
    | "education";
  imageUrl: string;
  videoUrl?: string;
  contractAddress?: string;
  backersCount: number;
  creator: User;
  rewards: Reward[];
  fundings: Funding[];
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  minAmount: number;
  deliveryDate?: string;
  maxBackers?: number;
  currentBackers: number;
  imageUrl?: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  campaignId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Funding {
  id: string;
  amount: number;
  transactionHash: string;
  status: "pending" | "confirmed" | "failed" | "refunded";
  message?: string;
  backerInfo?: {
    name?: string;
    email?: string;
    address?: string;
  };
  user: User;
  campaign: Campaign;
  reward?: Reward;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalBacked: number;
  backedCampaignCount: number;
  backedGrowth: number;
  campaignsCreated: number;
  activeCampaigns: number;
  totalBackersOnCreated: number;
  totalRaised: number;
  goalProgress: number;
  daysLeft: number;
  backedSuccessRate: number;
  successfulBacked: number;
  totalBackedCampaigns: number;
}

export interface DashboardMetrics {
  fundingGrowth: number;
  newBackersThisMonth: number;
  avgPledge: number;
  avgPledgeGrowth: number;
  conversionRate: number;
  estimatedViews: number;
}

export interface DashboardTrendPoint {
  date: string;
  amount: number;
  backers: number;
  fundings?: number;
}

export interface DashboardCampaignPerformance {
  id: string;
  name: string;
  raised: number;
  goal: number;
  backers: number;
  status: string;
}

export interface DashboardCategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardPledgeBucket {
  range: string;
  count: number;
}

export interface DashboardActivity {
  type: string;
  campaign: string;
  campaignId: string;
  amount: number | null;
  timestamp: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  metrics: DashboardMetrics;
  fundingTrends: DashboardTrendPoint[];
  campaignPerformance: DashboardCampaignPerformance[];
  categoryDistribution: DashboardCategorySlice[];
  pledgeDistribution: DashboardPledgeBucket[];
  recentActivity: DashboardActivity[];
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    name: string;
    password: string;
    walletAddress?: string;
    avatar?: string;
    bio?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
  logout: async (token?: string) => {
    const response = await api.post(
      "/auth/logout",
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return response.data;
  },
};

// Campaigns API
export const campaignsAPI = {
  getAll: async (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/campaigns", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get("/campaigns/featured");
    return response.data;
  },

  getMyCampaigns: async () => {
    const response = await api.get("/campaigns/my-campaigns");
    return response.data;
  },

  create: async (campaignData: {
    title: string;
    description: string;
    summary: string;
    goalAmount: number;
    endDate: string;
    category: string;
    imageUrl: string;
    videoUrl?: string;
    rewards?: Array<{
      title: string;
      description: string;
      minAmount: number;
      deliveryDate?: string;
      maxBackers?: number;
      imageUrl?: string;
    }>;
  }) => {
    const response = await api.post("/campaigns", campaignData);
    return response.data;
  },

  update: async (id: string, campaignData: Partial<Campaign>) => {
    const response = await api.patch(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  addReward: async (
    campaignId: string,
    rewardData: {
      title: string;
      description: string;
      minAmount: number;
      deliveryDate?: string;
      maxBackers?: number;
      imageUrl?: string;
    }
  ) => {
    const response = await api.post(
      `/campaigns/${campaignId}/rewards`,
      rewardData
    );
    return response.data;
  },

  getUpdates: async (campaignId: string): Promise<CampaignUpdate[]> => {
    const response = await api.get(`/campaigns/${campaignId}/updates`);
    return response.data;
  },

  createUpdate: async (
    campaignId: string,
    data: { title: string; content: string }
  ): Promise<CampaignUpdate> => {
    const response = await api.post(`/campaigns/${campaignId}/updates`, data);
    return response.data;
  },

  getSaveStatus: async (campaignId: string): Promise<{ saved: boolean }> => {
    const response = await api.get(`/campaigns/${campaignId}/save-status`);
    return response.data;
  },

  save: async (campaignId: string): Promise<{ saved: boolean }> => {
    const response = await api.post(`/campaigns/${campaignId}/save`);
    return response.data;
  },

  unsave: async (campaignId: string): Promise<{ saved: boolean }> => {
    const response = await api.delete(`/campaigns/${campaignId}/save`);
    return response.data;
  },

  getSavedCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get("/campaigns/me/saved");
    return response.data;
  },
};

// Funding API
export const fundingAPI = {
  getAll: async (userId?: string) => {
    const response = await api.get("/funding", { params: { userId } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/funding/${id}`);
    return response.data;
  },

  getMyFundings: async (): Promise<Funding[]> => {
    const response = await api.get("/funding/my-fundings");
    return response.data;
  },

  getMyDashboard: async (): Promise<DashboardData> => {
    const response = await api.get("/funding/my-dashboard");
    return response.data;
  },

  getByCampaign: async (campaignId: string) => {
    const response = await api.get(`/funding/campaign/${campaignId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/funding/stats");
    return response.data;
  },

  create: async (fundingData: {
    amount: number;
    transactionHash: string;
    campaignId: string;
    rewardId?: string;
    status?: "pending" | "confirmed" | "failed" | "refunded";
    message?: string;
    backerInfo?: {
      name?: string;
      email?: string;
      address?: string;
    };
  }) => {
    const response = await api.post("/funding", fundingData);
    return response.data;
  },

  update: async (id: string, fundingData: Partial<Funding>) => {
    const response = await api.patch(`/funding/${id}`, fundingData);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, userData: Partial<User>) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api;
