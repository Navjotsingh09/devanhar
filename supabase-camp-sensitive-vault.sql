-- Sensitive medical data vault for camp applications
-- Run this in the Supabase SQL Editor AFTER supabase-camp-applications.sql
--
-- Purpose: 30 days after a camp ends, the cron job at
--   /api/camp-applications/vault-sensitive
-- moves sensitive fields (medical, dietary, emergency contacts) out of the
-- active camp_applications table into this encrypted vault.
-- The active table fields are then nulled out so they no longer appear
-- in the admin dashboard or any query.

-- 1. New columns on camp_applications

-- Set this to the camp end date when creating/editing an initiative.
-- The vault cron checks: event_ends_at + 30 days <= now()
ALTER TABLE camp_applications
  ADD COLUMN IF NOT EXISTS event_ends_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sensitive_vaulted_at  TIMESTAMPTZ;

-- Index for the cron query (only scans un-vaulted rows with a past event date)
CREATE INDEX IF NOT EXISTS idx_camp_applications_vault_candidate
  ON camp_applications (event_ends_at)
  WHERE sensitive_vaulted_at IS NULL AND event_ends_at IS NOT NULL;

-- 2. Vault table

CREATE TABLE IF NOT EXISTS camp_applications_vault (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID        NOT NULL REFERENCES camp_applications(id) ON DELETE CASCADE,
  -- AES-256-GCM encrypted JSON blob, base64-encoded.
  -- Format: iv(16 bytes) || auth-tag(16 bytes) || ciphertext -- all concatenated then base64.
  -- Plaintext JSON keys: medical_requirements, dietary_requirements,
  --   emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
  encrypted_blob TEXT        NOT NULL,
  vaulted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id)
);

-- Only the service role may read or write vault rows.
ALTER TABLE camp_applications_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on vault"
  ON camp_applications_vault
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fast lookup by application when admin needs to retrieve vaulted data
CREATE INDEX IF NOT EXISTS idx_camp_vault_application_id
  ON camp_applications_vault (application_id);
