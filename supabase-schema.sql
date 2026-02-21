-- ============================================================
-- Devanhaar — Supabase Tables for Website Forms
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Contact form submissions (from /contact page)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Footer contact form submissions (from homepage footer)
CREATE TABLE IF NOT EXISTS footer_contact_submissions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Newsletter subscriptions (from footer)
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Donation intents (logged when user clicks donate)
CREATE TABLE IF NOT EXISTS donation_intents (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name    TEXT,
  last_name     TEXT,
  email         TEXT,
  message       TEXT,
  amount        NUMERIC(10,2) NOT NULL,
  frequency     TEXT NOT NULL CHECK (frequency IN ($$one-off$$, $$monthly$$)),
  gift_aid      BOOLEAN DEFAULT false,
  source        TEXT,
  page          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS) — allow anonymous inserts only
-- ============================================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE footer_contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON footer_contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE donation_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON donation_intents
  FOR INSERT TO anon WITH CHECK (true);
