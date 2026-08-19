-- Add the explicit registration declarations required for camp applications.
ALTER TABLE camp_applications
  ADD COLUMN IF NOT EXISTS consent_authority BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_health BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_photography BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT false;
