-- Migration: Vacancies extension (careers page + applicant messaging)
-- Run in Supabase SQL Editor AFTER supabase-schema.sql

-- 1. Extend vacancies with publishing metadata
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS salary_range TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS employment_basis TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS how_to_apply TEXT;

-- 2. Extend applications
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 3. Messages between staff and applicants (outbound only in v1)
CREATE TABLE IF NOT EXISTS vacancy_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES vacancy_applications(id) ON DELETE CASCADE,
  admin_id UUID,
  direction TEXT NOT NULL DEFAULT 'outbound',
  subject TEXT,
  body TEXT NOT NULL,
  to_email TEXT,
  email_sent BOOLEAN DEFAULT false,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacancy_messages_app ON vacancy_messages(application_id, created_at DESC);

ALTER TABLE vacancy_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_vacancy_messages" ON vacancy_messages;
CREATE POLICY "auth_all_vacancy_messages" ON vacancy_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Storage bucket for CVs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vacancy-cvs', 'vacancy-cvs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "staff_read_cvs" ON storage.objects;
CREATE POLICY "staff_read_cvs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vacancy-cvs');
