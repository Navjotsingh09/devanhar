-- NowDonate payment tracking for Roots Residential bookings
-- Run in Supabase SQL editor

-- Add NowDonate payment columns to roots_bookings
alter table public.roots_bookings
  add column if not exists nowdonate_payment_url text,
  add column if not exists nowdonate_reference_id text;

-- Indexes for payment lookups
create index if not exists idx_roots_bookings_payment_status on roots_bookings (payment_status);
create index if not exists idx_roots_bookings_nowdonate_reference on roots_bookings (nowdonate_reference_id);
