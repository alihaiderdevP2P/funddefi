/**
 * FundFlow notifications edge function
 *
 * Actions:
 *   create              – create in-app/popup (+ optional email) respecting prefs
 *   list                – list notifications for a user
 *   mark_read           – mark one notification read
 *   mark_all_read       – mark all read for a user
 *   get_preferences     – load Settings → Notifications toggles
 *   update_preferences  – save Settings → Notifications toggles
 *
 * Deploy:
 *   npx supabase functions deploy notifications --project-ref <ref>
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

type NotificationType =
  | "funding_alert"
  | "campaign_update"
  | "marketing"
  | "system"
  | "welcome";

type NotificationChannel = "in_app" | "email" | "both";

interface Preferences {
  user_id: string;
  email_notifications: boolean;
  campaign_updates: boolean;
  funding_alerts: boolean;
  marketing_emails: boolean;
}

interface CreateBody {
  action: "create";
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  showPopup?: boolean;
}

interface ListBody {
  action: "list";
  userId: string;
  limit?: number;
  unreadOnly?: boolean;
}

interface MarkReadBody {
  action: "mark_read";
  userId: string;
  notificationId: string;
}

interface MarkAllReadBody {
  action: "mark_all_read";
  userId: string;
}

interface GetPrefsBody {
  action: "get_preferences";
  userId: string;
}

interface UpdatePrefsBody {
  action: "update_preferences";
  userId: string;
  emailNotifications?: boolean;
  campaignUpdates?: boolean;
  fundingAlerts?: boolean;
  marketingEmails?: boolean;
}

type RequestBody =
  | CreateBody
  | ListBody
  | MarkReadBody
  | MarkAllReadBody
  | GetPrefsBody
  | UpdatePrefsBody;

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

async function ensurePreferences(
  supabase: ReturnType<typeof adminClient>,
  userId: string
): Promise<Preferences> {
  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as Preferences;

  const { data: created, error } = await supabase
    .from("notification_preferences")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) throw error;
  return created as Preferences;
}

function typeAllowed(type: NotificationType, prefs: Preferences): boolean {
  switch (type) {
    case "funding_alert":
      return prefs.funding_alerts;
    case "campaign_update":
      return prefs.campaign_updates;
    case "marketing":
      return prefs.marketing_emails;
    case "system":
    case "welcome":
      return true;
    default:
      return true;
  }
}

function shouldSendEmail(
  type: NotificationType,
  channel: NotificationChannel,
  prefs: Preferences
): boolean {
  if (channel === "in_app") return false;
  if (!prefs.email_notifications) return false;
  return typeAllowed(type, prefs);
}

function shouldCreateInApp(
  type: NotificationType,
  channel: NotificationChannel,
  prefs: Preferences
): boolean {
  if (channel === "email") return false;
  return typeAllowed(type, prefs);
}

async function sendEmail(opts: {
  to: string;
  toName?: string;
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

function emailHtml(title: string, message: string, data?: Record<string, unknown>) {
  const link =
    typeof data?.link === "string"
      ? `<p style="margin-top:24px"><a href="${data.link}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open FundFlow</a></p>`
      : "";

  return `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;background:#f6f6f6;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e5e5">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#888">FundFlow</p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#111">${title}</h1>
    <p style="margin:0;color:#333;line-height:1.5">${message}</p>
    ${link}
  </div>
</body></html>`;
}

async function handleCreate(
  supabase: ReturnType<typeof adminClient>,
  body: CreateBody
) {
  const type: NotificationType = body.type || "system";
  const channel: NotificationChannel = body.channel || "both";
  const showPopup = body.showPopup !== false;

  const prefs = await ensurePreferences(supabase, body.userId);
  const inApp = shouldCreateInApp(type, channel, prefs);
  const email = shouldSendEmail(type, channel, prefs);

  if (!inApp && !email) {
    return {
      skipped: true,
      reason: "User preferences disabled this notification",
      type,
      userId: body.userId,
    };
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", body.userId)
    .single();

  if (userError || !user) {
    throw new Error(userError?.message || "User not found");
  }

  let emailSent = false;
  let emailError: string | null = null;

  if (email) {
    const result = await sendEmail({
      to: user.email,
      toName: user.name,
      subject: body.title,
      html: emailHtml(body.title, body.message, body.data),
    });
    emailSent = result.sent;
    emailError = result.error ?? null;
  }

  if (!inApp && email) {
    // Email-only: still store a row so history exists, but hide popup
    const { data: row, error } = await supabase
      .from("notifications")
      .insert({
        user_id: body.userId,
        type,
        title: body.title,
        message: body.message,
        data: body.data || {},
        channel: "email",
        show_popup: false,
        email_sent: emailSent,
        email_error: emailError,
      })
      .select("*")
      .single();

    if (error) throw error;
    return {
      skipped: false,
      notification: row,
      channels: { inApp: false, email: true, emailSent, emailError },
    };
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: body.userId,
      type,
      title: body.title,
      message: body.message,
      data: body.data || {},
      channel: email ? "both" : "in_app",
      show_popup: showPopup,
      email_sent: emailSent,
      email_error: emailError,
    })
    .select("*")
    .single();

  if (error) throw error;

  return {
    skipped: false,
    notification,
    channels: {
      inApp: true,
      popup: showPopup,
      email,
      emailSent,
      emailError,
    },
  };
}

async function handleList(
  supabase: ReturnType<typeof adminClient>,
  body: ListBody
) {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", body.userId)
    .order("created_at", { ascending: false })
    .limit(Math.min(body.limit || 50, 100));

  if (body.unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;
  if (error) throw error;

  const unreadCount =
    data?.filter((n) => !n.is_read).length ?? 0;

  return { notifications: data || [], unreadCount };
}

async function handleMarkRead(
  supabase: ReturnType<typeof adminClient>,
  body: MarkReadBody
) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", body.notificationId)
    .eq("user_id", body.userId)
    .select("*")
    .single();

  if (error) throw error;
  return { notification: data };
}

async function handleMarkAllRead(
  supabase: ReturnType<typeof adminClient>,
  body: MarkAllReadBody
) {
  const { error, count } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", body.userId)
    .eq("is_read", false);

  if (error) throw error;
  return { updated: count ?? true };
}

async function handleGetPreferences(
  supabase: ReturnType<typeof adminClient>,
  body: GetPrefsBody
) {
  const prefs = await ensurePreferences(supabase, body.userId);
  return {
    emailNotifications: prefs.email_notifications,
    campaignUpdates: prefs.campaign_updates,
    fundingAlerts: prefs.funding_alerts,
    marketingEmails: prefs.marketing_emails,
  };
}

async function handleUpdatePreferences(
  supabase: ReturnType<typeof adminClient>,
  body: UpdatePrefsBody
) {
  await ensurePreferences(supabase, body.userId);

  const patch: Record<string, boolean> = {};
  if (typeof body.emailNotifications === "boolean") {
    patch.email_notifications = body.emailNotifications;
  }
  if (typeof body.campaignUpdates === "boolean") {
    patch.campaign_updates = body.campaignUpdates;
  }
  if (typeof body.fundingAlerts === "boolean") {
    patch.funding_alerts = body.fundingAlerts;
  }
  if (typeof body.marketingEmails === "boolean") {
    patch.marketing_emails = body.marketingEmails;
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .update(patch)
    .eq("user_id", body.userId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    emailNotifications: data.email_notifications,
    campaignUpdates: data.campaign_updates,
    fundingAlerts: data.funding_alerts,
    marketingEmails: data.marketing_emails,
  };
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
      case "create": {
        if (!body.userId || !body.title || !body.message) {
          return json(
            { error: "userId, title, and message are required" },
            400
          );
        }
        return json(await handleCreate(supabase, body));
      }
      case "list": {
        if (!body.userId) return json({ error: "userId is required" }, 400);
        return json(await handleList(supabase, body));
      }
      case "mark_read": {
        if (!body.userId || !body.notificationId) {
          return json(
            { error: "userId and notificationId are required" },
            400
          );
        }
        return json(await handleMarkRead(supabase, body));
      }
      case "mark_all_read": {
        if (!body.userId) return json({ error: "userId is required" }, 400);
        return json(await handleMarkAllRead(supabase, body));
      }
      case "get_preferences": {
        if (!body.userId) return json({ error: "userId is required" }, 400);
        return json(await handleGetPreferences(supabase, body));
      }
      case "update_preferences": {
        if (!body.userId) return json({ error: "userId is required" }, 400);
        return json(await handleUpdatePreferences(supabase, body));
      }
      default:
        return json({ error: `Unknown action` }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("notifications function error:", message);
    return json({ error: message }, 500);
  }
});
