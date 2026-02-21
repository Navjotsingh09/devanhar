-- Form submissions table
create type form_type as enum ('contact', 'application', 'volunteer', 'enquiry', 'registration', 'booking');
create type submission_status as enum ('new', 'in_progress', 'resolved', 'archived');
create type priority_level as enum ('low', 'medium', 'high', 'urgent');

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid references public.initiatives(id) on delete set null,
  form_type form_type not null default 'contact',
  submitter_name text not null,
  submitter_email text,
  submitter_phone text,
  form_data jsonb not null default '{}',
  status submission_status not null default 'new',
  assigned_to uuid references public.admin_profiles(id) on delete set null,
  priority priority_level not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.form_submissions enable row level security;

-- All authenticated admins can CRUD submissions
create policy "admins_read_submissions" on public.form_submissions
  for select using (auth.uid() is not null);

create policy "admins_insert_submissions" on public.form_submissions
  for insert with check (true);

create policy "admins_update_submissions" on public.form_submissions
  for update using (auth.uid() is not null);

create policy "admins_delete_submissions" on public.form_submissions
  for delete using (auth.uid() is not null);

-- Index for common queries
create index idx_submissions_initiative on public.form_submissions(initiative_id);
create index idx_submissions_status on public.form_submissions(status);
create index idx_submissions_created on public.form_submissions(created_at desc);
