-- Vidyala "Register your interest" form: new fields on register_interest
-- Run in Supabase SQL editor.

alter table public.register_interest
  add column if not exists dob date,
  add column if not exists occupation text,
  add column if not exists schedule text[];

-- Allow the new 'vidyala-interest' camp (constraint recreated with all live camps)
alter table public.register_interest
  drop constraint if exists register_interest_camp_check;
alter table public.register_interest
  add constraint register_interest_camp_check
  check (camp in ('singhs-camp-eu', 'kaurs-camp-eu', 'vidyala-webinar', 'vidyala-interest'));
