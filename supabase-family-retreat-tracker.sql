begin;

create table if not exists public.family_retreat_tracker (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.family_retreat_bookings(id) on delete restrict,
  action text not null check (action in ('contacted','link_sent','payment','refund_requested','refund_approved','refund_declined','refund_recorded')),
  amount_pence integer check (amount_pence between 1 and 10000000),
  note text,
  reference text,
  occurred_on date,
  request_id bigint references public.family_retreat_tracker(id),
  actor_id uuid not null,
  actor_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists family_retreat_tracker_booking_idx on public.family_retreat_tracker (booking_id, id desc);
create unique index if not exists family_retreat_tracker_reference_uidx
  on public.family_retreat_tracker (action, lower(reference))
  where action in ('payment','refund_recorded');

alter table public.family_retreat_tracker enable row level security;
revoke all on public.family_retreat_tracker from public, anon, authenticated;
grant select on public.family_retreat_tracker to authenticated;
grant select, insert on public.family_retreat_tracker to service_role;
grant usage on sequence public.family_retreat_tracker_id_seq to service_role;
drop policy if exists family_retreat_tracker_staff_read on public.family_retreat_tracker;
create policy family_retreat_tracker_staff_read on public.family_retreat_tracker for select to authenticated
  using ((select staff_private.can_access_programme('family')));

create or replace function public.record_family_retreat_tracker(
  p_booking_id uuid, p_action text, p_actor uuid, p_amount integer default null,
  p_note text default null, p_reference text default null, p_occurred_on date default null,
  p_request_id bigint default null
) returns bigint language plpgsql security invoker set search_path = '' as $$
declare
  b public.family_retreat_bookings%rowtype;
  profile_role text;
  staff_name text;
  pending_refund public.family_retreat_tracker%rowtype;
  refund_status text;
  verified_pence bigint;
  refunded_pence bigint;
  inserted_id bigint;
  today date := (now() at time zone 'Europe/London')::date;
begin
  select role, full_name into profile_role, staff_name from public.admin_profiles where id = p_actor;
  if profile_role is null or (
    profile_role not in ('admin','super_admin') and not exists (
      select 1 from public.staff_programme_access where user_id = p_actor and programme = 'family'
    )
  ) then raise exception 'Family Retreat access is required'; end if;
  if p_action in ('refund_approved','refund_declined','refund_recorded') and profile_role not in ('admin','super_admin')
    then raise exception 'Only an administrator can review or record a refund'; end if;

  -- Serialise changes for a booking so two staff cannot approve or log the same refund.
  select * into b from public.family_retreat_bookings where id = p_booking_id for update;
  if not found then raise exception 'Booking not found'; end if;
  p_note := nullif(btrim(p_note), '');
  p_reference := nullif(btrim(p_reference), '');
  if length(p_note) > 1000 then raise exception 'Notes must be 1,000 characters or fewer'; end if;
  if p_action in ('link_sent','payment','refund_requested') and
    (p_amount is null or p_amount < 1 or p_amount > 10000000)
    then raise exception 'Enter a valid amount in pounds'; end if;
  if p_action in ('payment','refund_recorded') and
    (p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9 ./_-]{1,99}$' or
      p_occurred_on is null or p_occurred_on > today or p_occurred_on < (b.created_at at time zone 'Europe/London')::date)
    then raise exception 'Enter a valid provider reference and transaction date'; end if;
  if p_action in ('contacted','link_sent','payment') and b.status in ('archived','declined')
    then raise exception 'This booking is no longer active'; end if;

  select coalesce(sum(amount_pence) filter (where action = 'payment'),0),
         coalesce(sum(amount_pence) filter (where action = 'refund_recorded'),0)
    into verified_pence, refunded_pence from public.family_retreat_tracker where booking_id = p_booking_id;
  -- Old checkout reconciliation already records received money on the booking.
  -- Do not add that total to manual receipts, which could count the same transaction twice.
  verified_pence := greatest(verified_pence, round(coalesce(b.amount_paid,0) * 100)::bigint);

  if p_action = 'link_sent' and not exists (
    select 1 from public.family_retreat_tracker where booking_id = p_booking_id and action = 'contacted'
  ) then raise exception 'Mark the family as spoken to first'; end if;
  if p_action = 'payment' then
    if b.stripe_payment_link_id is not null or b.nowdonate_payment_url is not null or coalesce(b.amount_paid,0) > 0 or b.payment_status = 'paid'
      then raise exception 'Use the existing payment reconciliation for this booking'; end if;
    if not exists (select 1 from public.family_retreat_tracker where booking_id = p_booking_id and action = 'link_sent')
      then raise exception 'Log the payment link first'; end if;
  end if;

  if p_action in ('refund_requested','refund_approved','refund_declined','refund_recorded') then
    select * into pending_refund from public.family_retreat_tracker
      where booking_id = p_booking_id and action = 'refund_requested' order by id desc limit 1;
    if pending_refund.id is not null then
      select action into refund_status from public.family_retreat_tracker
        where request_id = pending_refund.id order by id desc limit 1;
      refund_status := coalesce(refund_status, 'refund_requested');
    end if;
    if p_action = 'refund_requested' then
      if refund_status in ('refund_requested','refund_approved') then raise exception 'A refund is already in progress'; end if;
      if p_note is null then raise exception 'Enter a reason for the refund'; end if;
      if p_amount > verified_pence - refunded_pence then raise exception 'Refund exceeds the remaining verified payment'; end if;
      p_request_id := null;
    else
      if pending_refund.id is null or p_request_id is distinct from pending_refund.id
        then raise exception 'This refund request has changed; reload the booking'; end if;
      if p_action = 'refund_recorded' and refund_status <> 'refund_approved'
        then raise exception 'Approve the refund before recording it'; end if;
      if p_action in ('refund_approved','refund_declined') and refund_status <> 'refund_requested'
        then raise exception 'This refund has already been reviewed'; end if;
      p_amount := pending_refund.amount_pence;
      if p_action <> 'refund_declined' and p_amount > verified_pence - refunded_pence
        then raise exception 'Refund exceeds the remaining verified payment'; end if;
    end if;
  else
    p_request_id := null;
  end if;
  if p_action not in ('payment','refund_recorded') then p_reference := null; p_occurred_on := null; end if;
  if p_action = 'contacted' then p_amount := null; end if;
  insert into public.family_retreat_tracker (booking_id, action, amount_pence, note, reference, occurred_on, request_id, actor_id, actor_name)
    values (p_booking_id, p_action, p_amount, p_note, p_reference, p_occurred_on, p_request_id, p_actor,
      coalesce(nullif(btrim(staff_name), ''), 'Staff member'))
    returning id into inserted_id;
  return inserted_id;
exception when unique_violation then
  raise exception 'That provider reference has already been recorded';
end;
$$;
revoke all on function public.record_family_retreat_tracker(uuid,text,uuid,integer,text,text,date,bigint) from public, anon, authenticated;
grant execute on function public.record_family_retreat_tracker(uuid,text,uuid,integer,text,text,date,bigint) to service_role;

commit;
