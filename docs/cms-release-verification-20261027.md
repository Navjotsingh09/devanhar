# Release verification — 27 October 2026

Application changes and the 55-scenario full-admin acceptance pack are on PR 66. This record is not production sign-off.

## Checks executed

- 24 offline regression files: 653 passed, zero failed. The optional SPA workbook import test is explicitly excluded because its source workbook is unavailable.
- Production database rollback-only article workflow: create draft, publish, create another draft, restore a historical revision into a new draft, preserve the live article, reject stale restoration, reject a foreign article revision, record restoration activity, publish the restored draft, deny unauthenticated restoration and verify anonymous RPC restrictions. All assertions completed without error.
- After rollback: zero retained `history-check-*` or `history-other-*` articles.
- Current production role inventory: two Super Admins, four staff, one disabled profile; no Admin or Content Manager profile exists. No profile, account or grant was changed for this verification. Code-level role fixtures cover Admin and Content Manager separately; they are not real browser sessions.

## Remaining gates

Automatic approval review rejected `cms-insights-delegation.sql` again. Its exact reason was: this production mutation persistently changes schema, RLS policies, grants and publishing functions, and the exact access-control mutation has not received explicit approval. No workaround or indirect application was attempted. Article assignments, article permission RPCs and article/project column remain uninstalled.

The prepared Insights delegation SQL test has NOT run because its migration is absent. Authenticated browser acceptance has NOT run because the staff session expired and prior credential requests were declined. Do not substitute SQL impersonation or offline role fixtures for a signed-in browser test. Production release remains pending these checks.

The next required authorisation is specific approval to apply `docs/cms-insights-delegation.sql` to production Supabase project `kawjcikusbqqxyczibul`, including its schema, RLS policy, grant and guarded publishing/restoration function changes. The script creates no staff assignments. After approval, apply the exact reviewed SQL, run its rollback-only delegation checks, complete authenticated acceptance, and release the verified commit.
