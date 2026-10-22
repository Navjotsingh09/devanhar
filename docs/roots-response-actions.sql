-- Add recoverable response management without changing answers or payment records.
alter table public.roots_form_submissions
  add column record_state text not null default 'active' check (record_state in ('active','archived','deleted')),
  add column state_changed_at timestamptz,
  add column state_changed_by uuid references auth.users(id) on delete set null;
create index roots_form_submissions_management_idx
  on public.roots_form_submissions(form_id,record_state,created_at desc,id desc);
-- Only these management columns can be changed by an authenticated staff client.
grant update(record_state,state_changed_at,state_changed_by) on public.roots_form_submissions to authenticated;
create policy roots_form_responses_manage_state on public.roots_form_submissions
  for update to authenticated
  using ((select public.roots_forms_can_manage()))
  with check ((select public.roots_forms_can_manage()) and state_changed_by=(select auth.uid()) and state_changed_at is not null);
