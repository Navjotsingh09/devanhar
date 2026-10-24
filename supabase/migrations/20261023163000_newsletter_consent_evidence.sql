-- Run after docs/cms-completion-schema.sql. Do not infer consent for legacy records.
begin;
alter table public.newsletter_subscriptions
  alter column subscribed_at drop not null,
  alter column subscribed_at drop default,
  add column if not exists name text,
  add column if not exists consent_at timestamptz,
  add column if not exists consent_statement text;
commit;
