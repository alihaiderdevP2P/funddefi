import api from "./api";

export type ContactMessageCategory =
  | "general"
  | "support"
  | "bug"
  | "feature"
  | "partnership";

export type ContactMessageSubject =
  | "general_inquiry"
  | "campaign_support"
  | "billing_payments"
  | "technical_issue"
  | "partnership"
  | "feedback"
  | "other";

export type ContactMessageStatus =
  | "new"
  | "read"
  | "replied"
  | "resolved"
  | "spam";

export type ContactChatSender = "visitor" | "agent" | "system";

export interface ContactConfig {
  supportEmail: string;
  supportPhone: string;
  supportPhoneDisplay: string;
  chatHours: string;
  isBusinessHours: boolean;
  office: {
    address: string;
    city: string;
    country: string;
    mapQuery: string;
  };
  officeHours: Array<{ days: string; hours: string }>;
}

export interface ContactMessage {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: ContactMessageStatus;
  relatedCampaignId: string | null;
  relatedCreatorId: string | null;
  relatedBackerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: ContactChatSender;
  content: string;
  createdAt: string;
}

export interface SubmitContactMessageInput {
  fullName: string;
  email: string;
  subject: ContactMessageSubject;
  category: ContactMessageCategory;
  message: string;
  userId?: string;
  relatedCampaignId?: string;
  relatedCreatorId?: string;
  relatedBackerId?: string;
  companyWebsite?: string;
}

const CHAT_SESSION_KEY = "fundflow_contact_chat_session";

export const contactAPI = {
  getConfig: async () => {
    const { data } = await api.get("/contact/config");
    return data as ContactConfig;
  },

  submitMessage: async (input: SubmitContactMessageInput) => {
    const { data } = await api.post("/contact/messages", input);
    return data as { id: string; referenceNumber: string; message: string };
  },

  createChatSession: async (input?: {
    visitorName?: string;
    visitorEmail?: string;
  }) => {
    const { data } = await api.post("/contact/chat/sessions", input || {});
    if (typeof window !== "undefined" && data.sessionId) {
      sessionStorage.setItem(CHAT_SESSION_KEY, data.sessionId);
    }
    return data as { sessionId: string; messages: ChatMessage[] };
  },

  getChatSession: async (sessionId: string) => {
    const { data } = await api.get(`/contact/chat/sessions/${sessionId}`);
    return data as {
      id: string;
      status: string;
      isBusinessHours: boolean;
      messages: ChatMessage[];
    };
  },

  sendChatMessage: async (sessionId: string, content: string) => {
    const { data } = await api.post(
      `/contact/chat/sessions/${sessionId}/messages`,
      { content }
    );
    return data as { messages: ChatMessage[] };
  },

  getStoredChatSessionId: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(CHAT_SESSION_KEY);
  },

  clearChatSession: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  },

  getMessagesAdmin: async (params?: {
    status?: ContactMessageStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/contact/admin/messages", { params });
    return data as { messages: ContactMessage[]; total: number };
  },

  updateMessageStatus: async (id: string, status: ContactMessageStatus) => {
    const { data } = await api.patch(
      `/contact/admin/messages/${id}/status`,
      { status }
    );
    return data as ContactMessage;
  },

  getChatSessionsAdmin: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get("/contact/admin/chat/sessions", {
      params,
    });
    return data as {
      sessions: Array<{
        id: string;
        visitorName: string | null;
        visitorEmail: string | null;
        status: string;
        messageCount: number;
        lastMessageAt: string | null;
        createdAt: string;
      }>;
      total: number;
    };
  },
};
