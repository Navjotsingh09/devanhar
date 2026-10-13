-- SPA Ranking System V2
-- Adds player nationality + tournament performance metrics required by the
-- six-level ranking model. Safe additive migration for the existing padel data.

alter table public.padel_players
  add column if not exists country_code text not null default 'GB';

alter table public.padel_players
  drop constraint if exists padel_players_country_code_check;

alter table public.padel_players
  add constraint padel_players_country_code_check
  check (country_code ~ '^[A-Z]{2}$');

-- Existing SPA players are UK by default. These two confirmed international
-- players are Norwegian and remain data-driven in the UI.
update public.padel_players
set country_code = 'NO', updated_at = now()
where lower(trim(concat_ws(' ', first_name, last_name))) in (
  'gagandeep singh lally',
  'manpreet',
  'manpreet singh'
);

alter table public.padel_tournament_results
  add column if not exists matches_played integer not null default 0,
  add column if not exists match_wins integer not null default 0,
  add column if not exists group_points_won integer not null default 0,
  add column if not exists group_points_possible integer not null default 0;

alter table public.padel_tournament_results
  drop constraint if exists padel_tournament_results_matches_check,
  drop constraint if exists padel_tournament_results_group_points_check;

alter table public.padel_tournament_results
  add constraint padel_tournament_results_matches_check
  check (
    matches_played >= 0
    and match_wins >= 0
    and match_wins <= matches_played
  ),
  add constraint padel_tournament_results_group_points_check
  check (
    group_points_won >= 0
    and group_points_possible >= 0
    and group_points_won <= group_points_possible
  );

comment on column public.padel_players.country_code is
  'ISO 3166-1 alpha-2 nationality code used by the SPA leaderboard and player profile.';

comment on column public.padel_tournament_results.matches_played is
  'Number of matches played by the player in this tournament; used by SPA Ranking System V2.';

comment on column public.padel_tournament_results.match_wins is
  'Number of matches won by the player in this tournament; used by SPA Ranking System V2.';

comment on column public.padel_tournament_results.group_points_won is
  'Group-stage points won by the player in this tournament; numerator for the V2 tie-break.';

comment on column public.padel_tournament_results.group_points_possible is
  'Maximum available group-stage points for the player in this tournament; denominator for the V2 tie-break.';
