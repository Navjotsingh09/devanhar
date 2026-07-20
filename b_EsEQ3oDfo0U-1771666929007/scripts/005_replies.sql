-- Replies table for email replies and internal notes
create type reply_channel as enum ('email', 'internal_note');

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.form_submissions(id) on delete cascade,
  emergency_request_id uuid references public.emergency_requests(id) on delete cascade,
  admin_id uuid not null references public.admin_profiles(id) on delete set null,
  message text not null,
  sent_via reply_channel not null default 'internal_note',
  recipient_email text,
  subject text,
  created_at timestamptz not null default now(),
  constraint replies_one_parent check (
    (submission_id is not null and emergency_request_id is null) or
    (submission_id is null and emergency_request_id is not null)
  )
);

alter table public.replies enable row level security;

-- All authenticated admins can read and insert replies
create policy "admins_read_replies" on public.replies
  for select using (auth.uid() is not null);

create policy "admins_insert_replies" on public.replies
  for insert with check (auth.uid() is not null);

-- Indexes
create index idx_replies_submission on public.replies(submission_id);
create index idx_replies_emergency on public.replies(emergency_request_id);
