import type { Campaign, Funding } from "@/lib/api";
import { calcFundingProgress } from "@/lib/format-eth";

export type DisplayStatus =
  | "active"
  | "funded"
  | "expired"
  | "cancelled"
  | "draft"
  | "failed";

export function mapCampaignStatus(status: Campaign["status"]): DisplayStatus {
  if (status === "expired") return "failed";
  return status;
}

export function getStatusColor(status: DisplayStatus | string): string {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "funded":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "failed":
    case "expired":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "cancelled":
    case "paused":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export function formatStatusLabel(status: string): string {
  if (status === "expired") return "Failed";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getDaysLeft(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
}

export interface BackedCampaignView {
  id: string;
  fundingId: string;
  title: string;
  creator: string;
  creatorId?: string;
  category: string;
  pledgeAmount: number;
  reward: string;
  status: DisplayStatus;
  progress: number;
  raised: number;
  goal: number;
  daysLeft: number;
  image: string;
  lastUpdate: string;
  backedAt: string;
}

export function fundingToBackedView(funding: Funding): BackedCampaignView | null {
  const campaign = funding.campaign;
  if (!campaign) return null;

  const raised = Number(campaign.raisedAmount) || 0;
  const goal = Number(campaign.goalAmount) || 0;

  return {
    id: campaign.id,
    fundingId: funding.id,
    title: campaign.title,
    creator: campaign.creator?.name || "Unknown creator",
    creatorId: campaign.creator?.id,
    category: campaign.category,
    pledgeAmount: Number(funding.amount) || 0,
    reward: funding.reward?.title || "No reward selected",
    status: mapCampaignStatus(campaign.status),
    progress: calcFundingProgress(raised, goal),
    raised,
    goal,
    daysLeft: getDaysLeft(campaign.endDate),
    image: campaign.imageUrl || "/placeholder.svg",
    lastUpdate: campaign.updatedAt,
    backedAt: funding.createdAt,
  };
}

export interface CreatedCampaignView {
  id: string;
  title: string;
  description: string;
  status: DisplayStatus;
  progress: number;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  image: string;
  lastUpdate: string;
  views: number;
  conversionRate: number;
  avgPledge: number;
  rewards: Campaign["rewards"];
}

export function campaignToCreatedView(
  campaign: Campaign,
  estimatedViews?: number
): CreatedCampaignView {
  const raised = Number(campaign.raisedAmount) || 0;
  const goal = Number(campaign.goalAmount) || 0;
  const backers = campaign.backersCount || 0;
  const views = estimatedViews ?? backers * 12 + 100;
  const confirmedFundings = (campaign.fundings || []).filter(
    (f) => f.status === "confirmed"
  );
  const avgPledge =
    confirmedFundings.length > 0
      ? confirmedFundings.reduce((s, f) => s + Number(f.amount), 0) /
        confirmedFundings.length
      : backers > 0
        ? raised / backers
        : 0;

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    status: mapCampaignStatus(campaign.status),
    progress: calcFundingProgress(raised, goal),
    raised,
    goal,
    backers,
    daysLeft: getDaysLeft(campaign.endDate),
    image: campaign.imageUrl || "/placeholder.svg",
    lastUpdate: campaign.updatedAt,
    views,
    conversionRate:
      views > 0 ? Math.round((backers / views) * 1000) / 10 : 0,
    avgPledge: Math.round(avgPledge * 10000) / 10000,
    rewards: campaign.rewards || [],
  };
}

export function exportDashboardCsv(data: {
  summary: Record<string, unknown>;
  metrics: Record<string, unknown>;
  fundingTrends: Array<Record<string, unknown>>;
  campaignPerformance: Array<Record<string, unknown>>;
}): void {
  const lines: string[] = [
    "FundFlow Dashboard Export",
    `Generated,${new Date().toISOString()}`,
    "",
    "Summary",
    ...Object.entries(data.summary).map(([k, v]) => `${k},${v}`),
    "",
    "Metrics",
    ...Object.entries(data.metrics).map(([k, v]) => `${k},${v}`),
    "",
    "Funding Trends",
    "Month,Amount,Backers,Fundings",
    ...data.fundingTrends.map(
      (t) => `${t.date},${t.amount},${t.backers},${t.fundings ?? ""}`
    ),
    "",
    "Campaign Performance",
    "Name,Raised,Goal,Backers,Status",
    ...data.campaignPerformance.map(
      (c) => `${c.name},${c.raised},${c.goal},${c.backers},${c.status}`
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fundflow-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
