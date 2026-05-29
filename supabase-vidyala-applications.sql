-- Vidyala Applications Table
-- Run this in Supabase SQL Editor

create table if not exists vidyala_applications (
  id                              bigserial primary key,
  initiative_id                   uuid references initiatives(id),

  -- Personal details
  first_name                      text not null,
  middle_name                     text,
  last_name                       text not null,
  date_of_birth                   date not null,
  email                           text not null,
  phone                           text not null,
  address                         text not null,

  -- Photo ID
  id_document_url                 text,

  -- DBS check
  has_dbs_check                   boolean default false,
  dbs_certificate_url             text,

  -- Emergency contacts
  emergency_contact_1_name        text not null,
  emergency_contact_1_relationship text not null,
  emergency_contact_1_phone       text not null,
  emergency_contact_2_name        text,
  emergency_contact_2_relationship text,
  emergency_contact_2_phone       text,

  -- Sikhi journey
  is_amritdhari                   boolean,
  sikhi_journey                   text,
  english_ability                 text,
  panjabi_ability                 text,

  -- Commitment & practical
  can_commit                      boolean,
  funding_option                  text,
  accommodation_option            text,

  -- Visa
  requires_visa                   boolean default false,
  requires_visa_support           boolean default false,

  -- Additional questions
  motivation                      text,
  current_seva                    text,
  what_to_learn                   text,
  continue_parchaar               boolean,
  how_heard                       text,

  -- Tracking
  page_url                        text,
  source                          text,
  medium                          text,

  -- Admin
  status                          text not null default ''pending'',
  internal_notes                  text,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

-- Enable RLS
alter table vidyala_applications enable row level security;

-- Service role can do everything
create policy "Service role full access"
  on vidyala_applications
  for all
  to service_role
  using (true)
  with check (true);

-- Indexes
create index if not exists vidyala_applications_email_idx on vidyala_applications(email);
create index if not exists vidyala_applications_status_idx on vidyala_applications(status);
create index if not exists vidyala_applications_created_at_idx on vidyala_applications(created_at desc);

-- Auto-update updated_at
create or replace function update_vidyala_applications_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_vidyala_applications_updated_at on vidyala_applications;
create trigger set_vidyala_applications_updated_at
  before update on vidyala_applications
  for each row execute function update_vidyala_applications_updated_at();
