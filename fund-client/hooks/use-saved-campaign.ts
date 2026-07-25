"use client";

import { useState, useEffect, useCallback } from "react";
import { campaignsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const LOCAL_KEY = "fundflow_saved_campaigns";

function getLocalSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalSaved(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function useSavedCampaign(campaignId: string) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      if (isAuthenticated) {
        const { saved: isSaved } = await campaignsAPI.getSaveStatus(campaignId);
        setSaved(isSaved);
      } else {
        setSaved(getLocalSaved().includes(campaignId));
      }
    } catch {
      setSaved(getLocalSaved().includes(campaignId));
    } finally {
      setLoading(false);
    }
  }, [campaignId, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleSave = async () => {
    const next = !saved;
    if (isAuthenticated) {
      if (next) await campaignsAPI.save(campaignId);
      else await campaignsAPI.unsave(campaignId);
    } else {
      const ids = getLocalSaved();
      if (next) {
        if (!ids.includes(campaignId)) ids.push(campaignId);
      } else {
        const i = ids.indexOf(campaignId);
        if (i >= 0) ids.splice(i, 1);
      }
      setLocalSaved(ids);
    }
    setSaved(next);
    return next;
  };

  return { saved, loading, toggleSave, refresh };
}
