-- Additive, reversible CMS workflow columns; no submitted data is removed.
alter table public.site_images add column if not exists archived_at timestamptz;
alter table public.newsletter_subscriptions add column if not exists status text not null default 'active' check(status in ('active','unsubscribed'));
alter table public.newsletter_subscriptions add column if not exists subscribed_at timestamptz not null default now();
alter table public.newsletter_subscriptions add column if not exists unsubscribed_at timestamptz;
alter table public.newsletter_subscriptions add column if not exists source text not null default 'legacy';
alter table public.site_images add column if not exists description text not null default '';
alter table public.site_images add column if not exists media_versions jsonb not null default '[]';
alter table public.newsletter_subscriptions add column if not exists full_name text;
alter table public.newsletter_subscriptions add column if not exists consent boolean not null default false;
-- PENDING APPROVAL: the following policy change has NOT been applied.
-- The public server endpoint stores subscriptions after validation; anonymous clients cannot read or edit the list.
drop policy if exists anon_update_nl on public.newsletter_subscriptions;
