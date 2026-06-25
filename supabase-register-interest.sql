create extension if not exists "pgcrypto";

create table if not exists public.register_interest (
  id uuid primary key default gen_random_uuid(),
  camp text not null,
  name text not null,
  email text not null,
  country text,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists register_interest_camp_email_key
  on public.register_interest (camp, lower(email));

create index if not exists register_interest_created_at_idx
  on public.register_interest (created_at desc);

alter table public.register_interest
  drop constraint if exists register_interest_camp_check;
alter table public.register_interest
  add constraint register_interest_camp_check
  check (camp in ('singhs-camp-eu', 'kaurs-camp-eu'));

alter table public.register_interest enable row level security;

drop policy if exists anon_insert_register_interest on public.register_interest;
drop policy if exists auth_all_register_interest on public.register_interest;

create policy anon_insert_register_interest
  on public.register_interest
  for insert
  to anon
  with check (camp in ('singhs-camp-eu', 'kaurs-camp-eu'));

create policy auth_all_register_interest
  on public.register_interest
  for all
  to authenticated
  using (true)
  with check (true);
