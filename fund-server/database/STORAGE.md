# Image storage (Supabase Storage)

Campaign and reward images are **not** stored in Postgres. The database only stores URLs:

| Table      | Column       | Example value                                      |
|------------|--------------|----------------------------------------------------|
| `campaigns`| `image_url`  | `https://…supabase.co/storage/v1/object/public/…` |
| `rewards`  | `image_url`  | same                                               |
| `users`    | `avatar`     | same                                               |

## Bucket

- **Name:** `campaign-images` (set via `SUPABASE_STORAGE_BUCKET`)
- **Public:** yes (read via public URL)
- **Paths:** `campaigns/<uuid>.jpg` (uploaded by `POST /api/upload/image`)

## Setup

```bash
npm run storage:setup    # creates bucket (once)
npm run db:migrate:supabase   # creates Postgres tables (once)
```

Or create the bucket manually in **Supabase Dashboard → Storage → New bucket** with the same name and **Public bucket** enabled.

## Upload flow

1. User picks an image on **Create campaign**
2. Frontend calls `POST /api/upload/image` (multipart `file`)
3. Nest uploads to Supabase Storage using the service role key
4. Public URL is saved in `campaigns.image_url` when the campaign is created
