# CMS release reconciliation — 27 October 2026

The pasted audit reviewed main before PR 66 was merged. It did not include the completion implementation already on feat/cms-completion. No scope percentage is used as an acceptance result.

| Requirement | Implementation | Verification / remaining boundary |
| --- | --- | --- |
| Homepage, SFI and existing pages | 39 additional canonical page editors preserve the existing React layouts, with copy, links/media, metadata, draft/live isolation, actual-page responsive previews and history. Custom pages use reusable sections. | Automated content/schema/renderer checks pass. Roots is reconciled with main's newer Boots Camp/residential wording, application tracker and decisions. Its field manifest and default SEO match the newer source. |
| Drafts | A dedicated bounded workspace combines assigned page, structured-content and eligible article drafts, saved draft titles, state, editor and preview links. | Scope denial and 25-row-per-type pagination tests pass. |
| Projects/events/notices/FAQs | Existing structured schemas, assignment-aware editors, schedules and public renderers retained. | Existing regression checks pass; no schema changes needed for this increment. |
| Media library | Signed uploads, images/video/PDF/DOCX/text, search, metadata/folders, picker, stable reusable links, replacement versions, archive/restore and usage checks. | Metadata columns and public bucket exist. API/unit checks pass. Logged-in upload acceptance still needs a staff browser session. |
| Navigation/branding | Revisioned navigation/footer/organisation settings; logos/favicon, colour/font/button/radius controls, saved previews and publication. Critical branding/default SEO is Super Admin only. | Database draft/live transaction and fresh role-boundary tests pass. Existing defaults preserve Devanhaar styling. |
| SEO | Page/project/event/social SEO and website defaults; dedicated overview links to their authoritative editors. | Existing metadata features implemented. Insights metadata migration was applied by the user and verified; its capability gate now enables the controls. |
| Insights | Existing single article draft/publish/history/preview/archive tool retained. Prepared SEO/social fields, featured related-article flag and internal programme/event links join the same revision body. | The user applied cms-article-metadata.sql. A rolled-back authenticated transaction verifies private draft metadata, publication and history restoration with zero retained test articles. The API still refuses unsupported metadata if a future environment lacks the column. |
| Forms/subscribers | Durable contact storage before optional notification, enquiry status/eligible assignment/notes/CAS; subscriber name/email/source/consent/status/search/export/withdrawal. | Columns exist; tests pass. No real visitor submission or external notification was sent during this increment. |
| Roles/activity | Existing fresh role checks, RLS, exact/inherited assignments and action logs remain authoritative. Drafts only reads through the signed-in client. | Existing account/permission tests pass. No grants, role changes or deactivation scripts applied. |
| Staff cleanup | Existing read-only roster fallback and prepared reversible cleanup scripts retained. | The user applied both staff scripts. Both target accounts are banned, have zero active sessions and retain recoverable access records. Sukhdeep verification remains a separate account issue. |
| Production acceptance | Completion PR is reconciled with main through effa6f3. | 639 executable checks, focused TypeScript and production build pass. Optional original SPA workbook import is unverified without its workbook. Logged-in end-to-end acceptance remains pending. |

## Database evidence

- Production metadata columns for site_images and newsletter_subscriptions are present; site-images bucket exists.
- CMS entries count is 16. No CMS page drafts existed before the rolled-back verification.
- A real authenticated database transaction verified Super Admin draft creation, no initial live pointer, publication, and Roots-scoped refusal. All fixtures rolled back; retained test pages = 0.
- Security advisor findings match the existing categories: three mutable-search-path functions, intentionally guarded authenticated SECURITY DEFINER endpoints, private backup table with no policies, and leaked-password protection disabled. The user subsequently installed the reviewed staff functions and metadata-aware article functions; see the verification below.
- The initial rejected attempt made no schema changes. The user subsequently applied the script; cms_metadata now exists and its capability gate is enabled.

## Historical approval blockers — resolved by user execution

The prepared article migration changes production schema and the existing SECURITY DEFINER article writer/restorer. Automatic approval review rejected that exact mutation. Review docs/cms-article-metadata.sql; the before-function snapshots are retained for comparison. Existing roles, policies, grants and function signatures would remain the same.

The separate staff update was rejected previously because it changes production access rules and deactivation behaviour. Review docs/cms-staff-cleanup.sql and docs/cms-roster-cleanup-apply.sql. The user subsequently executed these scripts successfully. No indirect workaround was attempted.


## User-applied migrations verified

The user reported successful execution of all three scripts. A fresh read confirms the article metadata column, metadata-aware writer/restorer, staff_set_active and cms_staff_roster are installed. Mahaaan and Paramveer are banned with zero active sessions and recoverable prior-access records. The previous automatic-review blockers above are historical; no further schema application is pending for these scripts.

A rolled-back authenticated transaction verifies private draft metadata, exact published metadata and metadata-preserving restoration followed by publication. Retained test articles = 0. Published article listings now select the installed metadata column so featured related-article ordering works. Logged-in browser acceptance and production publication remain pending.
