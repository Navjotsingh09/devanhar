-- Donation records table
create type donation_source as enum ('justgiving', 'direct', 'bank_transfer', 'other');

create table if not exists public.donation_records (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  donor_email text,
  amount numeric(10,2) not null,
  currency text not null default 'GBP',
  source donation_source not null default 'other',
  reference text,
  notes text,
  donation_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.donation_records enable row level security;

-- All authenticated admins can CRUD
create policy "admins_read_donations" on public.donation_records
  for select using (auth.uid() is not null);

create policy "admins_insert_donations" on public.donation_records
  for insert with check (auth.uid() is not null);

create policy "admins_update_donations" on public.donation_records
  for update using (auth.uid() is not null);

create policy "admins_delete_donations" on public.donation_records
  for delete using (auth.uid() is not null);
