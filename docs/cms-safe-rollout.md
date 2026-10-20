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

## SFI editor pilot

The CMS branch now includes `/dashboard/website/sfi`, `/cms-preview/sfi` and
`/api/cms/sfi`. The existing SFI layout is extracted into one shared renderer.
The initial JSON content preserves all five event cards, six FAQs, original
wording, links, image paths, styles and donation URLs. Editable fields cover the
hero, events, FAQs, SEO, and the order/visibility of the four body sections.
The Why SFI and community section copy remains in the renderer for this pilot.

Read-only inspection found existing, empty `cms_pages`, `cms_page_revisions`
and `cms_page_assignments` tables and the `cms_create_page` RPC. This pilot
reuses them. It does not run schema migrations or create/modify any content
until an authorised editor explicitly saves a draft.

The public SFI page reads only `published_revision_id`, with the original page
as fallback when no published CMS content is present or data is unavailable.
The preview requires a verified user and page access; it never publishes.
Public metadata uses the same published content selection. Both long-route
aliases and `/sfi` retain the shared page renderer.

For this pilot, unscoped admins/super admins can edit and publish. Unscoped
Content Managers need an existing explicit page assignment with the relevant
view/edit/publish flags. Programme operators and ordinary staff are not
automatically granted website editing access. Content Managers without access
do not see the SFI editor in navigation. Assignment administration, broader
content types and programme-editor delegation are separate follow-up work.

The API validates structured content and same-origin requests before writes.
It creates immutable draft snapshots, then compares BOTH current draft and
published pointers in the database update. Stale/concurrent changes return 409.
Publishing advances only to the saved draft and clears its draft pointer; a
new draft leaves the published pointer untouched. The published pointer is
authoritative, not the legacy revision status column. History labels therefore
derive from those pointers. Older snapshots remain available in history.

The API uses the existing server-only service key after verified session/role/
assignment checks. It does not widen database grants. Existing CMS RPCs and RLS
are outside this new API boundary and still need a dedicated audit, including
the existing public security-definer RPCs and authenticated TRUNCATE grants.
Do not describe this pilot as completion of the CMS database security review.

A compare-and-swap failure after inserting a revision can leave an unattached
revision in history. It cannot become public through this workflow. The
auxiliary activity log is best effort; snapshots and current pointers are the
source of truth. Atomic audit logging and history restoration remain follow-up
work. The editor currently lists the last 20 revisions but does not restore or
delete them.

Validation: 21 additional tests exercise the real content model, server access
layer and API with isolated database/auth mocks. They cover draft/live
separation, missing/failed data, invalid links, assignments, stale saves,
concurrent pointer changes, publishing, initial creation, and request origin.
A render regression test compares original and extracted public text, links,
image sources and alt text. Targeted TypeScript checks pass. Authenticated
browser save/publish tests against the deployed database are still required;
no live content should be changed merely to obtain a passing test result.

The `.vercel.app` hostname is assigned to this CMS branch, while the charity's
custom domains stay on main/production. This separates code deployments; it
does not imply a separate database. Avoid test publications/uploads there.

## Whole Devanhaar scope and dashboard recovery

The rollout covers the overall Devanhaar website and CRM. SFI remains the first
page-editor pilot, not the project boundary. `/dashboard/website` is the central
entry point to existing tools. `/dashboard/website/pages` lists 41 canonical
content pages and distinguishes existing management tools, the SFI editor and
pages still managed in code. Alias routes, transactional screens and individual
records are excluded. This inventory does not imply that other page editors exist.

| Area | Current foundation | Remaining work |
| --- | --- | --- |
| Staff access | Supabase Auth, staff profiles, programme restrictions | Recovery routing repaired; signed-in end-to-end check still required |
| CRM operations | Submissions, emergency requests, recruitment, registrations, programme tools | Evaluate individual workflows with staff; retain existing records and scopes |
| Content | Existing blog and images; first SFI revision editor | Connect other page templates, shared navigation/footer and reusable sections |
| Commerce | Existing products, orders and payment tools | Assess requested workflow improvements separately from content editing |
| Publishing | Existing CMS tables, immutable revisions, explicit publishing in SFI | Extend page-by-page, with permissions, preview and public-render regression checks |

Assessment: an incremental extension is supported by the current backend; a
replacement CRM or database is not established as necessary. Site-wide editing
still represents substantial template and workflow work. Do not describe a hub
and inventory as completion of that work.

Dashboard recovery removes the unconditional signed-in `/auth` redirect that
could loop when the dashboard rejects the same session, keeps password recovery
reachable, forwards refreshed request cookies and preserves them on redirects.
Signed-out deep links retain a validated local dashboard return destination.
Access lookup failures remain fail-closed, with a recoverable message for browser
navigation and 503 for APIs. Existing programme/domain restrictions remain.
Nine regression tests exercise these paths using the actual middleware and
NextRequest/NextResponse, with mocked auth and assignment lookups. They do not
replace verification with a real authenticated account.
