# Devanhaar CMS: incremental rollout

## First change: blog authorization

Base: `ef0e75618e0521b007a816ecd3f41505bfdab0dd` (main, inspected 20 October 2026).

All four blog mutation endpoints now use one server-only access check before
constructing a service-role client. The check verifies the authenticated user,
requires an existing staff/admin/super_admin profile, and requires a successful
programme assignment lookup with no assigned programmes. This matches the
current general-staff dashboard boundary: programme assignments restrict an
account regardless of its underlying profile role.

Missing profiles, auth failures, unknown roles, programme restrictions and
failed database lookups deny access. Existing general staff retain their current
blog save, publish, delete and cover removal behavior.

This change contains no database migration, public page changes, role edits,
content migration, new environment variables or automatic cleanup. Tests use
mocked auth/database/storage boundaries and never contact a live service.

Run with Node 24: `node --test scripts/test-blog-access.mjs`.

Validation for this slice:

- 57 blog access tests pass, exercising all four real route handlers against
  mocked service boundaries. CI now runs this suite before the existing build.
- 25 existing registration-window, SPA and handoff tests pass.
- TypeScript checking of the changed routes, shared guard and their imports passes.
- The full-project type check reports existing JSX syntax errors in the unchanged
  `lib/events-data.ts` file. The build configuration already ignores type errors.
- The local production build cannot finish because `next/font` cannot download
  Inter from Google Fonts in this environment. No font or build settings changed.
- The separate SPA workbook import test requires `SPA_WORKBOOK_PATH` and
  `SPA_LIVE_STATE_PATH` fixture inputs, which are unavailable here; it was not
  validated. No live database was used to manufacture those fixtures.

This is an API guard, not a complete database policy audit. Generic image writes,
direct Data API access and all other operational routes need separate review.
Do not claim that the full CMS permission model is implemented by this change.

## Next: separate draft and live versions

The existing blog stores draft/published status on one row. Leave that storage
and all public readers unchanged until the replacement workflow is verified.

1. Inspect deployed schema and policies read-only; confirm backups and a separate
   development database before exercising migrations or content writes.
2. Build additive content/revision/assignment tables in that development database.
   Reuse existing programme restrictions rather than widening their access.
3. Keep draft revisions private. Public readers must resolve only an explicitly
   published revision; authenticated previews must also enforce assignments.
4. Publish atomically, with expected-revision checks to prevent concurrent edits
   overwriting each other, and record publisher/time/activity.
5. Render previews through the same components as the public page. Support the
   desktop/tablet/mobile viewports without publishing first.
6. Pilot one project page (SFI). Preserve its current URL, content and renderer
   as the fallback until the new published record has been verified.
7. Verify draft edits leave live text, SEO, URLs and images unchanged; test
   assignments through direct API requests as well as navigation.
8. Expand to homepage/projects/events only after the pilot passes.

## Review and release

Keep this work on a feature branch and draft PR. A Vercel preview may share
production credentials: do not save, publish, delete, upload or run cleanup there
until its database/storage isolation has been verified. Unit tests are safe to
run without credentials. Do not run production migrations or merge automatically.

Before release, verify legitimate general-staff profiles and programme
assignments read-only so a data configuration issue does not become a surprise
lockout. Smoke-test a general staff account and a programme-restricted account
against an isolated environment. Main/production remain unchanged by the PR.

Rollback of this first slice is a code revert, with no schema rollback required;
reverting also restores the old authorization weakness, so prefer a forward fix.
