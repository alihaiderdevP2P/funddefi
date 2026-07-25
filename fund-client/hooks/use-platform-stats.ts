"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fundingAPI } from "@/lib/api";
import websocketService from "@/lib/websocket";

export interface PlatformStats {
  totalAmount: number;
  totalFundings: number;
  totalBackers: number;
  activeCampaigns: number;
  totalCampaigns: number;
  fundedCampaigns: number;
}

const EMPTY_STATS: PlatformStats = {
  totalAmount: 0,
  totalFundings: 0,
  totalBackers: 0,
  activeCampaigns: 0,
  totalCampaigns: 0,
  fundedCampaigns: 0,
};

const POLL_INTERVAL_MS = 30_000;

function normalizeStats(data: Partial<PlatformStats> | null | undefined): PlatformStats {
  if (!data) return EMPTY_STATS;
  return {
    totalAmount: Number(data.totalAmount) || 0,
    totalFundings: Number(data.totalFundings) || 0,
    totalBackers: Number(data.totalBackers) || 0,
    activeCampaigns: Number(data.activeCampaigns) || 0,
    totalCampaigns: Number(data.totalCampaigns) || 0,
    fundedCampaigns: Number(data.fundedCampaigns) || 0,
  };
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const applyStats = useCallback((next: Partial<PlatformStats>) => {
    if (!mountedRef.current) return;
    setStats((prev) => normalizeStats({ ...prev, ...next }));
    setLastUpdated(new Date());
    setError(null);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fundingAPI.getStats();
      applyStats(response);
    } catch (err) {
      if (!mountedRef.current) return;
      setError("Failed to fetch platform stats");
      console.error("Error fetching platform stats:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyStats]);

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();

    websocketService.connect();

    const onLiveStats = (data: { platformStats?: Partial<PlatformStats> }) => {
      if (data?.platformStats) {
        applyStats(data.platformStats);
        setIsLive(true);
        setLoading(false);
      }
    };

    const onPlatformUpdate = (data: {
      platformStats?: Partial<PlatformStats>;
    }) => {
      if (data?.platformStats) {
        applyStats(data.platformStats);
        setIsLive(true);
      } else {
        websocketService.getLiveStats();
      }
    };

    const onConnect = () => {
      setIsLive(true);
      websocketService.getLiveStats();
    };

    const onDisconnect = () => setIsLive(false);

    websocketService.onLiveStats(onLiveStats);
    websocketService.onPlatformStatsUpdate(onPlatformUpdate);
    websocketService.on("connect", onConnect);
    websocketService.on("disconnect", onDisconnect);

    if (websocketService.isConnected) {
      websocketService.getLiveStats();
      setIsLive(true);
    }

    const pollId = window.setInterval(() => {
      if (!websocketService.isConnected) fetchStats();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(pollId);
      websocketService.off("live-stats", onLiveStats);
      websocketService.off("platform-stats-updated", onPlatformUpdate);
      websocketService.off("connect", onConnect);
      websocketService.off("disconnect", onDisconnect);
    };
  }, [applyStats, fetchStats]);

  return {
    stats,
    loading,
    error,
    isLive,
    lastUpdated,
    refetch: fetchStats,
  };
}
