-- Initiatives table
create type initiative_category as enum ('education', 'professional', 'singhs', 'general');

create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category initiative_category not null default 'general',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.initiatives enable row level security;

-- All authenticated users can read initiatives
create policy "anyone_read_initiatives" on public.initiatives
  for select using (auth.uid() is not null);

-- Only authenticated admins can insert/update/delete
create policy "admins_manage_initiatives" on public.initiatives
  for all using (auth.uid() is not null);

-- Pre-seed all Devanhaar initiatives
insert into public.initiatives (name, slug, category, description) values
  ('Gurmat Academy', 'gurmat-academy', 'education', 'Sikh religious education program providing Gurmat teachings to youth and adults.'),
  ('University Talks', 'university-talks', 'education', 'Educational outreach program bringing Sikh speakers to university campuses.'),
  ('Sikhi Vidyala', 'sikhi-vidyala', 'education', 'Structured Sikh learning institution for children and young people.'),
  ('Youth Camps', 'youth-camps', 'education', 'Residential camps for Sikh youth combining education, sports, and spiritual growth.'),
  ('Khalsa Catalyst', 'khalsa-catalyst', 'professional', 'Professional development network empowering Sikh professionals.'),
  ('Sikh Professional Network (SPN)', 'spn', 'professional', 'Networking platform connecting Sikh professionals across industries.'),
  ('SWeb3', 'sweb3', 'professional', 'Technology and Web3 innovation community for Sikhs in tech.'),
  ('SinghsCamp UK', 'singhs-camp-uk', 'singhs', 'Residential camp experience for Singhs in the United Kingdom.'),
  ('SinghsCamp EU', 'singhs-camp-eu', 'singhs', 'Residential camp experience for Singhs across Europe.'),
  ('Forums', 'forums', 'general', 'Community discussion forums for open dialogue on Sikh topics and issues.');
