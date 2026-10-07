-- SPA leaderboard v2
-- Spreadsheet source of truth:
-- Tournament results -> player results -> aggregate stats -> six-criterion dense ranking.
-- This migration is additive and keeps the existing tournament/result tables in place.

alter table public.padel_players
  add column if not exists canonical_player_key text,
  add column if not exists display_name text,
  add column if not exists identity_status text;

create unique index if not exists padel_players_canonical_player_key_key
  on public.padel_players (canonical_player_key)
  where canonical_player_key is not null;

alter table public.padel_tournament_results
  alter column tournament_id drop not null,
  alter column finishing_position drop not null,
  alter column points_awarded drop not null;

alter table public.padel_tournament_results
  add column if not exists source_result_id text,
  add column if not exists source_tournament_code text,
  add column if not exists source_player_name text,
  add column if not exists team_code text,
  add column if not exists group_code text,
  add column if not exists group_position integer,
  add column if not exists review_note text,
  add column if not exists match_wins integer not null default 0,
  add column if not exists matches_played integer not null default 0,
  add column if not exists group_point_difference integer,
  add column if not exists group_total_points integer,
  add column if not exists group_points_scored integer not null default 0,
  add column if not exists group_points_conceded integer not null default 0;

create unique index if not exists padel_tournament_results_source_result_id_key
  on public.padel_tournament_results (source_result_id)
  where source_result_id is not null;

create table if not exists public.padel_player_aliases (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.padel_players(id) on delete cascade,
  alias_name text not null,
  alias_normalized text not null,
  created_at timestamptz not null default now(),
  unique (alias_normalized, player_id)
);

create index if not exists padel_player_aliases_normalized_idx
  on public.padel_player_aliases(alias_normalized);

alter table public.padel_player_aliases enable row level security;

drop policy if exists "padel_player_aliases_public_read" on public.padel_player_aliases;
create policy "padel_player_aliases_public_read"
  on public.padel_player_aliases for select using (true);

drop policy if exists "padel_player_aliases_staff_write" on public.padel_player_aliases;
create policy "padel_player_aliases_staff_write"
  on public.padel_player_aliases for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create or replace view public.padel_leaderboard_v2 as
with player_totals as (
  select
    p.id,
    p.canonical_player_key,
    coalesce(nullif(p.display_name, ''), trim(concat_ws(' ', p.first_name, p.last_name))) as display_name,
    p.photo_url,
    p.city_country,
    p.is_active,
    coalesce(sum(r.points_awarded), 0)::integer as ranking_points,
    count(*) filter (where r.finishing_position = 'winner')::integer as titles,
    count(*) filter (where r.finishing_position = 'runner_up')::integer as runner_up_finishes,
    coalesce(sum(r.match_wins), 0)::integer as match_wins,
    count(r.id)::integer as appearances,
    count(*) filter (where r.finishing_position is null or r.points_awarded is null)::integer as pending_finishes,
    coalesce(sum(r.matches_played), 0)::integer as matches_played,
    case
      when coalesce(sum(r.matches_played), 0) > 0
      then coalesce(sum(r.match_wins), 0)::numeric / sum(r.matches_played)::numeric
      else 0::numeric
    end as win_percentage,
    coalesce(sum(r.group_points_scored), 0)::integer as group_points_scored,
    coalesce(sum(r.group_points_conceded), 0)::integer as group_points_conceded,
    case
      when coalesce(sum(r.group_points_scored), 0) + coalesce(sum(r.group_points_conceded), 0) > 0
      then coalesce(sum(r.group_points_scored), 0)::numeric
        / (coalesce(sum(r.group_points_scored), 0) + coalesce(sum(r.group_points_conceded), 0))::numeric
      else 0::numeric
    end as group_points_won_pct
  from public.padel_players p
  join public.padel_tournament_results r
    on r.player_id = p.id
   and r.source_result_id is not null
  where p.is_active = true
  group by p.id
),
ranked as (
  select
    pt.*,
    dense_rank() over (
      order by
        pt.ranking_points desc,
        pt.titles desc,
        pt.runner_up_finishes desc,
        pt.match_wins desc,
        pt.win_percentage desc,
        pt.group_points_won_pct desc
    )::integer as rank
  from player_totals pt
)
select *
from ranked
order by
  rank asc,
  ranking_points desc,
  titles desc,
  runner_up_finishes desc,
  match_wins desc,
  win_percentage desc,
  group_points_won_pct desc,
  display_name asc;

comment on view public.padel_leaderboard_v2 is
  'SPA leaderboard source of truth. Dense rank by ranking points, titles, runner-up finishes, match wins, weighted win percentage, and aggregate group points won percentage.';

grant select on public.padel_leaderboard_v2 to anon, authenticated;
