"use client";

import { useState, useEffect } from "react";
import { campaignsAPI, type Campaign } from "@/lib/api";
import websocketService from "@/lib/websocket";

export function useCampaigns(filters?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getAll(filters);
      setCampaigns(response.campaigns);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError("Failed to fetch campaigns");
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [
    filters?.status,
    filters?.category,
    filters?.search,
    filters?.page,
    filters?.limit,
  ]);

  const refetch = () => {
    fetchCampaigns();
  };

  return {
    campaigns,
    total,
    loading,
    error,
    refetch,
  };
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchCampaign();

    // Join campaign room for real-time updates
    websocketService.joinCampaign(id);

    // Listen for real-time updates
    const handleCampaignUpdate = (data: any) => {
      if (data.campaignId === id) {
        setCampaign((prev) => (prev ? { ...prev, ...data } : null));
      }
    };

    const handleNewFunding = (data: any) => {
      if (data.campaignId === id) {
        setCampaign((prev) =>
          prev
            ? {
                ...prev,
                raisedAmount: data.campaignStats.raisedAmount,
                backersCount: data.campaignStats.backersCount,
              }
            : null
        );
      }
    };

    const handleStatusChange = (data: any) => {
      if (data.campaignId === id) {
        setCampaign((prev) =>
          prev ? { ...prev, status: data.newStatus } : null
        );
      }
    };

    websocketService.onCampaignUpdate(handleCampaignUpdate);
    websocketService.onNewFunding(handleNewFunding);
    websocketService.onCampaignStatusChange(handleStatusChange);

    return () => {
      websocketService.leaveCampaign(id);
      websocketService.off("campaign-updated", handleCampaignUpdate);
      websocketService.off("new-funding", handleNewFunding);
      websocketService.off("campaign-status-changed", handleStatusChange);
    };
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getById(id);
      setCampaign(response);
      setError(null);
    } catch (err) {
      setError("Failed to fetch campaign");
      console.error("Error fetching campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCampaign();
  };

  return {
    campaign,
    loading,
    error,
    refetch,
  };
}

export function useFeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getFeatured();
      setCampaigns(response);
      setError(null);
    } catch (err) {
      setError("Failed to fetch featured campaigns");
      console.error("Error fetching featured campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCampaigns();

    websocketService.connect();

    const patchCampaign = (campaignId: string, patch: Partial<Campaign>) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, ...patch } : c))
      );
    };

    const onNewFunding = (data: {
      campaignId?: string;
      campaignStats?: {
        raisedAmount: number;
        backersCount: number;
      };
    }) => {
      if (data.campaignId && data.campaignStats) {
        patchCampaign(data.campaignId, {
          raisedAmount: data.campaignStats.raisedAmount,
          backersCount: data.campaignStats.backersCount,
        });
      }
    };

    const onPlatformUpdate = (data: {
      campaignId?: string;
      campaignStats?: {
        raisedAmount: number;
        backersCount: number;
      };
    }) => {
      if (data.campaignId && data.campaignStats) {
        patchCampaign(data.campaignId, {
          raisedAmount: data.campaignStats.raisedAmount,
          backersCount: data.campaignStats.backersCount,
        });
      } else {
        fetchFeaturedCampaigns();
      }
    };

    websocketService.onNewFunding(onNewFunding);
    websocketService.onPlatformStatsUpdate(onPlatformUpdate);

    return () => {
      websocketService.off("new-funding", onNewFunding);
      websocketService.off("platform-stats-updated", onPlatformUpdate);
    };
  }, []);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchFeaturedCampaigns,
  };
}
