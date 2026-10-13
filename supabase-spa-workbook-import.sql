-- Atomic, staff-authorised workbook import. Re-imports upsert immutable keys;
-- no player or result is deleted, and existing names/country choices survive.
begin;
create or replace function public.import_spa_workbook(payload jsonb, tournament_mapping jsonb)
returns jsonb language plpgsql security invoker set search_path = ''
as $import_spa_workbook$
declare inserted_players int; saved_results int;
begin
 if not coalesce(spa_private.can_manage_spa(),false) then raise exception 'Only authorised SPA organisers may import workbooks';end if;
 if jsonb_typeof(payload->'players')<>'array' or jsonb_typeof(payload->'results')<>'array'
 or jsonb_typeof(tournament_mapping)<>'object' then raise exception 'Invalid import payload';end if;
 if jsonb_array_length(payload->'players') not between 1 and 2000
 or jsonb_array_length(payload->'results') not between 1 and 4000 then raise exception 'Import exceeds player/result limits';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('spa_workbook_import'));
 create temporary table _import_players on commit drop as
 select * from jsonb_to_recordset(payload->'players') as p(canonical_player_id text,display_name text,country_code text);
 create temporary table _import_results on commit drop as
 select r.*, (tournament_mapping->>r.source_tournament_id)::uuid tournament_id,
 case finishing_position when 'winner' then 1000 when 'runner_up' then 700 when 'third' then 500
 when 'fourth' then 400 when 'quarterfinal' then 250 when 'round_of_16' then 150
 when 'group_3rd' then 100 when 'group_4th' then 50 when 'group_5th' then 25 else null end points_awarded
 from jsonb_to_recordset(payload->'results') as r(result_id text,canonical_player_id text,
 partner_canonical_id text,source_tournament_id text,finishing_position text,matches_played int,
 match_wins int,group_points_won int,group_points_possible int,notes text);
 if exists(select 1 from pg_temp._import_players where canonical_player_id is null or canonical_player_id !~ '^[A-Za-z0-9:_-]{1,100}$'
 or display_name is null or length(trim(display_name)) not between 1 and 150
 or (country_code is not null and country_code !~ '^[A-Z]{2}$'))
 or (select count(*)<>count(distinct canonical_player_id) from pg_temp._import_players)
 then raise exception 'Invalid or duplicate player identities';end if;
 if exists(select 1 from pg_temp._import_results r left join public.padel_tournaments t on t.id=r.tournament_id
 where t.id is null or not(r.finishing_position=any(t.applicable_stages)) or r.points_awarded is null
 or r.result_id is null or r.result_id !~ '^[A-Za-z0-9:_-]{1,100}$'
 or r.canonical_player_id is null or r.partner_canonical_id is null or r.canonical_player_id=r.partner_canonical_id
 or not exists(select 1 from pg_temp._import_players p where p.canonical_player_id=r.canonical_player_id)
 or not exists(select 1 from pg_temp._import_players p where p.canonical_player_id=r.partner_canonical_id)
 or r.matches_played is null or r.match_wins is null or r.group_points_won is null or r.group_points_possible is null
 or r.match_wins<0 or r.match_wins>r.matches_played or r.matches_played>1000000
 or r.group_points_won<0 or r.group_points_won>r.group_points_possible or r.group_points_possible>1000000
 or r.notes is null or length(r.notes)>2000)
 then raise exception 'Invalid event, finish, player, or performance data';end if;
 if (select count(*)<>count(distinct result_id) from pg_temp._import_results)
 or exists(select 1 from pg_temp._import_results group by tournament_id,canonical_player_id having count(*)>1)
 or exists(select 1 from pg_temp._import_results group by tournament_id having count(distinct source_tournament_id)>1)
 then raise exception 'Duplicate results or event mappings';end if;
 if exists(select 1 from pg_temp._import_results r where not exists(select 1 from pg_temp._import_results partner
 where partner.tournament_id=r.tournament_id and partner.canonical_player_id=r.partner_canonical_id
 and partner.partner_canonical_id=r.canonical_player_id and partner.finishing_position=r.finishing_position
 and partner.match_wins=r.match_wins and partner.matches_played=r.matches_played
 and partner.group_points_won=r.group_points_won and partner.group_points_possible=r.group_points_possible))
 then raise exception 'Partner results must agree';end if;
 if exists(select 1 from pg_temp._import_results r join public.padel_tournament_results saved on saved.source_result_id=r.result_id
 join public.padel_players p on p.id=saved.player_id
 where saved.tournament_id<>r.tournament_id or p.canonical_player_id is distinct from r.canonical_player_id)
 then raise exception 'A source result key already belongs to a different event or identity';end if;
 if exists(select 1 from pg_temp._import_results r join public.padel_players p on p.canonical_player_id=r.canonical_player_id join public.padel_tournament_results saved on saved.player_id=p.id and saved.tournament_id=r.tournament_id where saved.source_result_id is not null and saved.source_result_id<>r.result_id) then raise exception 'A player event already has a different immutable result key';end if;
 if exists(select 1 from pg_temp._import_players r join public.padel_players p using(canonical_player_id) where not p.is_active)
 then raise exception 'An imported player is archived. Review that identity before importing';end if;
 insert into public.padel_players(canonical_player_id,first_name,last_name,country_code,is_active)
 select canonical_player_id,split_part(trim(display_name),' ',1),
 trim(substr(trim(display_name),length(split_part(trim(display_name),' ',1))+1)),coalesce(country_code,'GB'),true
 from pg_temp._import_players on conflict(canonical_player_id) do nothing;
 get diagnostics inserted_players=row_count;
 insert into public.padel_tournament_results(tournament_id,player_id,partner_player_id,source_result_id,
 finishing_position,points_awarded,matches_played,match_wins,group_points_won,group_points_possible,notes,updated_at)
 select r.tournament_id,p.id,partner.id,r.result_id,r.finishing_position,r.points_awarded,
 r.matches_played,r.match_wins,r.group_points_won,r.group_points_possible,r.notes,now()
 from pg_temp._import_results r join public.padel_players p on p.canonical_player_id=r.canonical_player_id
 join public.padel_players partner on partner.canonical_player_id=r.partner_canonical_id
 on conflict(tournament_id,player_id) do update set partner_player_id=excluded.partner_player_id,
 source_result_id=excluded.source_result_id,finishing_position=excluded.finishing_position,
 points_awarded=excluded.points_awarded,matches_played=excluded.matches_played,match_wins=excluded.match_wins,
 group_points_won=excluded.group_points_won,group_points_possible=excluded.group_points_possible,
 notes=excluded.notes,updated_at=now();
 get diagnostics saved_results=row_count;
 update public.padel_players p set total_points=coalesce((select sum(r.points_awarded)::int
 from public.padel_tournament_results r where r.player_id=p.id),0),updated_at=now() where p.is_active;
 -- Rebuild chronological snapshots for every event with results, so older
 -- imports also update later cumulative movement correctly.
 insert into public.padel_ranking_snapshots(tournament_id,player_id,rank,total_points)
 select tournament_id,player_id,dense_rank() over(partition by tournament_id order by total_points desc,
 titles desc,runners desc,wins desc,coalesce(wins::numeric/nullif(matches,0),0) desc,
 coalesce(scored::numeric/nullif(possible,0),0) desc)::int,total_points
 from (select cutoff.id tournament_id,p.id player_id,sum(r.points_awarded)::int total_points,
 count(*) filter(where r.finishing_position='winner') titles,
 count(*) filter(where r.finishing_position='runner_up') runners,
 sum(r.match_wins) wins,sum(r.matches_played) matches,sum(r.group_points_won) scored,sum(r.group_points_possible) possible
 from public.padel_tournaments cutoff join public.padel_tournaments event on event.event_date<=cutoff.event_date
 join public.padel_tournament_results r on r.tournament_id=event.id
 join public.padel_players p on p.id=r.player_id and p.is_active
 where exists(select 1 from public.padel_tournament_results x where x.tournament_id=cutoff.id)
 group by cutoff.id,p.id) totals
 on conflict(tournament_id,player_id) do update set rank=excluded.rank,total_points=excluded.total_points;
 insert into public.padel_activity_log(admin_id,action,metadata)
 values(auth.uid(),'workbook_import',jsonb_build_object('players_added',inserted_players,
 'results_saved',saved_results,'tournament_mapping',tournament_mapping));
 drop table pg_temp._import_players,pg_temp._import_results;
 return jsonb_build_object('players_added',inserted_players,'results_saved',saved_results);
end;
$import_spa_workbook$;
revoke all on function public.import_spa_workbook(jsonb,jsonb) from public,anon;
grant execute on function public.import_spa_workbook(jsonb,jsonb) to authenticated;
commit;
