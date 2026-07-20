-- Roots Residential Bookings
-- Run in Supabase SQL editor

create table if not exists roots_bookings (
  id uuid primary key default gen_random_uuid(),

  -- Camper
  camper_first_name  text not null,
  camper_last_name   text not null,
  camper_dob         date not null,
  camper_gender      text,

  -- Parent / guardian
  parent_first_name  text not null,
  parent_last_name   text not null,
  parent_relationship text not null,
  parent_email       text not null,
  parent_phone       text not null,

  -- Preferences
  accommodation_preference text,
  dietary_requirements     text,
  medical_info             text,

  -- Emergency contact
  emergency_name         text not null,
  emergency_relationship text not null,
  emergency_phone        text not null,

  -- Additional
  how_did_you_hear text,
  additional_info  text,

  -- Admin
  status  text not null default 'pending',
  notes   text,

  -- Payment
  amount_due             numeric,
  amount_paid            numeric,
  payment_status         text not null default 'unpaid',
  paid_at                timestamptz,
  stripe_payment_link    text,
  stripe_payment_link_id text,

  -- Metadata
  activity_log jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Updated_at trigger
create or replace function update_roots_bookings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists roots_bookings_updated_at on roots_bookings;
create trigger roots_bookings_updated_at
  before update on roots_bookings
  for each row execute function update_roots_bookings_updated_at();

-- RLS
alter table roots_bookings enable row level security;

-- Service role has full access (API routes use service key, bypasses RLS)
-- Anon: insert only (booking form submissions)
create policy "roots_bookings_anon_insert"
  on roots_bookings for insert
  to anon
  with check (true);

-- Index on status and created_at for dashboard queries
create index if not exists idx_roots_bookings_status on roots_bookings (status);
create index if not exists idx_roots_bookings_created_at on roots_bookings (created_at desc);
