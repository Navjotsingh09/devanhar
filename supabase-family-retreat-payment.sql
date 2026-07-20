-- Payment tracking for Sikh Family Retreat bookings
alter table public.family_retreat_bookings
  add column if not exists amount_due numeric,
  add column if not exists amount_paid numeric,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at timestamptz,
  add column if not exists stripe_payment_link text,
  add column if not exists stripe_payment_link_id text;
