# Remaining CMS scope — implementation and verification

This supersedes the earlier rough percentage estimates. Passing checks are not a full acceptance sign-off.

| Requirement previously missing | Current implementation | Evidence / outstanding work |
| --- | --- | --- |
| Content Manager Insights | One article editor; exact article assignments plus inherited project View/Edit/Create/Publish permissions. Server guards, private list filtering, preview/history guards, scoped middleware and restricted archive controls. | App boundary tests pass. Automatic review rejected the production migration in cms-insights-delegation.sql. Database enforcement remains prepared, NOT installed; no staff article assignments have been created. |
| Delegation UI | Administrators can manage exact article assignments; project Create permission covers new related articles. | UI and guarded server action prepared. Assignment controls report the missing migration. |
| Complete dashboard | Website environment status, page drafts/published counts, upcoming events, active announcements, recent enquiries, recent activity, recently edited pages and permission-aware quick actions. | Queries are bounded, use the signed-in client and exclude general enquiry reads for Content Managers. |
| Draft identities | Saved revision creator names are loaded in one bounded batch alongside saved timestamps. | Shared Drafts workspace includes page, entry and scoped article drafts. |
| Project–Insights relationship | Typed project UUID, subtitle/category fields and automatic published related-Insights cards on the CMS project profile. | Published relationships come from published metadata, not private draft relationships. Moving an existing article between permission scopes remains a global-editor operation in the prepared migration. |
| Existing page sections | 123 native section controls across the existing layout components, plus reusable block additions before existing footers. Copy-only pages now offer section visibility and within-group ordering. Form/payment sections remain visible. | Behaviour tests cover reorder, protected forms, group boundaries, metadata validation and real content outlets. Existing classes/styles/handlers/field values remain intact. Khalsa Catalyst uses the generic block builder. |
| Original template coverage | Dependency manifests now include the split Singhs Camp UK/data-complaint content and normal donation content. | Default original content remains the fallback. Historical revisions retain matching edits; newly exposed fields require explicit save/preview before publishing. |
| Media filters | Folder/project and image/video/document filters operate before server pagination. | Signed uploads, usage checks, replacement history and archive/restore retained. |
| Public rendering performance | Published article list/detail reads use tagged caches and an explicit published-only service query, separate from cookie-bound staff reads. Publication and archive invalidate those caches. | Public responses omit private draft pointers and draft migration state. Staff permission checks remain fresh per request. |
| CMS-only navigation | Content Managers see assigned CMS projects and relevant content modules. Operational staff retain the existing visible-but-locked programme spaces. | Server-side route, assignment and database guards remain authoritative. |
| Final logged-in acceptance | Not completed. | The last secure credential request was declined. No authentication bypass or retry was used. |
| Production publication | Not completed. | Completion remains on PR 66 pending migration approval and final acceptance. |

## Production migration approval

Automatic approval review rejected cms-insights-delegation.sql because it adds an article/project relationship and assignment table, updates RLS policies and execute permissions, and changes guarded publishing/restoration functions. The script creates no staff assignments. It preserves existing public articles and legacy general-editor access. No workaround or indirect application was attempted.

The exact migration and the rollback-only cms-insights-delegation-check.sql are prepared for review. After explicit approval, apply the migration, run the database permission checks, finish authenticated browser acceptance and release the tested changes.

## Validation on 27 October 2026

653 executable checks passed; focused TypeScript checks and the production build passed. The optional SPA workbook test was excluded because its source workbook is unavailable. Authenticated browser acceptance and the prepared production delegation checks have not run.

## Full admin acceptance pack

`cms-full-admin-acceptance.md` contains 55 concrete scenarios covering Super Admin, Admin and restricted roles. The repeatable `scripts/run-admin-acceptance.mjs` runner executed 24 offline regression files on 27 October 2026: 653 passed, 0 failed. Evidence is in `cms-admin-regression-20261027.json`. These results do not mark the manual browser scenarios as passed. Production Insights migration, authenticated acceptance and release remain blocked as documented above.
