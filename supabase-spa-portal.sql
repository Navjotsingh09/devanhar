-- Additive SPA portal setup. Public rankings and existing staff access remain available.
begin;

-- Preserve the established dashboard's access for existing verified staff.
-- Only already-confirmed accounts are included; this is not a signup rule.
insert into public.admin_profiles(id,full_name,role)
select id,coalesce(raw_user_meta_data->>'full_name',split_part(email,'@',1)),
  case when raw_app_meta_data->>'role' in ('staff','admin','super_admin','vacancies_only')
    then raw_app_meta_data->>'role' else 'staff' end
from auth.users where email_confirmed_at is not null and lower(email) like '%@devanhaar.com'
on conflict(id) do nothing;

alter table public.padel_tournaments add column if not exists payment_url text;
alter table public.padel_registrations
  add column if not exists tournament_id uuid references public.padel_tournaments(id),
  add column if not exists payment_provider text,
  add column if not exists payment_status text not null default 'unverified',
  add column if not exists payment_reference text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references auth.users(id);

update public.padel_tournaments set payment_url='https://www.totalgiving.co.uk/appeal/SPAEU/donate'
where name ilike '%Amsterdam%' and payment_url is null;
update public.padel_registrations r set tournament_id=t.id
from public.padel_tournaments t where r.tournament_id is null and r.event_name=t.name;
-- Only an actual successful Stripe state is evidence of a completed payment.
update public.padel_registrations set payment_status='paid', payment_provider='stripe'
where stripe_pi_status='succeeded' and payment_status='unverified';

drop index if exists public.uniq_padel_captain_phone_active;
drop index if exists public.uniq_padel_captain_phone_approved;
create unique index if not exists uniq_padel_phone_approved_event
on public.padel_registrations (captain_phone_normalized, coalesce(tournament_id,initiative_id))
where status='approved' and captain_phone_normalized is not null;
create index if not exists idx_padel_registrations_tournament on public.padel_registrations(tournament_id);

create table if not exists public.spa_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.spa_members enable row level security;
grant select on public.spa_members to authenticated;
grant all on public.spa_members to service_role;

create schema if not exists spa_private;
revoke all on schema spa_private from public;
grant usage on schema spa_private to authenticated;
-- SECURITY DEFINER is limited to reading internal membership/profile records.
-- These helpers live outside exposed schemas; they never accept another user id.
create or replace function spa_private.is_devanhaar_staff() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.admin_profiles where id=(select auth.uid())
    and role in ('staff','admin','super_admin'));
$$;
create or replace function spa_private.can_manage_spa() returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and (
    spa_private.is_devanhaar_staff() or exists(select 1 from public.spa_members
      where user_id=(select auth.uid()) and is_active=true));
$$;
create or replace function spa_private.is_spa_only() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.spa_members where user_id=(select auth.uid()))
    and not spa_private.is_devanhaar_staff();
$$;
revoke all on function spa_private.is_devanhaar_staff(), spa_private.can_manage_spa(), spa_private.is_spa_only() from public;
grant execute on function spa_private.is_devanhaar_staff(), spa_private.can_manage_spa(), spa_private.is_spa_only() to authenticated;

drop policy if exists spa_members_self_read on public.spa_members;
create policy spa_members_self_read on public.spa_members for select to authenticated
using (user_id=(select auth.uid()) or (select spa_private.is_devanhaar_staff()));

-- Replace the old unrestricted authenticated write policies on SPA tables.
do $$ declare t text; p record; begin
  foreach t in array array['padel_players','padel_tournaments','padel_tournament_results','padel_ranking_snapshots','padel_registrations'] loop
    for p in select policyname from pg_policies where schemaname='public' and tablename=t
      and (cmd <> 'SELECT' or t='padel_registrations') loop
      execute format('drop policy %I on public.%I',p.policyname,t);
    end loop;
    execute format('create policy spa_staff_access on public.%I for all to authenticated using ((select spa_private.can_manage_spa())) with check ((select spa_private.can_manage_spa()))',t);
  end loop;
end $$;

create table if not exists public.padel_activity_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id),
  registration_id uuid references public.padel_registrations(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.padel_activity_log enable row level security;
grant select,insert on public.padel_activity_log to authenticated;
grant usage on sequence public.padel_activity_log_id_seq to authenticated;
grant all on public.padel_activity_log to service_role;
drop policy if exists spa_audit_read on public.padel_activity_log;
drop policy if exists spa_audit_insert on public.padel_activity_log;
create policy spa_audit_read on public.padel_activity_log for select to authenticated using ((select spa_private.can_manage_spa()));
create policy spa_audit_insert on public.padel_activity_log for insert to authenticated
with check ((select spa_private.can_manage_spa()) and admin_id=(select auth.uid()));

-- SPA-only accounts cannot exploit unrelated broad authenticated policies.
-- No existing Devanhaar staff or non-SPA account changes access here.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname='public'
    and tablename not like 'padel_%' and tablename not in ('spa_members','admin_profiles') loop
    execute format('drop policy if exists spa_only_exclusion on public.%I',t.tablename);
    execute format('create policy spa_only_exclusion on public.%I as restrictive for all to authenticated using (not (select spa_private.is_spa_only())) with check (not (select spa_private.is_spa_only()))',t.tablename);
  end loop;
end $$;
drop policy if exists spa_profile_self_only on public.admin_profiles;
create policy spa_profile_self_only on public.admin_profiles as restrictive for select to authenticated
using (not (select spa_private.is_spa_only()) or id=(select auth.uid()));

commit;
