# SPA Ranking V2 — Devanhaar admin handover

Primary admin URL: /dashboard/padel

## Screens
- /dashboard/padel — management overview + existing registrations
- /dashboard/padel/players — approved player records and nationality codes
- /dashboard/padel/tournaments — events, available finishing stages, public event flags
- /dashboard/padel/results — select event to record results
- /dashboard/padel/tournaments/:id/results — player results and performance metrics
- /dashboard/padel/rankings — calculated six-level leaderboard, parity checker
- /dashboard/padel/identities — duplicate-looking player identity review

Public: /spa, /spa/leaderboard, /spa/tournaments, /spa/leaderboard/:playerId

## Database prerequisites — manual, NOT automatically applied on Vercel

Verify the linked Supabase project matches the production NEXT_PUBLIC_SUPABASE_URL.

1. Confirm base tables exist from `supabase-padel-leaderboard.sql`.
2. Apply `supabase-padel-ranking-v2.sql` to add `country_code`, match stats
   and integrity checks. Only two approved players should receive NO nationality
   by default; verify against player IDs.
3. Apply `supabase-padel-live-tournament.sql` if the event publishing fields
   are missing. Review the live tournament and registrations migrations in
   the correct order.
4. Review `supabase-padel-staff-rls-v2.sql` with a database backup before
   applying it: it restricts RLS writes to authorised staff profiles.

## Strict release acceptance gate

- Import the **approved** 99-player spreadsheet and Developer Notes from their
  source, and confirm player identities manually. Do not assume two equal names
  always mean the same person. Do not assume alternate spellings are distinct.
- Use the admin Parity Checker with Rank, Player, Points columns.
- Require exact 99 names, exact points and exact ranks; resolve every mismatch.
- Confirm nationality is stored on player records: GB by default, NO for
  Gagandeep Singh Lally and the verified partner Manpreet.
- Enter/check tournament match wins, matches played, group points won/possible.
  Win percentages and six tie-break levels are calculated, not manually edited.
- Confirm public leaderboard and profile pages update after saving corrected
  results. Reopen the event and ensure submitted stats persist.
- Ensure staff-only writes are enforced at both the server-action level and by
  Supabase row-level security.
- Verify fresh, identical data across devanhaar.com and devanhaar.vercel.app.
- Test logged-out requests and a vacancies-only account (read/write denied).

## Known limitations before final sign-off

- This repository does NOT contain the approved spreadsheet or Developer Notes
  necessary to verify or import all 99 real rankings.
- Vercel deployment does not apply SQL migrations to Supabase.
- The existing multi-step results write and ranking snapshot save is not yet
  a single Postgres transaction; partial writes on database failure remain
  a risk. An RPC-based transactional finalisation flow is recommended before
  using this as the source of official championship standings.
- The parity checker is a read-only **in-browser** comparison. Passing its
  comparison does not mark the public leaderboard officially verified.
- Tournament deletion is blocked when it has results to prevent cascading
  loss of ranking points.
