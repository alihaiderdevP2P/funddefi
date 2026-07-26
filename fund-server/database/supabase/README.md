# Edge functions (mirror)

Canonical deploy path used by the CLI:

```
fund-server/supabase/functions/
```

This folder mirrors the same sources. Prefer editing and deploying from `fund-server/supabase/`.

```bash
cd fund-server
npx supabase functions deploy campaign-digest --project-ref nkwvphdtvfcwdeqocupj
npx supabase functions deploy notifications --project-ref nkwvphdtvfcwdeqocupj
```
