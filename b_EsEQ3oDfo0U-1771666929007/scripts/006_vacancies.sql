-- Vacancies table
create type vacancy_type as enum ('volunteer', 'paid', 'internship');
create type application_status as enum ('new', 'reviewing', 'shortlisted', 'rejected', 'accepted');

create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  type vacancy_type not null default 'volunteer',
  initiative_id uuid references public.initiatives(id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vacancy_applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  cv_url text,
  cover_letter text,
  form_data jsonb not null default '{}',
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.vacancies enable row level security;
alter table public.vacancy_applications enable row level security;

-- Vacancies policies
create policy "admins_read_vacancies" on public.vacancies
  for select using (auth.uid() is not null);

create policy "admins_manage_vacancies" on public.vacancies
  for all using (auth.uid() is not null);

-- Applications policies
create policy "admins_read_applications" on public.vacancy_applications
  for select using (auth.uid() is not null);

create policy "anyone_insert_applications" on public.vacancy_applications
  for insert with check (true);

create policy "admins_update_applications" on public.vacancy_applications
  for update using (auth.uid() is not null);

create policy "admins_delete_applications" on public.vacancy_applications
  for delete using (auth.uid() is not null);
