-- Public storage bucket for all images/documents (campaigns, blog, resumes, etc.)
-- Run: npm run db:migrate:storage
--
-- Bucket is public so getPublicUrl works without a broad SELECT listing policy.
-- Uploads go through NestJS with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-images',
  'campaign-images',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove broad policies: listing + public write are unnecessary and expose the bucket.
DROP POLICY IF EXISTS "Public read campaign-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload campaign-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update campaign-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete campaign-images" ON storage.objects;
