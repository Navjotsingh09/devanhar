-- Reversible staff deactivation. Retains accounts and history; denies fresh UI/API/RLS access.
create table if not exists staff_private.disabled_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 previous_role text,
 previous_banned_until timestamptz,
 disabled_by uuid references auth.users(id),
 disabled_at timestamptz not null default now()
);
alter table staff_private.disabled_profiles enable row level security;
revoke all on staff_private.disabled_profiles from public,anon,authenticated;
create or replace function staff_private.is_scoped() returns boolean
language sql stable security definer set search_path='' as $$
 select not staff_private.is_global_admin() and (
   not exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('staff','admin','super_admin','vacancies_only'))
   or exists(select 1 from public.staff_programme_access where user_id=(select auth.uid()))
 );
$$;
create or replace function staff_private.can_access_programme(programme_key text) returns boolean
language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('staff','admin','super_admin','vacancies_only')) and (
 staff_private.is_global_admin() or case when programme_key is null then not staff_private.is_scoped()
 else exists(select 1 from public.staff_programme_access where programme=programme_key and user_id=(select auth.uid())) end
 );
$$;
create or replace function public.staff_set_active(p_target uuid,p_active boolean) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); prior_role text; prior_ban timestamptz; saved staff_private.disabled_profiles;begin
 if actor is null or not exists(select 1 from public.admin_profiles where id=actor and role='super_admin') then raise exception 'Super Admin access required' using errcode='42501';end if;
 if actor=p_target then raise exception 'You cannot change your own account access' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('devanhaar-staff-access',0));
 select p.role into prior_role from public.admin_profiles p where p.id=p_target for update;
 select u.banned_until into prior_ban from auth.users u where u.id=p_target for update;
 if not found then raise exception 'Account not found' using errcode='22023';end if;
 if p_active then
  select * into saved from staff_private.disabled_profiles where user_id=p_target;
  if not found then raise exception 'This account has no deactivation to restore' using errcode='22023';end if;
  if saved.previous_role is not null then update public.admin_profiles set role=saved.previous_role where id=p_target;end if;
  update auth.users set banned_until=saved.previous_banned_until where id=p_target;
  delete from staff_private.disabled_profiles where user_id=p_target;
 else
  if prior_role='super_admin' and (select count(*) from public.admin_profiles where role='super_admin' and id<>p_target)=0 then raise exception 'Keep at least one active Super Admin' using errcode='22023';end if;
  insert into staff_private.disabled_profiles(user_id,previous_role,previous_banned_until,disabled_by) values(p_target,prior_role,prior_ban,actor) on conflict(user_id) do nothing;
  update public.admin_profiles set role='disabled' where id=p_target;
  update auth.users set banned_until='2099-01-01 00:00:00+00' where id=p_target;
  delete from auth.sessions where user_id=p_target;
 end if;
 insert into public.activity_log(admin_id,action,entity_type,entity_id)values(actor,case when p_active then 'Restored staff access' else 'Deactivated staff access' end,'staff_account',p_target);
end;$$;
revoke all on function public.staff_set_active(uuid,boolean) from public,anon;
grant execute on function public.staff_set_active(uuid,boolean) to authenticated;
create or replace function public.cms_staff_roster() returns table(id uuid,email text,full_name text,role text,created_at timestamptz,email_confirmed boolean,programmes text[],disabled boolean)
language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null or not exists(select 1 from public.admin_profiles p where p.id=auth.uid() and p.role in ('admin','super_admin')) then raise exception 'Administrator access required' using errcode='42501';end if;
 return query select p.id,u.email::text,p.full_name,p.role,p.created_at,u.email_confirmed_at is not null,array(select g.programme from public.staff_programme_access g where g.user_id=p.id order by g.programme),p.role='disabled' from public.admin_profiles p join auth.users u on u.id=p.id order by p.created_at;
end;$$;
revoke all on function public.cms_staff_roster() from public,anon;
grant execute on function public.cms_staff_roster() to authenticated;
