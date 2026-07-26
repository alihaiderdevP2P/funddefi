# Campaign Digest Edge Function

Sends a daily summary of campaign funding activity to creators (email via Resend), respecting **Settings → Notifications** (`email_notifications` + `funding_alerts`).

## Tables used

- `fundings` — confirmed backings in the lookback window
- `campaigns` — title, creator, raised/goal amounts
- `users` — creator email / name
- `notification_preferences` — preference gates
- `notifications` — history row when a digest is sent (`type: funding_alert`, `show_popup: false`)

## Deploy

```bash
# from fund-server/ (where supabase/ is linked)
cd fund-server
npx supabase login
npx supabase functions deploy campaign-digest --project-ref nkwvphdtvfcwdeqocupj

# secrets (service role is usually auto-injected)
npx supabase secrets set RESEND_API_KEY=re_xxx --project-ref nkwvphdtvfcwdeqocupj
npx supabase secrets set EMAIL_FROM="FundFlow <noreply@yourdomain.com>" --project-ref nkwvphdtvfcwdeqocupj
# optional: shared secret for Nest callers (same as notifications)
npx supabase secrets set NOTIFY_SECRET=your-random-secret --project-ref nkwvphdtvfcwdeqocupj
```

Add matching `NOTIFY_SECRET` to `fund-server/.env` if you set it.

Source path: `fund-server/supabase/functions/campaign-digest/` (required by the Supabase CLI).
## Actions (POST JSON body)

| action | purpose |
|--------|---------|
| `run_digest` | Email digests for creators with recent confirmed fundings |
| `preview` | Build digest HTML for one creator without sending |

### `run_digest`

```json
{
  "action": "run_digest",
  "userId": "<optional-creator-uuid>",
  "hoursBack": 24
}
```

- Omit `userId` to process all creators with activity in the window.
- `hoursBack` defaults to `24` (min `1`, max `168`).

**Response shape:**

```json
{
  "hoursBack": 24,
  "sent": 2,
  "skipped": 1,
  "results": [
    {
      "userId": "...",
      "email": "creator@example.com",
      "sent": true,
      "fundingCount": 3,
      "campaignCount": 1,
      "totalAmount": 0.15
    }
  ]
}
```

### `preview`

```json
{
  "action": "preview",
  "userId": "<creator-uuid>",
  "hoursBack": 24
}
```

**Response shape:**

```json
{
  "userId": "...",
  "hoursBack": 24,
  "count": 3,
  "campaignCount": 1,
  "totalAmount": 0.15,
  "subject": "FundFlow: 3 new backings in the last 24h",
  "html": "<!DOCTYPE html>..."
}
```

## Auth

- Supabase **service role** via `Authorization: Bearer <SERVICE_ROLE_KEY>` + `apikey`
- Optional shared secret: header `x-notify-secret` must match `NOTIFY_SECRET` when that secret is set

## How callers should invoke it

### fund-server (Nest cron / admin)

```
POST {SUPABASE_URL}/functions/v1/campaign-digest
Headers:
  Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
  apikey: {SUPABASE_SERVICE_ROLE_KEY}
  Content-Type: application/json
  x-notify-secret: {NOTIFY_SECRET}   # if configured
Body:
  { "action": "run_digest", "hoursBack": 24 }
```

Mirror the existing `NotificationsService.callEdgeFunction` pattern, but point the URL at `/functions/v1/campaign-digest`.

### fund-client

Prefer calling Nest (admin-only or cron), not the edge function directly from the browser. Client → Nest → edge keeps the service role and `NOTIFY_SECRET` off the client.

### Fallback if edge fails

Nest should **log and skip** — do not send digest emails from Nest locally. Instant funding alerts already go through the `notifications` edge function / local fallback path.

## Preference gates

Digest email is sent only when:

- `email_notifications` is ON (or prefs row missing → treated as allowed)
- `funding_alerts` is ON
