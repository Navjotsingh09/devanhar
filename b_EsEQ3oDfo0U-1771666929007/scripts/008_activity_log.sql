-- Activity log for audit trail
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

-- All authenticated admins can read activity
create policy "admins_read_activity" on public.activity_log
  for select using (auth.uid() is not null);

-- All authenticated admins can insert activity
create policy "admins_insert_activity" on public.activity_log
  for insert with check (auth.uid() is not null);

-- Index for common queries
create index idx_activity_created on public.activity_log(created_at desc);
create index idx_activity_entity on public.activity_log(entity_type, entity_id);
