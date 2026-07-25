"use client";

import { useCallback, useEffect, useState } from "react";

export type CampaignTab = "story" | "updates" | "backers";

const VALID: CampaignTab[] = ["story", "updates", "backers"];

function tabFromHash(): CampaignTab | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "") as CampaignTab;
  return VALID.includes(hash) ? hash : null;
}

export function useCampaignTab(defaultTab: CampaignTab = "story") {
  const [activeTab, setActiveTabState] = useState<CampaignTab>(() => {
    return tabFromHash() ?? defaultTab;
  });

  useEffect(() => {
    const onHash = () => {
      const t = tabFromHash();
      if (t) setActiveTabState(t);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setActiveTab = useCallback((tab: CampaignTab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.hash = tab === "story" ? "" : tab;
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  return { activeTab, setActiveTab };
}
