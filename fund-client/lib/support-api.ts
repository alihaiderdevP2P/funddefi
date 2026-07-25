import api from "./api";

export type SupportTicketCategory =
  | "general"
  | "technical"
  | "campaign"
  | "payment"
  | "bug"
  | "feature";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type HelpArticleCategory =
  | "general"
  | "technical"
  | "campaigns"
  | "payments";

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string | null;
  category: HelpArticleCategory;
  status: "published" | "draft";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HelpCategory {
  id: HelpArticleCategory;
  title: string;
  description: string;
  articles: HelpArticle[];
  totalArticles: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  fullName: string;
  email: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  assignedTo: string | null;
  estimatedResponseTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitTicketInput {
  fullName: string;
  email: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
}

export interface SubmitTicketResponse {
  id: string;
  ticketNumber: string;
  status: SupportTicketStatus;
  estimatedResponseTime: string;
  message: string;
}

export const supportAPI = {
  getCategories: async () => {
    const { data } = await api.get("/support/categories");
    return data as HelpCategory[];
  },

  getArticles: async (params?: {
    category?: HelpArticleCategory;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/support/articles", { params });
    return data as { articles: HelpArticle[]; total: number };
  },

  getArticleBySlug: async (slug: string) => {
    const { data } = await api.get(`/support/articles/${slug}`);
    return data as HelpArticle;
  },

  search: async (query: string) => {
    const { data } = await api.get("/support/search", { params: { q: query } });
    return data as { articles: HelpArticle[]; total: number };
  },

  submitTicket: async (input: SubmitTicketInput) => {
    const { data } = await api.post("/support/tickets", input);
    return data as SubmitTicketResponse;
  },

  getTicket: async (ticketNumber: string) => {
    const { data } = await api.get(`/support/tickets/${ticketNumber}`);
    return data as SupportTicket;
  },

  // Admin endpoints
  getTicketsAdmin: async (params?: {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/support/admin/tickets", { params });
    return data as { tickets: SupportTicket[]; total: number };
  },

  updateTicket: async (
    id: string,
    input: { status?: SupportTicketStatus; assignedTo?: string }
  ) => {
    const { data } = await api.patch(`/support/admin/tickets/${id}`, input);
    return data as SupportTicket;
  },
};
