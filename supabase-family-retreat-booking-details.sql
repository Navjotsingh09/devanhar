begin;

alter table public.family_retreat_bookings
  add column if not exists booking_number bigint generated always as identity,
  add column if not exists booking_details jsonb;

create unique index if not exists family_retreat_booking_number_uidx
  on public.family_retreat_bookings (booking_number);

commit;
