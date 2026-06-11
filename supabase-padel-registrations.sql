-- Sikh Padel Association — team registrations table
-- Run this in the Supabase SQL Editor.
--
-- Padel is played in pairs, so each registration is a TEAM of two players.
-- Payments are processed via Stripe with capture_method = 'manual' (the funds
-- are AUTHORISED/held, not captured, until an admin approves the team — the
-- same hold-and-capture flow used by camp_applications).

CREATE TABLE IF NOT EXISTS padel_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID REFERENCES initiatives(id),

  -- Team
  team_name TEXT NOT NULL,
  skill_level TEXT,                       -- self-declared: beginner / intermediate / advanced
  event_name TEXT,                        -- e.g. "Sikh Padel Association — 4th July 2026"

  -- Captain (player 1) — primary contact
  captain_first_name TEXT NOT NULL,
  captain_last_name  TEXT NOT NULL,
  captain_email      TEXT NOT NULL,
  captain_phone      TEXT NOT NULL,
  captain_phone_normalized TEXT,          -- digits + "+" only, for duplicate detection

  -- Player 2
  player2_first_name TEXT NOT NULL,
  player2_last_name  TEXT NOT NULL,
  player2_email      TEXT,
  player2_phone      TEXT,

  -- Contact consent
  consent_email    BOOLEAN DEFAULT false,
  consent_phone    BOOLEAN DEFAULT false,
  consent_sms      BOOLEAN DEFAULT false,
  consent_whatsapp BOOLEAN DEFAULT false,

  -- Gift Aid
  gift_aid BOOLEAN DEFAULT false,

  -- Payment
  entry_fee_pence  INTEGER,               -- amount charged per team (in pence)
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

-- Prevent the same captain phone registering twice for an active team
CREATE UNIQUE INDEX IF NOT EXISTS uniq_padel_captain_phone_active
  ON padel_registrations (captain_phone_normalized, initiative_id)
  WHERE status NOT IN ('rejected', 'cancelled', 'declined')
    AND captain_phone_normalized IS NOT NULL;
