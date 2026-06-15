-- Sikh Padel Association — additional player fields
-- Run this in the Supabase SQL Editor (safe to re-run; uses IF NOT EXISTS).
--
-- Adds: gender + Playtomic ranking for BOTH players, and brings the partner
-- (player 2) closer to parity with the captain by capturing the partner's
-- phone, Playtomic ID and occupation.

ALTER TABLE padel_registrations
  ADD COLUMN IF NOT EXISTS captain_gender            TEXT,
  ADD COLUMN IF NOT EXISTS captain_playtomic_ranking TEXT,
  ADD COLUMN IF NOT EXISTS player2_phone             TEXT,
  ADD COLUMN IF NOT EXISTS player2_playtomic_id      TEXT,
  ADD COLUMN IF NOT EXISTS player2_occupation        TEXT,
  ADD COLUMN IF NOT EXISTS player2_gender            TEXT,
  ADD COLUMN IF NOT EXISTS player2_playtomic_ranking TEXT;
