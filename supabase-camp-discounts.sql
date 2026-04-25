-- Migration: Sevadaar discount + promo code support on camp_applications.
-- Run in Supabase SQL Editor after the base table exists.

ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS is_sevadaar BOOLEAN DEFAULT false;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS sevadaar_verified BOOLEAN DEFAULT false;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS discount_source TEXT; -- 'sevadaar' | 'code' | 'sevadaar+code' | null
ALTER TABLE camp_applications ADD COLUMN IF NOT EXISTS final_amount_pence INTEGER;

CREATE INDEX IF NOT EXISTS idx_camp_apps_is_sevadaar
  ON camp_applications (is_sevadaar)
  WHERE is_sevadaar = true;
