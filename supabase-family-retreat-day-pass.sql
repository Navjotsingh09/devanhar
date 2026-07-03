-- Migration: Create family_retreat_day_pass_bookings table
-- Run this in the Supabase SQL editor before deploying

CREATE TABLE IF NOT EXISTS family_retreat_day_pass_bookings (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                      timestamptz NOT NULL DEFAULT now(),

  -- Lead contact
  first_name                      text NOT NULL,
  last_name                       text NOT NULL,
  email                           text NOT NULL,
  phone                           text NOT NULL,
  city                            text NOT NULL,
  postcode                        text NOT NULL,
  country                         text NOT NULL DEFAULT 'United Kingdom',

  -- Day pass specifics
  selected_date                   date NOT NULL,
  num_adults                      integer NOT NULL DEFAULT 1 CHECK (num_adults >= 1),
  children_attending              jsonb NOT NULL DEFAULT '[]',

  -- Extra info
  dietary_requirements            text,
  medical_requirements            text,
  emergency_contact_name          text NOT NULL,
  emergency_contact_relationship  text NOT NULL,
  emergency_contact_phone         text NOT NULL,
  heard_about_retreat             text,
  additional_notes                text,
  consent_email                   boolean NOT NULL DEFAULT false,
  consent_whatsapp                boolean NOT NULL DEFAULT false,

  -- Tracking
  page_url                        text,
  source                          text,
  medium                          text,

  -- Payment
  amount_due                      integer,          -- pence
  amount_paid                     integer,          -- pence
  payment_status                  text NOT NULL DEFAULT 'unpaid',
  paid_at                         timestamptz,
  stripe_payment_link             text,
  stripe_payment_link_id          text,
  stripe_checkout_session_id      text,

  -- Admin
  internal_notes                  text
);

-- Enable Row Level Security
ALTER TABLE family_retreat_day_pass_bookings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by server-side API)
CREATE POLICY "service_role_all" ON family_retreat_day_pass_bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
