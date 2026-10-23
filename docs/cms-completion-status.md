# CMS implementation checkpoint — 23 October 2026

The full development brief is not complete. This checkpoint records implemented
and verified work; it is not an acceptance sign-off.

## Access repair

- Fresh verified identities in private middleware; no auth round trips on public pages.
- Global administrator access through navigation, route guards and programme RLS.
- Existing programme operator restrictions retained.
- Transactional staff role edits; only Super Admin can change system roles.
- Direct profile writes and CMS TRUNCATE privileges removed from browser roles.
- Blog mutation guard fails closed on missing profiles, scope and lookup failures.

## SFI production editor

- Original public design, copy, links and images preserved as the default.
- Immutable draft snapshots; separate published pointer; expected-head protection.
- Desktop, tablet and mobile preview through the public SFI renderer.
- Explicit publish confirmation and SEO editing.
- Administrator assignment management for View / Edit / Publish permissions.
- Content Managers cannot load operational CRM routes or operational APIs.
- Page inventory and starting screen show assigned content to Content Managers.
- Paginated activity log; non-administrators see only their own recorded actions.

## Verification

441 production regression checks pass after the structured content increment. A separate parity check compared the
current production SFI page with the new default renderer. Database transactions
verified real role boundaries and the assignment hierarchy, then rolled back all
temporary fixtures and role changes. No public page content was saved/published
as a test. Logged-in browser acceptance testing still requires a staff session.

## Homepage and new pages

- Homepage default content preserves its existing text, images, links, FAQs and native layouts.
- Hero, pillars, project list, impact/insights headings, Instagram copy and FAQs are editable.
- Existing registration notices still use registration windows, including the Roots link.
- Admins create new pages under /pages/<slug> without replacing existing routes.
- Thirteen reusable section types: hero, text, image/text, cards, CTA, FAQ, gallery, testimonials, buttons, published projects, published events, published Insights and shared FAQs.
- Add/remove/reorder/hide sections; immutable saved drafts, same-renderer responsive preview and explicit publish.
- Earlier revisions can be restored into a new draft, subject to the same assignment and concurrency checks.
- Content Managers see only assigned saved CMS pages. New page creation remains Admin/Super Admin only.
- Navigation/footer, live Instagram source and article data remain in their existing shared systems.
- No production content was changed. A real database draft-creation transaction passed and rolled back with zero persisted test pages.

## Remaining brief scope

The implementation and verification status for the remaining scope is recorded in the completion increment below. Authenticated browser acceptance and the rejected production account update remain pending.
## Publishing repair — follow-up

- Blog draft snapshots now live in a private immutable revision table. Saving a draft does not change a live article or its cover.
- Authenticated transactional publishing validates the current draft pointer and update timestamp, saves the prior live snapshot, promotes only the saved body and records the actor.
- Article preview uses the public article renderer at desktop/tablet/mobile widths.
- Archive/restore replaces permanent deletion. Shared images remain intact.
- The homepage Insights carousel now uses published database content rather than deleted sample articles; it receives only the card fields.
- Page draft filters, search, editor names/timestamps, recoverable draft discard, custom-page unpublish and recent-page dashboard summaries are present.
- The sidebar includes a working Page drafts destination.
- A rolled-back database transaction verified draft creation, initial publish, editing a live post without public changes and refusal of stale publishing. No test articles were retained.

## Structured content modules — 23 October 2026

- Project, event, announcement, notification and reusable FAQ records have immutable revisions, separate live/draft pointers, scheduled visibility and recoverable archive/restore.
- Database rules enforce fresh roles and exact/inherited project assignments, including separate View/Edit/Create/Publish flags. Project changes in a draft do not change the published relationship.
- Existing project/event catalogue data is imported unchanged. Existing programme pages and payment/registration flows remain available; managed project profiles are separate from the remaining campaign-page migrations.
- Announcements and notifications render on configured pages, with dates and dismissal controls. Project-related messages are restricted to that project's public locations.
- Reusable FAQs feed existing FAQ sections. Project/event profiles and their SEO use the same renderer as saved previews.
- Public record reads are cached separately from all staff authorization checks; publication invalidates them immediately.
- A real rolled-back transaction verified delegated creation/publishing, denied cross-project writes, denied permission changes, stale-save refusal, draft/live isolation and recoverable archives. No test records or role changes remain.
- Build-time Sentry source-map and release uploads are disabled; existing runtime SDK configuration remains in place.

## Article history restoration — 23 October 2026

- Editors can inspect the latest 20 saved article revisions and restore one as a new draft.
- Unsaved changes block restoration, with an explicit confirmation and a leave-page warning.
- The database enforces the current draft/timestamp, refuses revisions from other articles, rechecks access and records restoration atomically. Restoring never changes live article columns.
- Older optional fields and publication dates are normalised to the editor format so restored drafts can be previewed and published.
- 441 production checks pass; the full build passes. A real authenticated transaction verified restoration, stale/foreign revision refusal, later publishing and anonymous denial, then rolled back every fixture. Logged-in browser acceptance remains unverified.

## Public rendering performance

- Public notices use cached published data without reading request headers in the root layout. Public programme pages keep static/ISR rendering; the staff layout explicitly remains dynamic.
- Private previews keep their draft FAQ answers instead of receiving global published overrides. Notice timers stay inactive on private screens and when there are no messages.
- The production build confirms public routes are prerendered with one-minute revalidation, while staff routes remain request-rendered.

## Roots account scope — 23 October 2026

- Roots is a separate programme scope. Scoped staff can open Roots bookings/forms/responses and the Roots-only CSV, while other project spaces remain visible and locked.
- Fresh guards protect Roots service-role operations; scoped API exceptions cover only Roots form routes and the explicitly scoped CSV export.
- Database policies allow Roots records and Roots recovery evidence while denying general CRM and other programme access. General staff and administrators retain their existing access.
- Sukhdeep's explicitly requested Super Admin profile was repaired. His email remains unconfirmed; authentication verification is still required.

## Completion implementation in progress

Media library, navigation/branding, 39 layout-preserving content editors and subscriber/form workflows are implemented in the working branch. Verification and account cleanup are in progress; this is not an acceptance sign-off.

## Completion increment — verification checkpoint

- Media: signed direct uploads (images, MP4/WebM clips and PDFs, up to 50 MB), paginated search, titles/alt text/folders, copy/view/select URL, metadata edits, recoverable archive/restore, and current-content usage checks. The old image DELETE endpoint cannot delete shared storage.
- Navigation/branding: the current menu and footer data are the defaults for a shared revisioned editor. Logos, accent, contact details, main links/submenus, project cards and footer links use a responsive saved preview and separate publication. Only administrators can change global settings.
- Existing pages: 39 additional canonical pages have default editors and SEO controls. Copy/media changes use the existing React layout; form values, event handlers, classes and styles remain unchanged. Draft previews render the actual page components. Khalsa Catalyst remains hidden until explicitly published. Public content is cached and public routes retain static/ISR rendering.
- Subscribers: durable same-origin endpoint with normalized email and explicit consent; paginated search/status filters; filtered CSV with signed unsubscribe URLs; authenticated consent withdrawal; signed, explicit public unsubscribe confirmation. Staff cannot silently restore withdrawn consent.
- Enquiries: saving is mandatory before notifications; a missing or failed notification service cannot silently lose an enquiry or ask the visitor to resubmit a record already saved.
- Staff: roster audit completed. Taran and Sukhdeep have Super Admin profiles; Sundeep has active SPA-only membership; Luvpreet has Roots only; Karnjit has Kaurs/Vidyala/newsletter; Daljit has family; Amritpal retains general staff access. Sukhdeep's email is unverified and was not bypassed. Paramveer has no CRM profile; the legacy SPA account is absent. Mahaaan and Paramveer deactivation is prepared but NOT applied.
- Automatic approval review rejected persistent access-control changes. `cms-staff-cleanup.sql`, `cms-roster-cleanup-apply.sql` and removal of `anon_update_nl` remain pending explicit approval. User management falls back to a fresh read-only roster and does not enable uninstalled deactivation actions.
- Additive media/subscriber columns were applied and verified; existing records were retained.
- At the checkpoint, 510 executable regression checks passed, including 58 new CMS/workflow checks. The optional SPA workbook import suite requires its original workbook, which is unavailable in this workspace; it was not represented as passing.
- Focused TypeScript passes. Final production build and deployed browser checks are in progress. The staff browser session is expired; authenticated acceptance is NOT verified.


## Final implementation increment — 23 October 2026

- Media supports images, video, PDF, DOCX and text uploads up to 50 MB, descriptions, uploader/date metadata, stable reusable links and explicit replacement publication with recoverable version history. Replacement files retain the old storage objects. Legacy hard-coded image slots remain protected from archive/replacement through the library.
- Branding includes scoped colours, fonts, buttons, border radius, logos/favicon and default social/SEO metadata. Original defaults retain the current Devanhaar design. Only Super Admin can save or publish critical branding/default SEO; Admin can manage navigation/footer. Integration setup status reveals no credentials.
- Existing migrated pages include visibility and social metadata. Latest main Wrestling content, timetable, real media and equal-size gallery tiles are retained; its editor manifest was refreshed from the actual source.
- Subscriber records include optional name/source and explicit consent; withdrawal clears consent. Authenticated staff withdrawal uses a fresh programme guard and server write because the existing authenticated database role has no subscriber UPDATE policy. No RLS grants were expanded.
- General enquiry details include status, eligible staff assignment, internal notes and stale-save refusal under existing submission access. The contact endpoint persists before optional notification.
- Previously approved additive media/subscriber metadata columns are applied. The policy removal in cms-completion-schema.sql is still pending and explicitly marked.
- Sign-in prompt was cancelled by the user. No further sign-in attempt was made; logged-in browser acceptance is NOT verified.
- Production account deactivation and access-control scripts remain unapplied after automatic approval review rejected that mutation. Sukhdeep also still needs email verification. No claim of complete account cleanup or acceptance is made.

- Final local validation: 526 executable checks pass; focused TypeScript passes. Optional original-workbook import is unverified because the source workbook is unavailable. Production build and deployed checks are recorded separately below.
