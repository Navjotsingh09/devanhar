-- CMS delegation never implies operational CRM access, including direct Data API calls.
create or replace function staff_private.is_scoped() returns boolean
language sql stable security definer set search_path = '' as $$
 select not staff_private.is_global_admin() and (
   exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role='content_manager')
   or exists(select 1 from public.staff_programme_access where user_id=(select auth.uid()))
 );
$$;
create or replace function staff_private.can_access_programme(programme_key text) returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and (
   staff_private.is_global_admin() or (
     not exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role='content_manager')
     and case when programme_key is null then not staff_private.is_scoped()
     else exists(select 1 from public.staff_programme_access where programme=programme_key and user_id=(select auth.uid())) end
   )
 );
$$;
create or replace function public.roots_forms_can_manage() returns boolean
language sql stable set search_path = '' as $$
 select exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('staff','admin','super_admin'))
 and (staff_private.is_global_admin() or not staff_private.is_scoped());
$$;
