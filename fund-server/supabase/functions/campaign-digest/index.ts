/**
 * FundFlow campaign-digest edge function
 *
 * Purpose: Send a daily summary of campaign funding activity to creators.
 *
 * Actions:
 *   run_digest  – email digests for creators with recent confirmed fundings
 *   preview     – build digest HTML for one creator without sending
 *
 * Deploy:
 *   npx supabase functions deploy campaign-digest --project-ref <ref>
 *
 * Secrets (dashboard or CLI):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY (optional – enables real email delivery)
 *   EMAIL_FROM (optional – default FundFlow <noreply@fundflow.app>)
 *   NOTIFY_SECRET (optional – shared secret for Nest/server callers)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notify-secret",
};

interface Preferences {
  user_id: string;
  email_notifications: boolean;
  campaign_updates: boolean;
  funding_alerts: boolean;
  marketing_emails: boolean;
}

interface RunDigestBody {
  action: "run_digest";
  /** Limit to one creator; omit to process all creators with activity */
  userId?: string;
  /** Lookback window in hours (default 24, max 168) */
  hoursBack?: number;
}

interface PreviewBody {
  action: "preview";
  userId: string;
  hoursBack?: number;
}

type RequestBody = RunDigestBody | PreviewBody;

interface FundingRow {
  id: string;
  amount: number | string;
  status: string;
  created_at: string;
  campaign_id: string;
  user_id: string;
  campaigns: {
    id: string;
    title: string;
    creator_id: string;
    raised_amount: number | string;
    goal_amount: number | string;
  } | null;
}

interface CampaignBucket {
  campaignId: string;
  title: string;
  raisedAmount: number;
  goalAmount: number;
  fundingCount: number;
  totalAmount: number;
}

interface DigestPayload {
  userId: string;
  email: string;
  name: string | null;
  hoursBack: number;
  campaignCount: number;
  fundingCount: number;
  totalAmount: number;
  campaigns: CampaignBucket[];
  html: string;
  subject: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function assertSecret(req: Request) {
  const expected = Deno.env.get("NOTIFY_SECRET");
  if (!expected) return;
  const provided = req.headers.get("x-notify-secret");
  if (provided !== expected) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

function clampHoursBack(value?: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 24;
  return Math.min(Math.max(Math.floor(n), 1), 168);
}

function toNumber(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatEth(amount: number): string {
  return `${amount.toFixed(4)} ETH`;
}

async function getPreferences(
  supabase: ReturnType<typeof adminClient>,
  userId: string
): Promise<Preferences | null> {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Preferences) ?? null;
}

function prefsAllowDigest(prefs: Preferences | null): boolean {
  // Missing prefs → allow (defaults in schema are ON)
  if (!prefs) return true;
  return prefs.email_notifications && prefs.funding_alerts;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured (queued)" };
  }

  const from =
    Deno.env.get("EMAIL_FROM") || "FundFlow <noreply@fundflow.app>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { sent: false, error: text.slice(0, 500) };
  }

  return { sent: true };
}

function buildDigestHtml(
  name: string | null,
  hoursBack: number,
  campaigns: CampaignBucket[]
): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const rows = campaigns
    .map(
      (c) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee">
          <strong style="color:#111">${c.title}</strong>
          <div style="color:#555;font-size:14px;margin-top:4px">
            ${c.fundingCount} new backing${c.fundingCount === 1 ? "" : "s"} ·
            ${formatEth(c.totalAmount)}
          </div>
          <div style="color:#888;font-size:13px;margin-top:2px">
            Total raised ${formatEth(c.raisedAmount)} / ${formatEth(c.goalAmount)}
          </div>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;background:#f6f6f6;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e5e5">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#888">FundFlow</p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#111">Your campaign digest</h1>
    <p style="margin:0 0 16px;color:#333;line-height:1.5">${greeting}</p>
    <p style="margin:0 0 20px;color:#333;line-height:1.5">
      Here’s a summary of funding activity on your campaigns in the last ${hoursBack} hour${hoursBack === 1 ? "" : "s"}.
    </p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="margin:24px 0 0;font-size:13px;color:#888">
      Manage email preferences in Settings → Notifications.
    </p>
  </div>
</body></html>`;
}

async function loadFundingsForWindow(
  supabase: ReturnType<typeof adminClient>,
  hoursBack: number,
  creatorId?: string
): Promise<FundingRow[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("fundings")
    .select(
      `
      id,
      amount,
      status,
      created_at,
      campaign_id,
      user_id,
      campaigns!inner (
        id,
        title,
        creator_id,
        raised_amount,
        goal_amount
      )
    `
    )
    .eq("status", "confirmed")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  if (creatorId) {
    query = query.eq("campaigns.creator_id", creatorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as FundingRow[]) || [];
}

function groupByCreator(rows: FundingRow[]): Map<string, CampaignBucket[]> {
  const byCreator = new Map<string, Map<string, CampaignBucket>>();

  for (const row of rows) {
    const campaign = row.campaigns;
    if (!campaign?.creator_id) continue;

    let campaignMap = byCreator.get(campaign.creator_id);
    if (!campaignMap) {
      campaignMap = new Map();
      byCreator.set(campaign.creator_id, campaignMap);
    }

    let bucket = campaignMap.get(campaign.id);
    if (!bucket) {
      bucket = {
        campaignId: campaign.id,
        title: campaign.title,
        raisedAmount: toNumber(campaign.raised_amount),
        goalAmount: toNumber(campaign.goal_amount),
        fundingCount: 0,
        totalAmount: 0,
      };
      campaignMap.set(campaign.id, bucket);
    }

    bucket.fundingCount += 1;
    bucket.totalAmount += toNumber(row.amount);
  }

  const result = new Map<string, CampaignBucket[]>();
  for (const [creatorId, campaignMap] of byCreator) {
    result.set(creatorId, Array.from(campaignMap.values()));
  }
  return result;
}

async function buildDigestForCreator(
  supabase: ReturnType<typeof adminClient>,
  creatorId: string,
  campaigns: CampaignBucket[],
  hoursBack: number
): Promise<DigestPayload | { skipped: true; userId: string; reason: string }> {
  const prefs = await getPreferences(supabase, creatorId);
  if (!prefsAllowDigest(prefs)) {
    return {
      skipped: true,
      userId: creatorId,
      reason: "User preferences disabled funding alert emails",
    };
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", creatorId)
    .single();

  if (error || !user?.email) {
    return {
      skipped: true,
      userId: creatorId,
      reason: error?.message || "User email not found",
    };
  }

  const fundingCount = campaigns.reduce((n, c) => n + c.fundingCount, 0);
  const totalAmount = campaigns.reduce((n, c) => n + c.totalAmount, 0);
  const subject =
    fundingCount === 1
      ? `FundFlow: 1 new backing in the last ${hoursBack}h`
      : `FundFlow: ${fundingCount} new backings in the last ${hoursBack}h`;

  return {
    userId: creatorId,
    email: user.email,
    name: user.name ?? null,
    hoursBack,
    campaignCount: campaigns.length,
    fundingCount,
    totalAmount,
    campaigns,
    html: buildDigestHtml(user.name ?? null, hoursBack, campaigns),
    subject,
  };
}

async function handlePreview(
  supabase: ReturnType<typeof adminClient>,
  body: PreviewBody
) {
  const hoursBack = clampHoursBack(body.hoursBack);
  const rows = await loadFundingsForWindow(supabase, hoursBack, body.userId);
  const grouped = groupByCreator(rows);
  const campaigns = grouped.get(body.userId) || [];

  if (campaigns.length === 0) {
    return {
      userId: body.userId,
      hoursBack,
      count: 0,
      html: null,
      message: "No confirmed funding activity in this window",
    };
  }

  const digest = await buildDigestForCreator(
    supabase,
    body.userId,
    campaigns,
    hoursBack
  );

  if ("skipped" in digest && digest.skipped) {
    return {
      userId: body.userId,
      hoursBack,
      count: campaigns.reduce((n, c) => n + c.fundingCount, 0),
      html: null,
      skipped: true,
      reason: digest.reason,
    };
  }

  const payload = digest as DigestPayload;
  return {
    userId: payload.userId,
    hoursBack: payload.hoursBack,
    count: payload.fundingCount,
    campaignCount: payload.campaignCount,
    totalAmount: payload.totalAmount,
    subject: payload.subject,
    html: payload.html,
    campaigns: payload.campaigns,
  };
}

async function handleRunDigest(
  supabase: ReturnType<typeof adminClient>,
  body: RunDigestBody
) {
  const hoursBack = clampHoursBack(body.hoursBack);
  const rows = await loadFundingsForWindow(supabase, hoursBack, body.userId);
  const grouped = groupByCreator(rows);

  if (grouped.size === 0) {
    return {
      hoursBack,
      sent: 0,
      skipped: 0,
      results: [],
      message: "No confirmed funding activity in this window",
    };
  }

  const results: Array<Record<string, unknown>> = [];
  let sent = 0;
  let skipped = 0;

  for (const [creatorId, campaigns] of grouped) {
    const digest = await buildDigestForCreator(
      supabase,
      creatorId,
      campaigns,
      hoursBack
    );

    if ("skipped" in digest && digest.skipped) {
      skipped += 1;
      results.push({
        userId: creatorId,
        skipped: true,
        reason: digest.reason,
      });
      continue;
    }

    const payload = digest as DigestPayload;
    const emailResult = await sendEmail({
      to: payload.email,
      subject: payload.subject,
      html: payload.html,
    });

    // Record an in-app notification for history (no popup spam)
    await supabase.from("notifications").insert({
      user_id: payload.userId,
      type: "funding_alert",
      title: payload.subject,
      message: `${payload.fundingCount} new backing${
        payload.fundingCount === 1 ? "" : "s"
      } across ${payload.campaignCount} campaign${
        payload.campaignCount === 1 ? "" : "s"
      } (${formatEth(payload.totalAmount)}).`,
      data: {
        kind: "campaign_digest",
        hoursBack,
        campaigns: payload.campaigns.map((c) => ({
          campaignId: c.campaignId,
          title: c.title,
          fundingCount: c.fundingCount,
          totalAmount: c.totalAmount,
        })),
      },
      channel: "email",
      show_popup: false,
      email_sent: emailResult.sent,
      email_error: emailResult.error ?? null,
    });

    if (emailResult.sent) {
      sent += 1;
      results.push({
        userId: payload.userId,
        email: payload.email,
        sent: true,
        fundingCount: payload.fundingCount,
        campaignCount: payload.campaignCount,
        totalAmount: payload.totalAmount,
      });
    } else {
      skipped += 1;
      results.push({
        userId: payload.userId,
        email: payload.email,
        sent: false,
        skipped: true,
        reason: emailResult.error || "Email not sent",
        fundingCount: payload.fundingCount,
      });
    }
  }

  return { hoursBack, sent, skipped, results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    assertSecret(req);
  } catch (denied) {
    if (denied instanceof Response) return denied;
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.action) {
      return json({ error: "action is required" }, 400);
    }

    const supabase = adminClient();

    switch (body.action) {
      case "run_digest": {
        return json(await handleRunDigest(supabase, body));
      }
      case "preview": {
        if (!body.userId) {
          return json({ error: "userId is required" }, 400);
        }
        return json(await handlePreview(supabase, body));
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("campaign-digest function error:", message);
    return json({ error: message }, 500);
  }
});
