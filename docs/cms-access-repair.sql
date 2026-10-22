-- Preserve programme operators while giving real administrators full access.
create or replace function staff_private.is_global_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists (
   select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('admin','super_admin')
 );
$$;
revoke all on function staff_private.is_global_admin() from public,anon;
grant execute on function staff_private.is_global_admin() to authenticated,service_role;
create or replace function staff_private.is_scoped() returns boolean
language sql stable security definer set search_path = '' as $$
 select not staff_private.is_global_admin() and exists (
   select 1 from public.staff_programme_access where user_id=(select auth.uid())
 );
$$;
create or replace function staff_private.can_access_programme(programme_key text) returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and (
   staff_private.is_global_admin() or case when programme_key is null then not staff_private.is_scoped()
   else exists(select 1 from public.staff_programme_access where programme=programme_key and user_id=(select auth.uid())) end
 );
$$;
-- Role changes go through one guarded transaction, not browser table updates.
create or replace function public.staff_update_profile(p_target uuid, p_role text default null, p_name text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare actor_role text; target_role text; next_role text; actor uuid := auth.uid();
begin
 if actor is null then raise exception 'Please sign in' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(722648132);
 select role into actor_role from public.admin_profiles where id=actor for update;
 if actor_role is null or actor_role not in ('admin','super_admin') then raise exception 'Administrator access required' using errcode='42501'; end if;
 select role into target_role from public.admin_profiles where id=p_target for update;
 if target_role is null then raise exception 'Staff profile not found' using errcode='P0002'; end if;
 next_role := coalesce(p_role,target_role);
 if next_role not in ('super_admin','admin','staff','vacancies_only','content_manager') then raise exception 'Invalid role' using errcode='22023'; end if;
 if p_role is not null and actor=p_target then raise exception 'You cannot change your own role' using errcode='42501'; end if;
 if actor_role='admin' and (target_role<>'content_manager' or next_role<>'content_manager') then
   raise exception 'Only a Super Admin can change system roles or other administrator accounts' using errcode='42501';
 end if;
 if p_name is not null and (length(trim(p_name))=0 or length(p_name)>160) then raise exception 'Enter a valid staff name' using errcode='22023'; end if;
 update public.admin_profiles set role=next_role, full_name=coalesce(trim(p_name),full_name),updated_at=now() where id=p_target;
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)
 values(actor,'Updated staff profile','admin_profile',p_target,jsonb_build_object('previous_role',target_role,'role',next_role));
end;
$$;
revoke all on function public.staff_update_profile(uuid,text,text) from public,anon;
grant execute on function public.staff_update_profile(uuid,text,text) to authenticated;
revoke insert,update,delete,truncate,references,trigger on public.admin_profiles from anon,authenticated;
revoke select on public.admin_profiles from anon;
-- TRUNCATE bypasses RLS and has no place in an authenticated CMS connection.
revoke truncate,references,trigger on public.cms_pages,public.cms_page_revisions,public.cms_page_assignments from anon,authenticated;
-- These RPCs are authenticated operations; none are public website readers.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('cms_is_admin','cms_can_page','cms_create_page','cms_save_page_draft','cms_publish_page','cms_set_page_assignment') loop
 execute format('revoke execute on function %s from public,anon',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
