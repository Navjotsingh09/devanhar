-- Admin profiles table
create type admin_role as enum ('super_admin', 'admin', 'volunteer');

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role admin_role not null default 'admin',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

-- All authenticated admins can read all profiles
create policy "admins_read_all_profiles" on public.admin_profiles
  for select using (auth.uid() is not null);

-- Admins can update their own profile
create policy "admins_update_own_profile" on public.admin_profiles
  for update using (auth.uid() = id);

-- Admins can insert their own profile
create policy "admins_insert_own_profile" on public.admin_profiles
  for insert with check (auth.uid() = id);

-- Auto-create admin profile on signup
create or replace function public.handle_new_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::admin_role, 'admin')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_admin();
