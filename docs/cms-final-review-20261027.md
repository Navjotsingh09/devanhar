# CMS release reconciliation — 27 October 2026

The pasted audit reviewed main before PR 66 was merged. It did not include the completion implementation already on feat/cms-completion. No scope percentage is used as an acceptance result.

| Requirement | Implementation | Verification / remaining boundary |
| --- | --- | --- |
| Homepage, SFI and existing pages | 39 additional canonical page editors preserve the existing React layouts, with copy, links/media, metadata, draft/live isolation, actual-page responsive previews and history. Custom pages use reusable sections. | Automated content/schema/renderer checks pass. Roots is reconciled with main's newer Boots Camp/residential wording, application tracker and decisions. Its field manifest and default SEO match the newer source. |
| Drafts | A dedicated bounded workspace combines assigned page, structured-content and eligible article drafts, saved draft titles, state, editor and preview links. | Scope denial and 25-row-per-type pagination tests pass. |
| Projects/events/notices/FAQs | Existing structured schemas, assignment-aware editors, schedules and public renderers retained. | Existing regression checks pass; no schema changes needed for this increment. |
| Media library | Signed uploads, images/video/PDF/DOCX/text, search, metadata/folders, picker, stable reusable links, replacement versions, archive/restore and usage checks. | Metadata columns and public bucket exist. API/unit checks pass. Logged-in upload acceptance still needs a staff browser session. |
| Navigation/branding | Revisioned navigation/footer/organisation settings; logos/favicon, colour/font/button/radius controls, saved previews and publication. Critical branding/default SEO is Super Admin only. | Database draft/live transaction and fresh role-boundary tests pass. Existing defaults preserve Devanhaar styling. |
| SEO | Page/project/event/social SEO and website defaults; dedicated overview links to their authoritative editors. | Existing metadata features implemented. New Insights metadata is prepared but gated pending its rejected database migration. |
| Insights | Existing single article draft/publish/history/preview/archive tool retained. Prepared SEO/social fields, featured related-article flag and internal programme/event links join the same revision body. | Auto-review rejected cms-article-metadata.sql: one additive JSON column plus metadata propagation in the existing guarded publishing/restoration functions. It was NOT applied. Controls stay disabled; API refuses unsupported metadata before writing. Existing article save/publish bodies remain compatible with the current functions. |
| Forms/subscribers | Durable contact storage before optional notification, enquiry status/eligible assignment/notes/CAS; subscriber name/email/source/consent/status/search/export/withdrawal. | Columns exist; tests pass. No real visitor submission or external notification was sent during this increment. |
| Roles/activity | Existing fresh role checks, RLS, exact/inherited assignments and action logs remain authoritative. Drafts only reads through the signed-in client. | Existing account/permission tests pass. No grants, role changes or deactivation scripts applied. |
| Staff cleanup | Existing read-only roster fallback and prepared reversible cleanup scripts retained. | Prior staff-control mutation remains rejected and unapplied; Sukhdeep still needs account verification. |
| Production acceptance | Completion PR is reconciled with main through effa6f3. | 639 executable checks, focused TypeScript and production build pass. Optional original SPA workbook import is unverified without its workbook. Logged-in end-to-end acceptance remains pending. |

## Database evidence

- Production metadata columns for site_images and newsletter_subscriptions are present; site-images bucket exists.
- CMS entries count is 16. No CMS page drafts existed before the rolled-back verification.
- A real authenticated database transaction verified Super Admin draft creation, no initial live pointer, publication, and Roots-scoped refusal. All fixtures rolled back; retained test pages = 0.
- Security advisor findings match the existing categories: three mutable-search-path functions, intentionally guarded authenticated SECURITY DEFINER endpoints, private backup table with no policies, and leaked-password protection disabled. No new database functions were installed.
- The failed article migration made no schema changes. cms_metadata does not exist, so the editor/API capability gate remains closed.

## Explicit approval needed

The prepared article migration changes production schema and the existing SECURITY DEFINER article writer/restorer. Automatic approval review rejected that exact mutation. Review docs/cms-article-metadata.sql; the before-function snapshots are retained for comparison. Existing roles, policies, grants and function signatures would remain the same.

The separate staff update was rejected previously because it changes production access rules and deactivation behaviour. Review docs/cms-staff-cleanup.sql and docs/cms-roster-cleanup-apply.sql. These remain pending; no indirect workaround was attempted.
