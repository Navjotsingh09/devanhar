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

365 production checks and 439 staging checks pass. A separate parity check compared the
current production SFI page with the new default renderer. Database transactions
verified real role boundaries and the assignment hierarchy, then rolled back all
temporary fixtures and role changes. No public page content was saved/published
as a test. Logged-in browser acceptance testing still requires a staff session.

## Remaining brief scope

General page/section editor, homepage builder, project content CMS, reusable events
manager, scheduled announcements/notifications, full media library, reusable FAQs,
global branding/SEO/navigation/settings, general create permissions, broad content
version restoration, article draft/live separation and the full acceptance matrix
remain separate implementation work. The primary Submissions screen now loads only one 25-row dataset and does not
call Stripe. Existing bulk camp/payment workflows remain available explicitly
under Advanced operations; that legacy console still performs heavier work.
Do not represent the sidebar, project spaces or page inventory as those editors.
