-- Add postal address fields to Roots bookings.
-- Keep these nullable so historical bookings remain valid.
alter table public.roots_bookings
  add column if not exists parent_town_city text,
  add column if not exists parent_address_line_1 text,
  add column if not exists parent_address_line_2 text,
  add column if not exists parent_postcode text;
