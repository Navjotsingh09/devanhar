-- Sikhi Vidyala dashboard management: archive/delete/message support.
-- Run once in the Supabase SQL editor for the replacement project.
-- Safe to re-run: uses IF EXISTS / IF NOT EXISTS guards throughout.

-- 1. activity_log.entity_id was UUID, but vidyala_applications.id (bigserial)
--    and spn_submissions.id (bigserial) are not UUIDs, so logging actions
--    against them has been silently failing. Widen to TEXT (lossless for the
--    existing UUID rows).
alter table public.activity_log
  alter column entity_id type text using entity_id::text;

-- 2. register_interest (webinar signups + interest registrations) needs a
--    status column so staff can archive rows, and updated_at so archive/edit
--    actions can stamp it like every other managed table.
alter table public.register_interest
  add column if not exists status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

alter table public.register_interest
  drop constraint if exists register_interest_status_check;
alter table public.register_interest
  add constraint register_interest_status_check
  check (status in ('active', 'archived'));

create index if not exists register_interest_status_idx
  on public.register_interest (status);

create or replace function public.update_register_interest_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_register_interest_updated_at on public.register_interest;
create trigger set_register_interest_updated_at
  before update on public.register_interest
  for each row execute function public.update_register_interest_updated_at();

-- 3. vidyala_applications previously only allowed staff to SELECT. Widen to
--    the same "authenticated can do everything" convention used by every
--    other managed table (auth_all_form, auth_all_vacancies,
--    auth_all_register_interest, etc.) so staff can archive/delete/update.
drop policy if exists "Staff can read Vidyala applications" on public.vidyala_applications;
drop policy if exists "Staff manage Vidyala applications" on public.vidyala_applications;
create policy "Staff manage Vidyala applications"
  on public.vidyala_applications
  for all
  to authenticated
  using (true)
  with check (true);
