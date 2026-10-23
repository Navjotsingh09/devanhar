-- Existing public form insertion and general staff access remain available.
alter table public.staff_programme_access drop constraint staff_programme_access_programme_check;
alter table public.staff_programme_access add constraint staff_programme_access_programme_check
 check(programme in ('kaurs','vidyala','newsletter','family','roots'));
create or replace function public.roots_forms_can_manage() returns boolean
language sql stable set search_path = '' as $$
 select exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('staff','admin','super_admin'))
 and (staff_private.is_global_admin() or not staff_private.is_scoped() or staff_private.can_access_programme('roots'));
$$;
grant select on public.roots_bookings to authenticated;
alter policy programme_scope_exclusion on public.roots_bookings
 using (not (select staff_private.is_scoped()) or (select public.roots_forms_can_manage()))
 with check (not (select staff_private.is_scoped()) or (select public.roots_forms_can_manage()));
create policy roots_operations_read on public.roots_bookings for select to authenticated
 using ((select public.roots_forms_can_manage()));
alter policy programme_recovery_rows on public.recovery_payment_ledger
 using (case when description ilike '%Roots Residential%' then public.roots_forms_can_manage()
 else staff_private.can_access_programme(staff_private.classify(null::uuid,null::text,jsonb_build_object('source_page',description))) end)
 with check (case when description ilike '%Roots Residential%' then public.roots_forms_can_manage()
 else staff_private.can_access_programme(staff_private.classify(null::uuid,null::text,jsonb_build_object('source_page',description))) end);
