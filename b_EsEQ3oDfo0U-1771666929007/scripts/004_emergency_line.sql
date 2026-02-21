-- Emergency requests table for 24x7 Sikh Emergency Line
create type urgency_level as enum ('low', 'medium', 'high', 'critical');
create type emergency_status as enum ('new', 'acknowledged', 'in_progress', 'resolved', 'closed');

create table if not exists public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  caller_name text not null,
  caller_phone text,
  caller_email text,
  location text,
  description text not null,
  urgency urgency_level not null default 'medium',
  status emergency_status not null default 'new',
  assigned_to uuid references public.admin_profiles(id) on delete set null,
  notes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.emergency_requests enable row level security;

-- All authenticated admins can CRUD
create policy "admins_read_emergency" on public.emergency_requests
  for select using (auth.uid() is not null);

create policy "admins_insert_emergency" on public.emergency_requests
  for insert with check (true);

create policy "admins_update_emergency" on public.emergency_requests
  for update using (auth.uid() is not null);

create policy "admins_delete_emergency" on public.emergency_requests
  for delete using (auth.uid() is not null);

-- Indexes for priority queries
create index idx_emergency_urgency on public.emergency_requests(urgency desc);
create index idx_emergency_status on public.emergency_requests(status);
create index idx_emergency_created on public.emergency_requests(created_at desc);
