-- ============================================================================
-- SPN (Sikh Professionals Network) submissions
-- ----------------------------------------------------------------------------
-- Receives Join / Advisor / Grad Award / Event submissions from the SPN
-- website (sikhpn.org) via POST /api/spn-submissions. Mirrors the
-- vidyala_applications approve/decline pattern so the Devanhaar dashboard can
-- review SPN applicants with the same Approve/Decline + email flow.
--
-- ADDITIVE: this script only CREATEs a new table. It does not alter, drop, or
-- touch any existing table, data, policy, or initiative. Safe to run once in
-- the Supabase SQL editor.
--
-- The 'spn' initiative is already seeded in supabase-schema.sql, so the API
-- route resolves it by slug and stamps initiative_id here — making SPN rows
-- group under the existing "SPN" dashboard tab.
-- ============================================================================

create table if not exists spn_submissions (
  id                bigserial primary key,
  initiative_id     uuid references initiatives(id),

  -- 'join' | 'advisor' | 'grad_award' | 'event'
  submission_type   text not null default 'join',

  -- Common contact fields (surfaced as dashboard columns)
  first_name        text,
  last_name         text,
  email             text not null,
  phone             text,

  -- All form-type-specific fields (profession, industry, city, linkedin,
  -- sector, role, motivation, event_name, attending_as, etc.) live here.
  form_data         jsonb not null default '{}'::jsonb,

  -- Mailing-list opt-in captured on the Join/Newsletter forms
  newsletter_opt_in boolean default false,

  -- Admin workflow: pending | in_review | approved | declined | archived
  status            text not null default 'pending',
  internal_notes    text,

  -- Tracking
  page_url          text,
  source            text,
  medium            text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Row Level Security: only the service role (used by the API route and the
-- dashboard server actions) can read/write. No public/anon access.
alter table spn_submissions enable row level security;

drop policy if exists "Service role full access" on spn_submissions;
create policy "Service role full access"
  on spn_submissions
  for all
  to service_role
  using (true)
  with check (true);

-- Indexes
create index if not exists spn_submissions_email_idx       on spn_submissions(email);
create index if not exists spn_submissions_status_idx      on spn_submissions(status);
create index if not exists spn_submissions_type_idx        on spn_submissions(submission_type);
create index if not exists spn_submissions_created_at_idx  on spn_submissions(created_at desc);

-- Auto-update updated_at on every row update
create or replace function update_spn_submissions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_spn_submissions_updated_at on spn_submissions;
create trigger set_spn_submissions_updated_at
  before update on spn_submissions
  for each row execute function update_spn_submissions_updated_at();
