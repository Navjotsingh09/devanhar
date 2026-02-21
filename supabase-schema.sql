-- Devanhaar - Complete Supabase Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Initiatives
CREATE TABLE IF NOT EXISTS initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO initiatives (name, slug, sort_order) VALUES
  ('Singhs Camp', 'singhs-camp', 1),
  ('Kaurs Camp', 'kaurs-camp', 2),
  ('Kids Camp', 'kids-camp', 3),
  ('Sikhi Vidyala', 'sikhi-vidyala', 4),
  ('Kirtan Darbar', 'kirtan-darbar', 5),
  ('Singhs Camp EU', 'singhs-camp-eu', 6),
  ('Langar on Wheels', 'langar-on-wheels', 7),
  ('SPN', 'spn', 8),
  ('sWeb3', 'sweb3', 9),
  ('Sports', 'sports', 10),
  ('Forums', 'forums', 11),
  ('University Projects', 'university-projects', 12)
ON CONFLICT (slug) DO NOTHING;

-- 2. Form submissions (contact forms from website)
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  form_data JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT,
  assigned_to UUID,
  initiative_id UUID REFERENCES initiatives(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 3. Emergency requests
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_name TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  caller_email TEXT,
  location TEXT,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'new',
  resolution_notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 4. Vacancies
CREATE TABLE IF NOT EXISTS vacancies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vacancy_type TEXT NOT NULL DEFAULT 'volunteer',
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  requirements TEXT,
  initiative_id UUID REFERENCES initiatives(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 5. Vacancy applications
CREATE TABLE IF NOT EXISTS vacancy_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  vacancy_id UUID REFERENCES vacancies(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- 6. Donations (admin-recorded)
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  initiative_id UUID REFERENCES initiatives(id),
  is_recurring BOOLEAN DEFAULT false,
  payment_reference TEXT,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Donation intents (website visitor)
CREATE TABLE IF NOT EXISTS donation_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  message TEXT,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('one-off', 'monthly')),
  gift_aid BOOLEAN DEFAULT false,
  source TEXT,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Replies
CREATE TABLE IF NOT EXISTS replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES form_submissions(id),
  emergency_id UUID REFERENCES emergency_requests(id),
  admin_id UUID,
  subject TEXT,
  body TEXT NOT NULL,
  sent_to_email TEXT,
  email_sent BOOLEAN DEFAULT false,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Admin profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO admin_profiles (id, full_name, role)
SELECT id, email, 'admin' FROM auth.users
WHERE email = 'info@devanhaar.com'
ON CONFLICT (id) DO NOTHING;

-- RLS Policies

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_form" ON form_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_form" ON form_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_emergency" ON emergency_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_vacancies" ON vacancies FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_all_vacancies" ON vacancies FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE vacancy_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_apps" ON vacancy_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_apps" ON vacancy_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_donations" ON donations FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE donation_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_intents" ON donation_intents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_read_intents" ON donation_intents FOR SELECT TO authenticated USING (true);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_nl" ON newsletter_subscriptions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_nl" ON newsletter_subscriptions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_nl" ON newsletter_subscriptions FOR SELECT TO authenticated USING (true);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_activity" ON activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_replies" ON replies FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_profiles" ON admin_profiles FOR SELECT TO authenticated USING (true);

ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_initiatives" ON initiatives FOR SELECT TO anon USING (true);
CREATE POLICY "auth_all_initiatives" ON initiatives FOR ALL TO authenticated USING (true) WITH CHECK (true);
