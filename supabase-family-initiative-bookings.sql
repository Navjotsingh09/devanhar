create table if not exists public.family_initiative_bookings (
  id uuid primary key default gen_random_uuid(),
  event_name text not null default 'Family Fun Day - Summer Extravaganza',
  event_date date not null default '2026-08-31',
  contact_name text not null,
  email text not null,
  phone text not null,
  children_attending jsonb not null,
  adults_attending jsonb not null,
  travel_option text not null check (travel_option in ('door', 'transport')),
  pickup_details text,
  medical_allergy_information text,
  estimated_total_pence integer not null check (estimated_total_pence >= 0),
  consent_privacy boolean not null default false,
  page_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.family_initiative_bookings enable row level security;
revoke all on public.family_initiative_bookings from anon, authenticated;
