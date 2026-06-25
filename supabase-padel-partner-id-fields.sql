-- Migration: add partner photo ID columns to padel_registrations
-- Run in Supabase SQL Editor (idempotent)
ALTER TABLE padel_registrations
  ADD COLUMN IF NOT EXISTS player2_id_document_type TEXT,
  ADD COLUMN IF NOT EXISTS player2_id_document_url  TEXT;
