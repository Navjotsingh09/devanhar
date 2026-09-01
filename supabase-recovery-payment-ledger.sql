-- Historical payment evidence recovered from external providers.
-- This is intentionally separate from live form tables because the exports do
-- not include all required application and booking fields.

create table if not exists public.recovery_payment_ledger (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('stripe', 'donation_manager')),
  source_record_id text not null,
  occurred_at timestamptz,
  amount numeric(12, 2),
  currency text,
  payment_status text,
  description text,
  customer_name text,
  customer_email text,
  customer_phone text,
  payment_reference text,
  checkout_session_id text,
  payment_intent_id text,
  linked_record_type text,
  linked_record_id text,
  metadata jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (source, source_record_id)
);

alter table public.recovery_payment_ledger enable row level security;

drop policy if exists "authenticated_read_recovery_payment_ledger" on public.recovery_payment_ledger;
create policy "authenticated_read_recovery_payment_ledger"
  on public.recovery_payment_ledger
  for select
  to authenticated
  using (true);

create index if not exists recovery_payment_ledger_occurred_at_idx
  on public.recovery_payment_ledger (occurred_at desc);
create index if not exists recovery_payment_ledger_email_idx
  on public.recovery_payment_ledger (customer_email);
create index if not exists recovery_payment_ledger_linked_record_idx
  on public.recovery_payment_ledger (linked_record_type, linked_record_id);
