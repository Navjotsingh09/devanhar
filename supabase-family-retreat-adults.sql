-- Migration: Add adults_attending to family_retreat_bookings
-- Run in Supabase SQL Editor

ALTER TABLE family_retreat_bookings
  ADD COLUMN IF NOT EXISTS adults_attending jsonb DEFAULT '[]'::jsonb;
