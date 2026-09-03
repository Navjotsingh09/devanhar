-- Sikh Padel Association: individual player leaderboard & ranking system
-- Run AFTER supabase-schema.sql (and after the existing supabase-padel-*.sql migrations).
--
-- Fixed points per finishing position (mirrored in lib/padel-ranking.ts -- keep in sync):
--   winner=1000, runner_up=700, third=500, fourth=400, quarterfinal=250,
--   round_of_16=150, group_3rd=100, group_4th=50, group_5th=25
--
-- Manual step (cannot be scripted here): create a PUBLIC Supabase Storage bucket
-- named "padel-player-photos" in the dashboard (Storage -> New bucket -> Public bucket ON).

create table if not exists padel_players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  photo_url text,
  gender text,
  city_country text,
  is_active boolean not null default true,
  total_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists padel_tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  category text,
  applicable_stages text[] not null default array[
    'winner','runner_up','third','fourth','quarterfinal','round_of_16','group_3rd','group_4th','group_5th'
  ],
  status text not null default 'draft' check (status in ('draft', 'finalized')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists padel_tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references padel_tournaments(id) on delete cascade,
  player_id uuid not null references padel_players(id) on delete cascade,
  partner_player_id uuid references padel_players(id) on delete set null,
  finishing_position text not null check (finishing_position in (
    'winner','runner_up','third','fourth','quarterfinal','round_of_16','group_3rd','group_4th','group_5th'
  )),
  points_awarded integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, player_id)
);

create table if not exists padel_ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references padel_tournaments(id) on delete cascade,
  player_id uuid not null references padel_players(id) on delete cascade,
  rank integer not null,
  total_points integer not null,
  created_at timestamptz not null default now(),
  unique (tournament_id, player_id)
);

create index if not exists idx_padel_tournament_results_player on padel_tournament_results(player_id);
create index if not exists idx_padel_tournament_results_tournament on padel_tournament_results(tournament_id);
create index if not exists idx_padel_ranking_snapshots_player on padel_ranking_snapshots(player_id);

alter table padel_players enable row level security;
alter table padel_tournaments enable row level security;
alter table padel_tournament_results enable row level security;
alter table padel_ranking_snapshots enable row level security;

create policy "padel_players_public_read" on padel_players for select using (true);
create policy "padel_tournaments_public_read" on padel_tournaments for select using (true);
create policy "padel_tournament_results_public_read" on padel_tournament_results for select using (true);
create policy "padel_ranking_snapshots_public_read" on padel_ranking_snapshots for select using (true);

create policy "padel_players_staff_write" on padel_players for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "padel_tournaments_staff_write" on padel_tournaments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "padel_tournament_results_staff_write" on padel_tournament_results for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "padel_ranking_snapshots_staff_write" on padel_ranking_snapshots for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
