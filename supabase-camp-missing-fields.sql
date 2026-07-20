-- Migration: Add columns that the camp-application flow writes and the
-- resume-payment route reads, but that are missing from the original schema.
-- Run once in the Supabase SQL Editor.

-- Stripe Checkout session persistence (needed for resume-payment link reuse)
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_url        TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_expires_at TIMESTAMPTZ;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_amount_pence INTEGER;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS payment_reminder_sent_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_camp_apps_stripe_session
  ON camp_applications (stripe_checkout_session_id);

-- Monthly donation opt-in (captured during application, surfaced in Stripe checkout)
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS monthly_donation_opted   BOOLEAN DEFAULT false;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS monthly_donation_amount  INTEGER DEFAULT 0;
