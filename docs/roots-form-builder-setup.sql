-- Additive setup: no existing bookings, payments, roles or policies are changed.
-- Review and apply to the connected project before enabling public collection.
begin;
create table if not exists public.roots_forms (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null, draft_schema jsonb not null, published_schema jsonb,
 accepting boolean not null default false, published_version integer not null default 0, revision integer not null default 1,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.roots_form_submissions (
 id uuid primary key default gen_random_uuid(), form_id uuid not null references public.roots_forms(id),
 receipt_token uuid not null unique default gen_random_uuid(), request_key uuid not null,
 schema_version integer not null, schema_snapshot jsonb not null, answers jsonb not null,
 respondent_name text not null, respondent_email text, amount_pence integer not null check(amount_pence>=0), currency text not null default 'gbp' check(currency='gbp'),
 payment_state text not null check(payment_state in ('not_required','awaiting_payment','paid','failed','expired')),
 checkout_session_id text unique, checkout_url text, payment_environment text check(payment_environment in ('test','live')), ip_hash text not null,
 created_at timestamptz not null default now(), paid_at timestamptz, unique(form_id,request_key)
);
create index if not exists roots_form_submissions_page on public.roots_form_submissions(form_id,created_at desc,id desc);
create index if not exists roots_form_submissions_rate on public.roots_form_submissions(ip_hash,created_at desc);
create or replace function public.roots_forms_can_manage() returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select exists(select 1 from public.admin_profiles where id=(select auth.uid()) and role in ('staff','admin','super_admin'))
 and not exists(select 1 from public.staff_programme_access where user_id=(select auth.uid()));
$$;
revoke all on function public.roots_forms_can_manage() from public;
grant execute on function public.roots_forms_can_manage() to authenticated,service_role;
alter table public.roots_forms enable row level security;
alter table public.roots_form_submissions enable row level security;
revoke all on public.roots_forms,public.roots_form_submissions from anon,authenticated;
grant select,insert,update on public.roots_forms to authenticated;
grant select on public.roots_form_submissions to authenticated;
grant all on public.roots_forms,public.roots_form_submissions to service_role;
drop policy if exists roots_forms_staff on public.roots_forms;
create policy roots_forms_staff on public.roots_forms for all to authenticated using(public.roots_forms_can_manage()) with check(public.roots_forms_can_manage());
drop policy if exists roots_form_responses_staff on public.roots_form_submissions;
create policy roots_form_responses_staff on public.roots_form_submissions for select to authenticated using(public.roots_forms_can_manage());
-- Only the validated server submission handler may call this transaction.
create or replace function public.create_roots_form_submission(p_form_id uuid,p_version integer,p_schema jsonb,p_answers jsonb,p_name text,p_email text,p_amount integer,p_request_key uuid,p_ip_hash text)
returns setof public.roots_form_submissions language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_ip_hash,0));
 if exists(select 1 from public.roots_form_submissions where form_id=p_form_id and request_key=p_request_key) then
  return query select * from public.roots_form_submissions where form_id=p_form_id and request_key=p_request_key; return;
 end if;
 if (select count(*) from public.roots_form_submissions where ip_hash=p_ip_hash and created_at>now()-interval '10 minutes')>=8 then raise exception 'submission_rate_limit'; end if;
 return query insert into public.roots_form_submissions(form_id,schema_version,schema_snapshot,answers,respondent_name,respondent_email,amount_pence,payment_state,request_key,ip_hash)
 values(p_form_id,p_version,p_schema,p_answers,p_name,p_email,p_amount,case when p_amount>0 then 'awaiting_payment' else 'not_required' end,p_request_key,p_ip_hash) returning *;
end; $$;
revoke all on function public.create_roots_form_submission(uuid,integer,jsonb,jsonb,text,text,integer,uuid,text) from public,anon,authenticated;
grant execute on function public.create_roots_form_submission(uuid,integer,jsonb,jsonb,text,text,integer,uuid,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('roots-form-documents','roots-form-documents',true,3145728,array['application/pdf']) on conflict(id) do nothing;
drop policy if exists roots_form_document_insert on storage.objects;
create policy roots_form_document_insert on storage.objects for insert to authenticated with check(bucket_id='roots-form-documents' and public.roots_forms_can_manage());
-- Documents are immutable: no staff update/delete policy. Each replacement has a new URL.
commit;
