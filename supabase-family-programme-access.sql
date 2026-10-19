begin;
alter table public.staff_programme_access drop constraint staff_programme_access_programme_check;
alter table public.staff_programme_access add constraint staff_programme_access_programme_check check(programme in ('kaurs','vidyala','newsletter','family'));
insert into public.staff_programme_access(programme,user_id) select 'family',id from auth.users where lower(email)='daljit.kaur@devanhaar.com'
on conflict(programme) do update set user_id=excluded.user_id;
update public.admin_profiles set full_name='Daljit Kaur' where id=(select id from auth.users where lower(email)='daljit.kaur@devanhaar.com');
create table if not exists public.family_retreat_bookings (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 first_name text not null,last_name text not null,email text not null,phone text not null,city text,postcode text,country text,
 children_attending jsonb not null default '[]',adults_attending jsonb,
 accommodation_preference text,dietary_requirements text,medical_requirements text,
 emergency_contact_name text,emergency_contact_relationship text,emergency_contact_phone text,heard_about_retreat text,additional_notes text,
 consent_email boolean not null default false,consent_whatsapp boolean not null default false,consent_privacy boolean not null default false,
 consent_authority boolean not null default false,consent_health boolean not null default false,consent_photography boolean not null default false,consent_marketing boolean not null default false,
 page_url text,source text,medium text,status text not null default 'pending',internal_notes text,reviewed_at timestamptz,
 amount_due numeric,amount_paid numeric,payment_status text not null default 'unpaid',paid_at timestamptz,
 stripe_payment_link text,stripe_payment_link_id text,nowdonate_payment_url text,nowdonate_payment_reference text,
 booking_device text not null default 'unknown' check(booking_device in ('mobile','tablet','computer','unknown')),payment_reminder_sent_at timestamptz
);
create table if not exists public.family_initiative_bookings (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 event_name text not null,event_date date,contact_name text not null,email text not null,phone text not null,
 children_attending jsonb not null default '[]',adults_attending jsonb not null default '[]',
 travel_option text check(travel_option in ('door','transport')),pickup_details text,medical_allergy_information text,estimated_total_pence integer,
 consent_privacy boolean not null default false,page_url text,status text not null default 'pending',internal_notes text,
 payment_status text not null default 'unverified',paid_at timestamptz,payment_reminder_sent_at timestamptz,
 booking_device text not null default 'unknown' check(booking_device in ('mobile','tablet','computer','unknown'))
);
alter table public.family_retreat_bookings enable row level security;
alter table public.family_initiative_bookings enable row level security;
revoke all on public.family_retreat_bookings,public.family_initiative_bookings from anon,authenticated;
grant select,insert,update,delete on public.family_retreat_bookings,public.family_initiative_bookings to authenticated;
grant all on public.family_retreat_bookings,public.family_initiative_bookings to service_role;
create policy family_programme_owner on public.family_retreat_bookings for all to authenticated
 using(staff_private.can_access_programme('family')) with check(staff_private.can_access_programme('family'));
create policy family_programme_owner on public.family_initiative_bookings for all to authenticated
 using(staff_private.can_access_programme('family')) with check(staff_private.can_access_programme('family'));
create or replace function staff_private.classify(initiative uuid,camp_name text,details jsonb) returns text language sql stable security definer set search_path='' as $$
 select case
 when camp_name ilike 'vidyala%' or exists(select 1 from public.initiatives where id=initiative and slug='sikhi-vidyala')
 or concat_ws(' ',details->>'source_page',details->>'subject') ~* '(vidyala|vidyalaya)' then 'vidyala'
 when camp_name ilike 'kaurs%' or exists(select 1 from public.initiatives where id=initiative and slug like 'kaurs%')
 or concat_ws(' ',details->>'source_page',details->>'subject') ~* 'kaurs' then 'kaurs'
 when concat_ws(' ',details->>'source_page',details->>'subject') ~* 'newsletter' then 'newsletter'
 when camp_name ~* '(family|wedding|extravaganza)' or exists(select 1 from public.initiatives where id=initiative and slug ~ '(family|wedding)')
 or concat_ws(' ',details->>'project',details->>'source_page',details->>'subject') ~* '(family|wedding fair|extravaganza)' then 'family'
 else null end;
$$;
create or replace function staff_private.record_programme(source_table text,record_id text) returns text language sql stable security definer set search_path='' as $$
 select case
 when source_table in ('vidyala_application','vidyala_applications') then 'vidyala'
 when source_table in ('newsletter_subscription','newsletter_subscriptions') then 'newsletter'
 when source_table in ('family_retreat_booking','family_retreat_bookings','family_initiative_booking','family_initiative_bookings') then 'family'
 when source_table in ('camp_application','camp_applications') then (select staff_private.classify(initiative_id,null,null) from public.camp_applications where id::text=record_id)
 when source_table in ('form_submission','form_submissions') then (select staff_private.classify(initiative_id,null,form_data) from public.form_submissions where id::text=record_id)
 when source_table='register_interest' then (select staff_private.classify(null,camp,null) from public.register_interest where id::text=record_id)
 else null end;
$$;
commit;