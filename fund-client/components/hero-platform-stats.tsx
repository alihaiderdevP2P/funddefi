"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import type { PlatformStats } from "@/hooks/use-platform-stats";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroPlatformStatsProps {
  stats: PlatformStats;
  loading?: boolean;
  isLive?: boolean;
}

function useAnimatedValue(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const frameRef = useRef<number>();

  useEffect(() => {
    const from = displayRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return display;
}

function StatCell({
  value,
  label,
  format,
}: {
  value: number;
  label: string;
  format: (n: number) => string;
}) {
  const animated = useAnimatedValue(value);

  return (
    <div className="text-center">
      <div
        className="text-2xl font-bold text-white tabular-nums transition-opacity duration-300"
        aria-live="polite"
      >
        {format(animated)}
      </div>
      <div className="text-sm text-white/65">{label}</div>
    </div>
  );
}

export function HeroPlatformStats({
  stats,
  loading,
  isLive,
}: HeroPlatformStatsProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-24 mx-auto bg-white/20" />
            <Skeleton className="h-4 w-28 mx-auto bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <StatCell
          value={stats.totalAmount}
          label={t("home.hero.totalRaised")}
          format={(n) => `${n.toFixed(2)} ETH`}
        />
        <StatCell
          value={stats.totalFundings}
          label={t("home.hero.successfulFundings")}
          format={(n) => Math.round(n).toLocaleString()}
        />
        <StatCell
          value={stats.totalBackers}
          label={t("home.hero.activeBackers")}
          format={(n) => Math.round(n).toLocaleString()}
        />
      </div>
      <div
        className="flex items-center justify-center gap-1.5 text-xs text-white/50"
        aria-label={isLive ? "Live updates connected" : "Polling for updates"}
      >
        {isLive ? (
          <Wifi className="w-3 h-3 text-emerald-400" aria-hidden />
        ) : (
          <WifiOff className="w-3 h-3" aria-hidden />
        )}
        <span>{isLive ? t("home.hero.liveUpdates") : t("home.hero.syncing")}</span>
      </div>
    </div>
  );
}
