-- Sikh Padel Association — player registrations table
-- Run this in the Supabase SQL Editor.
--
-- Padel is played in pairs. The primary player completes full details and
-- provides photo ID; the partner provides name + date of birth only.
-- Payments are processed via Stripe with capture_method = 'manual' (the funds
-- are AUTHORISED/held, not captured, until an admin approves the team — the
-- same hold-and-capture flow used by camp_applications).
-- Entry fee: £50 per player → £100 per team of two.

CREATE TABLE IF NOT EXISTS padel_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID REFERENCES initiatives(id),

  event_name TEXT,

  -- Primary player (captain) — full details + photo ID
  captain_first_name TEXT NOT NULL,
  captain_last_name  TEXT NOT NULL,
  captain_date_of_birth DATE,
  captain_email      TEXT NOT NULL,
  captain_phone      TEXT NOT NULL,
  captain_phone_normalized TEXT,
  city_country       TEXT,
  playtomic_id       TEXT,
  occupation         TEXT,
  id_document_type   TEXT,
  id_document_url    TEXT,

  -- Partner (player 2) — name + date of birth only
  player2_first_name TEXT NOT NULL,
  player2_last_name  TEXT NOT NULL,
  player2_date_of_birth DATE,

  -- Contact consent
  consent_email    BOOLEAN DEFAULT false,
  consent_phone    BOOLEAN DEFAULT false,
  consent_sms      BOOLEAN DEFAULT false,
  consent_whatsapp BOOLEAN DEFAULT false,

  -- Payment
  entry_fee_pence  INTEGER,
  final_amount_pence INTEGER,

  -- Stripe state (mirrors camp_applications)
  stripe_payment_intent_id    TEXT,
  stripe_pi_status            TEXT,
  stripe_pi_synced_at         TIMESTAMPTZ,
  stripe_customer_id          TEXT,
  stripe_checkout_session_id  TEXT,
  stripe_checkout_url         TEXT,
  stripe_checkout_expires_at  TIMESTAMPTZ,
  stripe_checkout_amount_pence INTEGER,
  stripe_review_state         TEXT,
  payment_reminder_sent_at    TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  internal_notes TEXT,
  reviewed_by UUID,

  -- Marketing / attribution
  page_url TEXT,
  source TEXT,
  medium TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE padel_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_padel" ON padel_registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_padel" ON padel_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_padel_registrations_email ON padel_registrations(captain_email);
CREATE INDEX IF NOT EXISTS idx_padel_registrations_status ON padel_registrations(status);
CREATE INDEX IF NOT EXISTS idx_padel_registrations_initiative ON padel_registrations(initiative_id);

-- Prevent the same primary player phone registering twice for an active team
CREATE UNIQUE INDEX IF NOT EXISTS uniq_padel_captain_phone_active
  ON padel_registrations (captain_phone_normalized, initiative_id)
  WHERE status NOT IN ('rejected', 'cancelled', 'declined')
    AND captain_phone_normalized IS NOT NULL;
