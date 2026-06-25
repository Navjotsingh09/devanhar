-- Migration: Persist Stripe Checkout Session details on camp_applications so a
-- "resume payment" link can redirect users back to their original session (or
-- mint a fresh one if the original expired). Run in Supabase SQL Editor.

ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_expires_at TIMESTAMPTZ;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS stripe_checkout_amount_pence INTEGER;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS payment_reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_camp_apps_stripe_checkout_session_id
  ON camp_applications (stripe_checkout_session_id);
