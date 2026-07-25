import axios from "axios";
import api from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/** Public client — no auth redirect on 401 (for blog reads & newsletter) */
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export type BlogPostStatus = "draft" | "published" | "archived";
export type NewsletterStatus = "active" | "unsubscribed" | "bounced";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar: string;
  authorId: string;
  publishedAt: string | null;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  status: BlogPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export interface NewsletterStats {
  active: number;
  unsubscribed: number;
  thisMonth: number;
}

export interface CreateBlogPostInput {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  featured?: boolean;
  status?: BlogPostStatus;
  slug?: string;
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {}

export const blogAPI = {
  getPosts: async (params?: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await publicApi.get("/blog", { params });
    return data as { posts: BlogPost[]; total: number };
  },

  getFeatured: async () => {
    const { data } = await publicApi.get("/blog/featured");
    return data as BlogPost[];
  },

  getCategories: async () => {
    const { data } = await publicApi.get("/blog/categories");
    return data as string[];
  },

  getTags: async () => {
    const { data } = await publicApi.get("/blog/tags");
    return data as string[];
  },

  getBySlug: async (slug: string) => {
    const { data } = await publicApi.get(`/blog/${slug}`);
    return data as BlogPost;
  },

  like: async (slug: string) => {
    const { data } = await publicApi.post(`/blog/${slug}/like`);
    return data as { likes: number };
  },

  subscribeNewsletter: async (email: string, honeypot = "") => {
    const { data } = await publicApi.post("/blog/newsletter/subscribe", {
      email,
      website: honeypot,
      source: "blog",
    });
    return data as { message: string; email: string; subscribedAt: string };
  },

  unsubscribeNewsletter: async (email: string) => {
    const { data } = await publicApi.post("/blog/newsletter/unsubscribe", {
      email,
    });
    return data as { message: string; email: string };
  },

  unsubscribeByToken: async (token: string) => {
    const { data } = await publicApi.get(
      `/blog/newsletter/unsubscribe/${token}`
    );
    return data as { message: string; email: string };
  },

  // Admin endpoints (authenticated)
  getAllAdmin: async (params?: {
    status?: BlogPostStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/blog/admin/all", { params });
    return data as { posts: BlogPost[]; total: number };
  },

  getNewsletterSubscribers: async (params?: {
    status?: NewsletterStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/blog/newsletter/admin/subscribers", {
      params,
    });
    return data as {
      subscribers: NewsletterSubscriber[];
      total: number;
      stats: NewsletterStats;
    };
  },

  create: async (input: CreateBlogPostInput) => {
    const { data } = await api.post("/blog", input);
    return data as BlogPost;
  },

  update: async (id: string, input: UpdateBlogPostInput) => {
    const { data } = await api.patch(`/blog/${id}`, input);
    return data as BlogPost;
  },

  publish: async (id: string, publish = true) => {
    const { data } = await api.patch(`/blog/${id}/publish`, { publish });
    return data as BlogPost;
  },

  archive: async (id: string) => {
    const { data } = await api.patch(`/blog/${id}/archive`);
    return data as BlogPost;
  },

  delete: async (id: string) => {
    await api.delete(`/blog/${id}`);
  },
};
