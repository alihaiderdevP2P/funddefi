import { NextResponse } from "next/server";
import { getReachableBackendApiUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

const EMPTY_STATS = {
  totalAmount: 0,
  totalFundings: 0,
  totalBackers: 0,
  activeCampaigns: 0,
  totalCampaigns: 0,
  fundedCampaigns: 0,
};

export async function GET() {
  const backendUrl = getReachableBackendApiUrl();

  if (!backendUrl) {
    return NextResponse.json(EMPTY_STATS);
  }

  try {
    const response = await fetch(`${backendUrl}/funding/stats`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching funding stats:", error);
    return NextResponse.json(EMPTY_STATS);
  }
}
