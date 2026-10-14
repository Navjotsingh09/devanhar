create table if not exists public.registration_windows (
  id text primary key,
  title text not null,
  kind text not null check (kind in ('application', 'interest')),
  href text not null check (href ~ '^/[a-zA-Z0-9]' and href !~ '^//'),
  is_open boolean not null default false,
  opens_at timestamptz,
  closes_at timestamptz,
  event_date date,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now(),
  check (opens_at is null or closes_at is null or closes_at > opens_at)
);
alter table public.registration_windows enable row level security;
revoke insert, update, delete, truncate, references, trigger on public.registration_windows from anon, authenticated;
grant select on public.registration_windows to anon, authenticated;
grant select, update on public.registration_windows to service_role;
drop policy if exists registration_windows_public_read on public.registration_windows;
create policy registration_windows_public_read on public.registration_windows
for select to anon, authenticated using (true);
-- Existing published forms. No unconfirmed opening dates or deadlines are invented.
-- Singhs Camp UK 2026 has ended; SPA uses padel_tournaments directly.
insert into public.registration_windows (id,title,kind,href,is_open,event_date,sort_order) values
('singhs-camp-uk-2026','Singhs Camp UK 2026','application','/sc',false,'2026-07-31',90),
('vidyala-2026-2027','Sikhi Vidyala 2026–2027','application','/initiatives/sikhi-vidyala/apply',false,null,20),
('singhs-camp-eu-2027','Singhs Camp EU 2027','interest','/sce',true,null,40),
('kaurs-camp-eu-2027','Kaurs Camp EU 2027','interest','/initiatives/kaurs-camp/eu',true,null,50),
('family-new-year-reset','SFR – New Year Reset','interest','/sfi',true,'2026-12-31',30),
('family-spring-2027','Sikh Family Retreat – Spring 2027','interest','/sfr#interest-form',true,'2027-04-01',60),
('family-summer-2027','Sikh Family Retreat – Summer 2027','interest','/sfr#interest-form',true,'2027-07-22',70)
on conflict (id) do nothing;
