-- Fix: duplicate-phone check was blocking players who only had a pending
-- (unpaid/awaiting admin review) registration, not an actually confirmed one.
-- Run this in the Supabase SQL Editor.

DROP INDEX IF EXISTS uniq_padel_captain_phone_active;

-- Only a genuinely CONFIRMED (approved) registration should block a resubmission
-- with the same phone number. Pending/awaiting-payment entries no longer block.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_padel_captain_phone_approved
  ON padel_registrations (captain_phone_normalized, initiative_id)
  WHERE status = 'approved'
    AND captain_phone_normalized IS NOT NULL;
