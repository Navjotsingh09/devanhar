-- Migration: Camp ID verification & duplicate phone detection
-- Run this in Supabase SQL Editor AFTER the base camp_applications table exists

-- 1. Add document type column (passport, driving-licence, provisional, school-id, birth-certificate, parent-guardian-id)
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS id_document_type TEXT;

-- 2. Add consent_whatsapp if missing (was in form but may be absent from original schema)
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS consent_whatsapp BOOLEAN DEFAULT false;

-- 4. Add allergies columns if missing
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS carries_epipen BOOLEAN;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS other_allergy TEXT;

-- 5. Add own_transport_type if missing
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS own_transport_type TEXT;

-- 6. Add payment_support_details if missing
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS payment_support_details TEXT;

-- 7. Add normalized phone column for duplicate detection
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS phone_normalized TEXT;

-- 8. Backfill normalized phone from existing rows (digits + leading +)
UPDATE camp_applications
SET phone_normalized = regexp_replace(phone, '[^0-9+]', '', 'g')
WHERE phone_normalized IS NULL AND phone IS NOT NULL;

-- 9. Create composite unique index on normalized phone + initiative for duplicate detection
-- Using a unique index so the same phone can apply to different initiatives
CREATE UNIQUE INDEX IF NOT EXISTS idx_camp_apps_phone_initiative
  ON camp_applications (phone_normalized, initiative_id)
  WHERE phone_normalized IS NOT NULL AND status NOT IN ('rejected', 'cancelled');
