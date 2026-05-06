-- Wolf Run Runners Table
-- Run this in the Supabase SQL editor to create the wolfrun_runners table.

create table if not exists wolfrun_runners (
  id                      uuid primary key default gen_random_uuid(),
  first_name              text not null,
  last_name               text not null,
  email                   text not null unique,
  phone                   text not null,
  age                     integer not null check (age >= 16 and age <= 99),
  city                    text not null,
  pack                    text not null check (pack in ('singhs', 'kaurs')),
  agree_whatsapp_group    boolean not null default false,
  status                  text not null default 'confirmed' check (status in ('confirmed', 'failed')),
  stripe_session_id       text unique,
  stripe_payment_intent_id text,
  created_at              timestamptz not null default now()
);

-- Enable Row Level Security
alter table wolfrun_runners enable row level security;

-- Service role has full access (used by API routes and webhook)
create policy "Service role full access"
  on wolfrun_runners
  for all
  to service_role
  using (true)
  with check (true);

-- Index for pack filtering (used by dashboard)
create index if not exists wolfrun_runners_pack_idx on wolfrun_runners (pack);

-- Index for Stripe session lookup (used by webhook idempotency)
create index if not exists wolfrun_runners_stripe_session_idx on wolfrun_runners (stripe_session_id);
