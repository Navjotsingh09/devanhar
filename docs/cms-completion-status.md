# CMS implementation checkpoint — 22 October 2026

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

401 production checks pass after the homepage/page builder increment. The preceding staging checkpoint had 442 passing checks. A separate parity check compared the
current production SFI page with the new default renderer. Database transactions
verified real role boundaries and the assignment hierarchy, then rolled back all
temporary fixtures and role changes. No public page content was saved/published
as a test. Logged-in browser acceptance testing still requires a staff session.

## Homepage and new pages

- Homepage default content preserves its existing text, images, links, FAQs and native layouts.
- Hero, pillars, project list, impact/insights headings, Instagram copy and FAQs are editable.
- Existing registration notices still use registration windows, including the Roots link.
- Admins create new pages under /pages/<slug> without replacing existing routes.
- Nine reusable section types: hero, text, image/text, cards, CTA, FAQ, gallery, testimonials and buttons.
- Add/remove/reorder/hide sections; immutable saved drafts, same-renderer responsive preview and explicit publish.
- Earlier revisions can be restored into a new draft, subject to the same assignment and concurrency checks.
- Content Managers see only assigned saved CMS pages. New page creation remains Admin/Super Admin only.
- Navigation/footer, live Instagram source and article data remain in their existing shared systems.
- No production content was changed. A real database draft-creation transaction passed and rolled back with zero persisted test pages.

## Remaining brief scope

Migrating the remaining existing page layouts, project content CMS, reusable events
manager, scheduled announcements/notifications, full media library, reusable FAQs,
global branding/SEO/navigation/settings, general create permissions, version restoration across other content types, the full acceptance matrix
remain separate implementation work. The primary Submissions screen now loads only one 25-row dataset and does not
call Stripe. Existing bulk camp/payment workflows remain available explicitly
under Advanced operations; that legacy console still performs heavier work.
Do not represent the sidebar, project spaces or page inventory as those editors.

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
