-- Add blog management for the requested existing programme manager.
-- Run in the Devanhaar database, not the Hilston project.
begin;
do $grant$
declare v_user uuid; v_check text;
begin
 select u.id into strict v_user from auth.users u
 join public.admin_profiles p on p.id=u.id
 where lower(u.email)='karnjit.kaur@devanhaar.com' and p.role='staff';
 if not exists(select 1 from public.staff_programme_access where user_id=v_user) then
  raise exception 'Expected an existing programme-scoped staff account; nothing changed';
 end if;
 if exists(select 1 from public.staff_programme_access where programme='blog' and user_id<>v_user) then
  raise exception 'Blog scope already belongs to another account; nothing changed';
 end if;
 select pg_get_expr(conbin,conrelid) into strict v_check from pg_constraint
 where conrelid='public.staff_programme_access'::regclass
 and conname='staff_programme_access_programme_check' and contype='c';
 if v_check is null then raise exception 'Programme constraint could not be verified';end if;
 alter table public.staff_programme_access drop constraint staff_programme_access_programme_check;
 execute format('alter table public.staff_programme_access add constraint staff_programme_access_programme_check check (programme = %L or (%s))','blog',v_check);
 insert into public.staff_programme_access(programme,user_id) values('blog',v_user)
 on conflict(programme) do nothing;
 if not exists(select 1 from public.staff_programme_access where programme='blog' and user_id=v_user) then
  raise exception 'Blog grant was not created';
 end if;
end $grant$;
create or replace function staff_private.can_manage_blog() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.admin_profiles p where p.id=auth.uid() and (
   p.role in ('admin','super_admin') or (p.role='staff' and (
    not exists(select 1 from public.staff_programme_access a where a.user_id=auth.uid())
    or exists(select 1 from public.staff_programme_access a where a.user_id=auth.uid() and a.programme='blog')
   ))
  )
 );
$$;
revoke all on function staff_private.can_manage_blog() from public,anon;
grant execute on function staff_private.can_manage_blog() to authenticated;
commit;
select u.email,p.role,array_agg(a.programme order by a.programme) as programmes
from auth.users u join public.admin_profiles p on p.id=u.id
join public.staff_programme_access a on a.user_id=u.id
where lower(u.email)='karnjit.kaur@devanhaar.com'
group by u.email,p.role;
