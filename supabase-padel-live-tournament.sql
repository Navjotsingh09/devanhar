-- Sikh Padel Association live tournament publishing fields
-- Safe additive migration. Existing tournament/result data is preserved.

alter table public.padel_tournaments
  add column if not exists event_time text,
  add column if not exists venue text,
  add column if not exists address text,
  add column if not exists map_url text,
  add column if not exists fee_per_person numeric(10,2) not null default 50,
  add column if not exists public_description text,
  add column if not exists is_public boolean not null default false,
  add column if not exists registration_open boolean not null default true;

create index if not exists idx_padel_tournaments_public_date
  on public.padel_tournaments (is_public, event_date);

comment on column public.padel_tournaments.is_public is
  'When true, this tournament is shown as the current event on the public Sikh Padel Association page.';
