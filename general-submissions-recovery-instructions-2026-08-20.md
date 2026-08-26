# General Submissions Recovery

This manifest lists 51 General Submission IDs deleted from the production Supabase database.

Recovery procedure:
1. Restore a Supabase backup to a temporary project. To recover every listed row, use a backup from before 2026-04-30T17:04:33Z.
2. Export the temporary project rows from public.form_submissions where id appears in the attached CSV manifest.
3. Compare those IDs with production. They should all be absent from production.
4. Insert only the recovered rows into production public.form_submissions. Do not restore the full backup over production.
5. Verify exactly 51 rows were inserted and that the dashboard General / Contact tab shows them.

The current production database was not changed while producing this manifest.
