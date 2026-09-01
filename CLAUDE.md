# Devanhaar Supabase Recovery Instructions

## Current Incident

- The original production Supabase project `igkpvudaqxkncxgslbvb` is unavailable and must not be treated as recoverable until Supabase Support confirms its status.
- The replacement project is `DEVANHAAR1` under Navjotsingh09's Org. It is on the Pro plan.
- Preserve all existing recovery evidence. Do not delete or overwrite Stripe exports, Resend exports, inbox records, ClickUp records, Mailchimp data, or Supabase-support correspondence.
- A new database does not contain historical submissions, Auth users, or Storage files. Do not imply that it does.

## Security

- Never request, print, commit, or place API keys, service-role keys, database passwords, access tokens, or CSVs containing personal data in source control or chat.
- Environment variables are managed in Vercel. The Supabase variables are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Do not change production environment variables without explicit user confirmation.

## Replacement Database

- The base script is `supabase-schema.sql`; run it first in the new project's Supabase SQL Editor.
- Run feature migrations in dependency order. Do not run root SQL files alphabetically or at random.
- Do not rerun a successful SQL query. Some scripts use `CREATE POLICY` without `IF NOT EXISTS`, so a second execution fails with a duplicate-policy error even when the table already exists.
- `supabase-roots-bookings 2.sql`, `supabase-vidyala-interest 2.sql`, and other numbered duplicate files are alternate copies; do not run them after their unnumbered counterpart.
- `supabase-security-fixes.sql` is empty.
- The Family Retreat scripts alter `family_retreat_bookings` but the repository does not contain a reliable base `CREATE TABLE` migration. Do not run any `supabase-family-retreat-*.sql` file until the missing table definition has been reconstructed and reviewed.
- Wolf Run migrations must run in their timestamp order. The `20260817130000_wolfrun_delete_unpaid_entries.sql` migration is destructive for non-empty databases; only run it when the database is confirmed empty or with explicit approval.

## Recovery and Validation

- After schema setup, recreate staff users in Supabase Auth. Existing passwords and Auth users cannot be migrated from the missing project.
- Recreate Storage buckets and policies before enabling document-upload forms.
- Validate with one staff login, one safe test submission per form type, a dashboard read, and a file-upload flow before reopening all public forms.
- Keep the Supabase recovery ticket active. If the original project is restored, decide explicitly whether to switch back or import recovered data into the replacement.
