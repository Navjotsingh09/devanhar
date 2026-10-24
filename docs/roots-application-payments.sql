-- Apply ONCE after roots-application-decisions.sql in the EXISTING project.
-- This adds staff-verified payments. It does not connect a provider API.
begin;

create table public.roots_application_payments (
  submission_id uuid primary key references public.roots_form_submissions(id),
  provider_reference text not null check (length(btrim(provider_reference)) between 2 and 100),
  amount_pence integer not null check (amount_pence between 5000 and 1000000),
  paid_on date not null,
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now()
);
create unique index roots_application_payment_reference_unique
  on public.roots_application_payments(lower(btrim(provider_reference)));
alter table public.roots_application_payments enable row level security;
revoke all on public.roots_application_payments from anon, authenticated;
grant select on public.roots_application_payments to authenticated;
grant all on public.roots_application_payments to service_role;
create policy roots_application_payments_staff_read on public.roots_application_payments
  for select to authenticated using ((select public.roots_forms_can_manage()));

create function public.record_roots_application_payment(
  p_form_id uuid, p_submission_id uuid, p_reference text,
  p_amount_pence integer, p_paid_on date, p_actor uuid
) returns void language plpgsql security definer set search_path = '' as $$
declare
  application public.roots_form_submissions%rowtype;
begin
  if p_actor is null or not exists(select 1 from auth.users where id = p_actor) then
    raise exception 'invalid_actor';
  end if;
  if p_reference is null or btrim(p_reference) !~ '^[A-Za-z0-9][A-Za-z0-9 ./_-]{1,99}$'
    or p_amount_pence is null or p_amount_pence < 5000 or p_amount_pence > 1000000
    or p_paid_on is null or p_paid_on > (now() at time zone 'Europe/London')::date then
    raise exception 'invalid_payment';
  end if;
  select s.* into application from public.roots_form_submissions s
    join public.roots_forms f on f.id = s.form_id
    where s.id = p_submission_id and s.form_id = p_form_id
      and f.slug = 'roots-residential-camp-registration' for update of s;
  if not found then raise exception 'application_not_found'; end if;
  if application.record_state <> 'active' or application.decision_status <> 'accepted'
    or application.payment_state = 'paid' or application.decision_email_state = 'pending'
    then raise exception 'application_not_payable'; end if;
  if p_paid_on < (application.created_at at time zone 'Europe/London')::date then
    raise exception 'payment_before_application';
  end if;
  insert into public.roots_application_payments
    (submission_id, provider_reference, amount_pence, paid_on, verified_by)
    values (p_submission_id, btrim(p_reference), p_amount_pence, p_paid_on, p_actor);
  update public.roots_form_submissions set payment_state = 'paid',
    amount_pence = p_amount_pence, currency = 'gbp', payment_environment = 'live'
    where id = p_submission_id and form_id = p_form_id;
end;
$$;
revoke all on function public.record_roots_application_payment(uuid,uuid,text,integer,date,uuid) from public, anon, authenticated;
grant execute on function public.record_roots_application_payment(uuid,uuid,text,integer,date,uuid) to service_role;
commit;

-- Only the permission-checked server endpoint can write. Payment references
-- cannot be reused across applications. Updates to payment status and the
-- verification record are atomic. No rows are deleted or silently overwritten.
-- Staff must verify the COMPLETED payment in Donation Manager, including
-- amount, the application reference in Your Message, and the unique provider
-- payment reference. Never mark paid based on a screenshot or checkout visit.
-- Existing paid records without this audit remain "Paid" but must not be
-- described as staff-verified. Corrections/refunds need administrator review;
-- this UI intentionally cannot erase verification history or invent refunds.
