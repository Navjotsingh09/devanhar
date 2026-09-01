# Supabase Recovery Runbook

## Source of Truth

- Production database: `DEVANHAAR1` under Navjotsingh09's Org on the Pro plan.
- Production site credentials are stored only in Vercel environment variables.
- Do not commit credentials, database exports, email exports, payment exports, or uploaded documents.
- Keep the recovery ticket for the original project open until Supabase confirms whether data can be restored.

## Backup Routine

1. Confirm the Pro-plan backup status in Supabase Database > Backups every week.
2. After any high-volume event or important release, export the affected dashboard table as a CSV and store it in the team's approved private storage.
3. Each month, export an offline copy of the business records from Stripe, Donation Manager, Resend, ClickUp, and Mailchimp.
4. Keep recovery exports in private storage with date and source in the filename. Never add them to this repository.
5. Keep at least two people as Supabase organization Owners and Vercel project Administrators.

## Before Changing Production

1. Create a preview deployment for code changes where possible.
2. Confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` point to the intended project in Vercel.
3. Never replace production credentials or switch projects without explicit approval.
4. Never run destructive SQL against a non-empty database without a current backup and explicit approval.

## After Database or Form Changes

1. Run the relevant SQL migration once only and record the query name in Supabase SQL Editor.
2. Test one safe form submission for the changed workflow.
3. Confirm its full submitted data appears in the appropriate staff dashboard.
4. Confirm the notification/payment path and any document upload path required by that form.
5. Delete only clearly labelled test data after verification.

## Recovery Rules

- Import recovered data only from a known source export.
- Preserve original provider IDs, timestamps, and source names when importing recovered data.
- Do not invent missing form fields. Store partial records as recovered evidence until a fuller source is available.
- Keep recovered payment evidence in `recovery_payment_ledger` until it can be safely reconciled with a complete application or booking.
- Recovered records must be visible in the staff dashboard under their relevant workflow and visibly marked as recovered.

## Staff Authentication

- Auth users live inside the active Supabase project and do not transfer automatically between projects.
- Create staff users with `@devanhaar.com` addresses in Supabase Authentication > Users.
- Maintain the Site URL and approved redirect URLs in Authentication > URL Configuration for `devanhaar.vercel.app`, `devanhaar.com`, and `www.devanhaar.com`.
