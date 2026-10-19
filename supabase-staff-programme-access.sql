begin;
create schema if not exists staff_private;
revoke all on schema staff_private from public;
grant usage on schema staff_private to authenticated;
create table if not exists public.staff_programme_access (
 programme text primary key check (programme in ('kaurs','vidyala','newsletter')),
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'programme_manager' check(role='programme_manager'),
 created_at timestamptz not null default now()
);
alter table public.staff_programme_access enable row level security;
revoke all on public.staff_programme_access from anon,authenticated;
grant select on public.staff_programme_access to authenticated;
grant all on public.staff_programme_access to service_role;
create policy staff_programme_self_read on public.staff_programme_access for select to authenticated using(user_id=(select auth.uid()));
insert into public.staff_programme_access(programme,user_id)
select programme,u.id from auth.users u cross join (values ('kaurs'),('vidyala'),('newsletter')) p(programme)
where lower(u.email)='karnjit.kaur@devanhaar.com'
on conflict(programme) do update set user_id=excluded.user_id;
create function staff_private.is_scoped() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.staff_programme_access where user_id=(select auth.uid()));
$$;
create function staff_private.can_access_programme(programme_key text) returns boolean language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and case when programme_key is null then not staff_private.is_scoped()
 else exists(select 1 from public.staff_programme_access where programme=programme_key and user_id=(select auth.uid())) end;
$$;
create function staff_private.classify(initiative uuid, camp_name text, details jsonb) returns text language sql stable security definer set search_path='' as $$
 select case
 when camp_name ilike 'vidyala%' or exists(select 1 from public.initiatives where id=initiative and slug='sikhi-vidyala')
 or concat_ws(' ',details->>'source_page',details->>'subject') ~* '(vidyala|vidyalaya)' then 'vidyala'
 when camp_name ilike 'kaurs%' or exists(select 1 from public.initiatives where id=initiative and slug like 'kaurs%')
 or concat_ws(' ',details->>'source_page',details->>'subject') ~* 'kaurs' then 'kaurs'
 when concat_ws(' ',details->>'source_page',details->>'subject') ~* 'newsletter' then 'newsletter'
 else null end;
$$;
create function staff_private.record_programme(source_table text, record_id text) returns text language sql stable security definer set search_path='' as $$
 select case
 when source_table in ('vidyala_application','vidyala_applications') then 'vidyala'
 when source_table in ('newsletter_subscription','newsletter_subscriptions') then 'newsletter'
 when source_table in ('camp_application','camp_applications') then
 (select staff_private.classify(initiative_id,null,null) from public.camp_applications where id::text=record_id)
 when source_table in ('form_submission','form_submissions') then
 (select staff_private.classify(initiative_id,null,form_data) from public.form_submissions where id::text=record_id)
 when source_table='register_interest' then
 (select staff_private.classify(null,camp,null) from public.register_interest where id::text=record_id)
 else null end;
$$;
create function staff_private.document_programme(file_path text) returns text language sql stable security definer set search_path='' as $$
 select case when file_path like 'sikhi-vidyala/%' then 'vidyala'
 when file_path like 'kaurs%' then 'kaurs'
 when exists(select 1 from public.vidyala_applications where id_document_url=file_path or dbs_certificate_url=file_path) then 'vidyala'
 else (select staff_private.classify(initiative_id,null,null) from public.camp_applications where id_document_url=file_path limit 1) end;
$$;
create function public.staff_can_view_document(file_path text) returns boolean language sql stable security invoker set search_path='' as $$
 select staff_private.can_access_programme(staff_private.document_programme(file_path));
$$;
revoke all on all functions in schema staff_private from public;
grant execute on all functions in schema staff_private to authenticated;
revoke all on function public.staff_can_view_document(text) from public;
grant execute on function public.staff_can_view_document(text) to authenticated;
-- A scoped account is denied every unrelated table, including via the REST API.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='public' and tablename not in
 ('staff_programme_access','initiatives','admin_profiles','camp_applications','form_submissions','register_interest','vidyala_applications','newsletter_subscriptions','replies','activity_log','camp_applications_vault','recovery_payment_ledger')
 loop
 execute format('create policy programme_scope_exclusion on public.%I as restrictive for all to authenticated using (not (select staff_private.is_scoped())) with check (not (select staff_private.is_scoped()))',t.tablename);
 end loop;
end $$;
create policy programme_profile_read on public.admin_profiles as restrictive for select to authenticated using(not (select staff_private.is_scoped()) or id=(select auth.uid()));
create policy programme_profile_write on public.admin_profiles as restrictive for update to authenticated using(not (select staff_private.is_scoped())) with check(not (select staff_private.is_scoped()));
create policy programme_initiatives_write on public.initiatives as restrictive for update to authenticated using(not (select staff_private.is_scoped())) with check(not (select staff_private.is_scoped()));
create policy programme_initiatives_insert on public.initiatives as restrictive for insert to authenticated with check(not (select staff_private.is_scoped()));
create policy programme_initiatives_delete on public.initiatives as restrictive for delete to authenticated using(not (select staff_private.is_scoped()));
create policy programme_profiles_insert on public.admin_profiles as restrictive for insert to authenticated with check(not (select staff_private.is_scoped()));
create policy programme_profiles_delete on public.admin_profiles as restrictive for delete to authenticated using(not (select staff_private.is_scoped()));
create policy programme_camp_rows on public.camp_applications as restrictive for all to authenticated using(staff_private.can_access_programme(staff_private.classify(initiative_id,null,null))) with check(staff_private.can_access_programme(staff_private.classify(initiative_id,null,null)));
create policy programme_form_rows on public.form_submissions as restrictive for all to authenticated using(staff_private.can_access_programme(staff_private.classify(initiative_id,null,form_data))) with check(staff_private.can_access_programme(staff_private.classify(initiative_id,null,form_data)));
create policy programme_interest_rows on public.register_interest as restrictive for all to authenticated using(staff_private.can_access_programme(staff_private.classify(null,camp,null))) with check(staff_private.can_access_programme(staff_private.classify(null,camp,null)));
create policy programme_vidyala_rows on public.vidyala_applications as restrictive for all to authenticated using(staff_private.can_access_programme('vidyala')) with check(staff_private.can_access_programme('vidyala'));
create policy programme_newsletter_rows on public.newsletter_subscriptions as restrictive for all to authenticated using(staff_private.can_access_programme('newsletter')) with check(staff_private.can_access_programme('newsletter'));
create policy programme_reply_rows on public.replies as restrictive for all to authenticated
 using(case when submission_id is not null then exists(select 1 from public.form_submissions where id=submission_id)
 else not (select staff_private.is_scoped()) end)
 with check(admin_id=(select auth.uid()) and case when submission_id is not null then exists(select 1 from public.form_submissions where id=submission_id)
 else not (select staff_private.is_scoped()) end);
create policy programme_activity_rows on public.activity_log as restrictive for select to authenticated
 using(case when (select staff_private.is_scoped()) then admin_id=(select auth.uid())
 else staff_private.can_access_programme(staff_private.record_programme(entity_type,entity_id)) end);
create policy programme_activity_insert on public.activity_log as restrictive for insert to authenticated with check(admin_id=(select auth.uid()));
create policy programme_vault_rows on public.camp_applications_vault as restrictive for all to authenticated
 using(exists(select 1 from public.camp_applications where id=application_id))
 with check(exists(select 1 from public.camp_applications where id=application_id));
create policy programme_recovery_rows on public.recovery_payment_ledger as restrictive for all to authenticated
 using(staff_private.can_access_programme(staff_private.classify(null,null,jsonb_build_object('source_page',description))))
 with check(staff_private.can_access_programme(staff_private.classify(null,null,jsonb_build_object('source_page',description))));
create policy programme_document_read on storage.objects as restrictive for select to authenticated
 using(case when bucket_id in ('camp-applications','vidyala-applications') then public.staff_can_view_document(name)
 else not (select staff_private.is_scoped()) end);
commit;