-- SPA Ranking System V2: staff-only write protection.
-- Review and apply via the Supabase SQL editor AFTER supabase-padel-leaderboard.sql
-- and supabase-padel-ranking-v2.sql. Do not apply without a database backup.
--
-- Existing schema permits ALL authenticated users to mutate the SPA tables.
-- This migration retains public read policies while restricting writes to
-- Devanhaar staff profiles. Front-end/server-action checks alone do not secure
-- the Supabase REST API.

create or replace function public.spa_is_authorized_staff()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.id = auth.uid()
      and p.role in ('staff', 'admin', 'super_admin')
  );
$$;

revoke all on function public.spa_is_authorized_staff() from public;
grant execute on function public.spa_is_authorized_staff() to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'padel_players',
    'padel_tournaments',
    'padel_tournament_results',
    'padel_ranking_snapshots'
  ] loop
    execute format('drop policy if exists %I on public.%I',
      table_name || '_staff_write', table_name);

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.spa_is_authorized_staff())',
      table_name || '_staff_insert_v2', table_name);

    execute format(
      'create policy %I on public.%I for update to authenticated using (public.spa_is_authorized_staff()) with check (public.spa_is_authorized_staff())',
      table_name || '_staff_update_v2', table_name);

    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.spa_is_authorized_staff())',
      table_name || '_staff_delete_v2', table_name);
  end loop;
end $$;
