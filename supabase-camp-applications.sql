-- Camp Applications table for Singhs Camp (and future camps)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS camp_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID REFERENCES initiatives(id),

  -- Personal details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_at_camp INTEGER,
  phone TEXT NOT NULL,
  university TEXT,
  occupation TEXT,

  -- Address
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  address_line_3 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT NOT NULL,

  -- Emergency contact
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  under_18_consent BOOLEAN,

  -- Medical / dietary
  dietary_requirements TEXT,
  medical_requirements TEXT,

  -- ID upload path (stored in Supabase Storage)
  id_document_url TEXT,

  -- Travel
  travel_method TEXT,

  -- Payment
  requires_payment_support BOOLEAN DEFAULT false,

  -- Room
  room_preference TEXT,

  -- Additional questions
  heard_about_camp TEXT,
  first_residential_camp BOOLEAN,
  previous_camps TEXT,
  been_to_singhs_camp_before BOOLEAN,
  sikhi_knowledge_level TEXT,
  takeaway_from_camp TEXT,

  -- Contact consent
  consent_email BOOLEAN DEFAULT false,
  consent_phone BOOLEAN DEFAULT false,
  consent_sms BOOLEAN DEFAULT false,

  -- Stripe
  stripe_payment_intent_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  reviewed_by UUID,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE camp_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_camp_apps" ON camp_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_camp_apps" ON camp_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for quick lookups
CREATE INDEX idx_camp_applications_email ON camp_applications(email);
CREATE INDEX idx_camp_applications_status ON camp_applications(status);
CREATE INDEX idx_camp_applications_initiative ON camp_applications(initiative_id);
