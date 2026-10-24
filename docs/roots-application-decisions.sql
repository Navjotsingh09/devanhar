-- Apply after the Roots form-builder and docs/roots-response-actions.sql setup.
-- Additive only: existing responses, payment records and answers are retained.
alter table public.roots_form_submissions
  add column decision_status text not null default 'pending'
    check (decision_status in ('pending','accepted','declined')),
  add column decision_revision integer not null default 0,
  add column decision_at timestamptz,
  add column decision_by uuid references auth.users(id) on delete set null,
  add column decision_email_state text not null default 'not_sent'
    check (decision_email_state in ('not_sent','pending','sent','failed')),
  add column decision_email_id text,
  add column decision_email_sent_at timestamptz;

-- Writes are server-only, after the existing Roots staff permission check.
-- Do not grant these columns to anonymous or authenticated browser clients.
--
-- Deployment checks:
-- 1. Apply this once to the existing shared Supabase project before releasing
--    the form-response decision controls. Do not rerun a successful query.
-- 2. Verify the existing Resend configuration and sender-domain verification
--    in Vercel; do not expose or commit credentials.
-- 3. Use a safe staff-owned test application to verify both decision emails.
--    Check the saved decision, delivery status, reference and full answers.
-- 4. The acceptance email uses the supplied NowDonate checkout unchanged.
--    Query parameters tested on that checkout did not prefill its amount or
--    reference. The email therefore states GBP 50 and asks families to include
--    their application reference in "Your Message" after choosing "Yes" under
--    "Would you like to add a Message?". Verify the provider checkout separately.
--    Successful Roots applications show an on-page confirmation dialog, reset
--    the form for another child, and do not start a checkout or imply acceptance.
-- 5. Resend's idempotency key reduces duplicate sends for retries within its
--    retention window; it is not a permanent exactly-once delivery guarantee.
--    "sent" here means accepted by the provider, not delivered to an inbox.
-- 6. This does not add NowDonate settlement reconciliation. Verify payments
--    with the provider before marking them paid; do not charge on application.
