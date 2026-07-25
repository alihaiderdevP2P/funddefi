"use client";

import { useState, useEffect, useCallback } from "react";
import { campaignsAPI, type CampaignUpdate } from "@/lib/api";

export function useCampaignUpdates(campaignId: string) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = useCallback(async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      const data = await campaignsAPI.getUpdates(campaignId);
      setUpdates(data);
      setError(null);
    } catch {
      setError("Failed to load updates");
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const createUpdate = async (data: { title: string; content: string }) => {
    const created = await campaignsAPI.createUpdate(campaignId, data);
    setUpdates((prev) => [created, ...prev]);
    return created;
  };

  return { updates, loading, error, refetch: fetchUpdates, createUpdate };
}
