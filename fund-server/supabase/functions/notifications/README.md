# Notifications Edge Function

Creates in-app / popup notifications and optional emails, respecting **Settings → Notifications** preferences.

## Database

```bash
cd fund-server
npm run db:migrate:notifications
```

Tables:

- `notification_preferences` — email / campaign updates / funding alerts / marketing toggles
- `notifications` — inbox rows (`show_popup` drives toast popups)

## Deploy edge function

```bash
# from repo root
npx supabase login
npx supabase functions deploy notifications --project-ref nkwvphdtvfcwdeqocupj

# secrets (service role is usually auto-injected; add email + optional shared secret)
npx supabase secrets set RESEND_API_KEY=re_xxx --project-ref nkwvphdtvfcwdeqocupj
npx supabase secrets set EMAIL_FROM="FundFlow <noreply@yourdomain.com>" --project-ref nkwvphdtvfcwdeqocupj
# optional: shared secret for Nest callers
npx supabase secrets set NOTIFY_SECRET=your-random-secret --project-ref nkwvphdtvfcwdeqocupj
```

Add matching `NOTIFY_SECRET` to `fund-server/.env` if you set it.

## Actions (POST JSON body)

| action | purpose |
|--------|---------|
| `create` | create notification (+ email if prefs allow) |
| `list` | list user notifications |
| `mark_read` / `mark_all_read` | mark read |
| `get_preferences` / `update_preferences` | Settings toggles |

Example create:

```json
{
  "action": "create",
  "userId": "<uuid>",
  "type": "funding_alert",
  "title": "New funding received",
  "message": "Someone backed your campaign",
  "channel": "both",
  "showPopup": true,
  "data": { "campaignId": "...", "link": "/campaigns/..." }
}
```

Types → preference gates:

- `funding_alert` → Funding Alerts
- `campaign_update` → Campaign Updates
- `marketing` → Marketing Emails
- `system` / `welcome` → always allowed (email still needs Email Notifications ON)

## Nest wiring

`NotificationsService` calls the edge function first, then falls back to local DB + websocket toast if the function is unreachable.

Triggered automatically on:

- user register → welcome
- campaign create → system popup
- funding confirmed → funding alert to creator
- campaign update posted → campaign_update to backers
