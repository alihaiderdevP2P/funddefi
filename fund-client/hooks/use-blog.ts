"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blogAPI, type BlogPost } from "@/lib/blog-api";
import websocketService from "@/lib/websocket";

interface UseBlogOptions {
  category?: string;
  tag?: string;
  search?: string;
  autoConnect?: boolean;
}

export function useBlog(options: UseBlogOptions = {}) {
  const { category, tag, search, autoConnect = true } = options;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadPosts = useCallback(async () => {
    try {
      const [postsData, featured, cats, tagList] = await Promise.all([
        blogAPI.getPosts({
          category: category && category !== "All" ? category : undefined,
          tag: tag || undefined,
          search: search || undefined,
          limit: 50,
        }),
        blogAPI.getFeatured(),
        blogAPI.getCategories(),
        blogAPI.getTags(),
      ]);

      if (!mountedRef.current) return;

      setPosts(postsData.posts);
      setTotal(postsData.total);
      setFeaturedPosts(featured);
      setCategories(["All", ...cats]);
      setTags(tagList);
      setError(null);
    } catch {
      if (mountedRef.current) {
        setError("Failed to load blog posts");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [category, tag, search]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    loadPosts();
    return () => {
      mountedRef.current = false;
    };
  }, [loadPosts]);

  useEffect(() => {
    if (!autoConnect) return;

    websocketService.connect();
    websocketService.emit("join-blog-feed", {});

    const handlePostUpdate = () => {
      loadPosts();
    };

    const handleEngagement = (data: {
      slug: string;
      views: number;
      likes: number;
    }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.slug === data.slug
            ? { ...p, views: data.views, likes: data.likes }
            : p
        )
      );
      setFeaturedPosts((prev) =>
        prev.map((p) =>
          p.slug === data.slug
            ? { ...p, views: data.views, likes: data.likes }
            : p
        )
      );
    };

    websocketService.onBlogPostUpdate(handlePostUpdate);
    websocketService.onBlogFeedChanged(handlePostUpdate);
    websocketService.onBlogEngagementUpdate(handleEngagement);

    return () => {
      websocketService.off("blog-post-updated", handlePostUpdate);
      websocketService.off("blog-feed-changed", handlePostUpdate);
      websocketService.off("blog-engagement-updated", handleEngagement);
      websocketService.emit("leave-blog-feed", {});
    };
  }, [autoConnect, loadPosts]);

  const updatePostEngagement = useCallback(
    (slug: string, updates: Partial<Pick<BlogPost, "views" | "likes">>) => {
      const patch = (list: BlogPost[]) =>
        list.map((p) => (p.slug === slug ? { ...p, ...updates } : p));
      setPosts(patch);
      setFeaturedPosts(patch);
    },
    []
  );

  return {
    posts,
    featuredPosts,
    categories,
    tags,
    total,
    loading,
    error,
    reload: loadPosts,
    updatePostEngagement,
  };
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogAPI.getBySlug(slug);
      setPost(data);
      setError(null);
    } catch {
      setError("Article not found");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    websocketService.connect();

    const handleEngagement = (data: {
      slug: string;
      views: number;
      likes: number;
    }) => {
      if (data.slug === slug) {
        setPost((prev) =>
          prev ? { ...prev, views: data.views, likes: data.likes } : prev
        );
      }
    };

    websocketService.onBlogEngagementUpdate(handleEngagement);
    return () => {
      websocketService.off("blog-engagement-updated", handleEngagement);
    };
  }, [slug]);

  const like = async () => {
    if (liked || !post) return;
    try {
      const { likes } = await blogAPI.like(slug);
      setPost({ ...post, likes });
      setLiked(true);
    } catch {
      // ignore duplicate like errors
    }
  };

  return { post, loading, error, like, liked, reload: load };
}
