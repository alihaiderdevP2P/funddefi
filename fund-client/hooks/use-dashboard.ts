"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  campaignsAPI,
  fundingAPI,
  type Campaign,
  type DashboardData,
  type Funding,
} from "@/lib/api";
import {
  campaignToCreatedView,
  fundingToBackedView,
  type BackedCampaignView,
  type CreatedCampaignView,
} from "@/lib/dashboard-utils";
import websocketService from "@/lib/websocket";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [myFundings, setMyFundings] = useState<Funding[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardData, fundings, campaigns] = await Promise.all([
        fundingAPI.getMyDashboard(),
        fundingAPI.getMyFundings(),
        campaignsAPI.getMyCampaigns(),
      ]);
      setDashboard(dashboardData);
      setMyFundings(fundings);
      setMyCampaigns(campaigns);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const handleUpdate = () => fetchAll();
    websocketService.onNewFunding(handleUpdate);
    websocketService.onCampaignUpdate(handleUpdate);
    return () => {
      websocketService.off("new-funding", handleUpdate);
      websocketService.off("campaign-update", handleUpdate);
    };
  }, [fetchAll]);

  const backedCampaigns = useMemo(
    () =>
      myFundings
        .filter((f) => f.status === "confirmed" && f.campaign)
        .map(fundingToBackedView)
        .filter((c): c is BackedCampaignView => c !== null),
    [myFundings]
  );

  const createdCampaigns = useMemo(
    () =>
      myCampaigns.map((c) =>
        campaignToCreatedView(c, dashboard?.metrics.estimatedViews)
      ),
    [myCampaigns, dashboard?.metrics.estimatedViews]
  );

  return {
    dashboard,
    myFundings,
    myCampaigns,
    backedCampaigns,
    createdCampaigns,
    loading,
    error,
    refetch: fetchAll,
  };
}
