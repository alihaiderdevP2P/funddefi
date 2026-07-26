-- Public storage bucket for all images/documents (campaigns, blog, resumes, etc.)
-- Run: npm run db:migrate:storage

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

-- Public read (needed for getPublicUrl)
DROP POLICY IF EXISTS "Public read campaign-images" ON storage.objects;
CREATE POLICY "Public read campaign-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campaign-images');

-- Authenticated / anon upload (service role bypasses RLS; these cover client uploads if used)
DROP POLICY IF EXISTS "Anyone can upload campaign-images" ON storage.objects;
CREATE POLICY "Anyone can upload campaign-images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Anyone can update campaign-images" ON storage.objects;
CREATE POLICY "Anyone can update campaign-images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'campaign-images')
  WITH CHECK (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Anyone can delete campaign-images" ON storage.objects;
CREATE POLICY "Anyone can delete campaign-images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'campaign-images');
