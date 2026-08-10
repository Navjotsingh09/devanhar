-- Archive support for Roots Residential bookings
-- Run in Supabase SQL editor

alter table public.roots_bookings
  add column if not exists archived boolean not null default false,
  add column if not exists archived_at timestamptz;

create index if not exists idx_roots_bookings_archived on roots_bookings (archived);
