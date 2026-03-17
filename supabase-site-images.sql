-- Site Images table and storage
-- Already executed in Supabase Dashboard

CREATE TABLE IF NOT EXISTS site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  category TEXT,
  label TEXT,
  alt_text TEXT,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site images"
  ON site_images FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert site images"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site images"
  ON site_images FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete site images"
  ON site_images FOR DELETE
  TO authenticated
  USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can upload site-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can update site-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can delete site-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images');
