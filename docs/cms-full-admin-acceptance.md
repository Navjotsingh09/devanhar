# Full admin acceptance scenarios

Scope: the Devanhaar CMS and its existing staff workspaces. Code under review is in PR 66. This is a test specification, not a claim that the browser scenarios passed.

## Readiness and execution

Use the current preview and a separate signed-out browser. Use approved disposable QA content labelled `QA — ADMIN ACCEPTANCE`, with a unique suffix per run. Keep a record of initial published pointers, settings and permissions before any change. Use synthetic contact details. Do not export real contact data into test evidence.

The preview currently shares the production database: a preview URL does not make writes isolated. Run publication, live settings, account changes, enquiry submissions and subscriber consent scenarios in an isolated test database with notifications disabled. If that environment is unavailable, record these scenarios as blocked; do not silently execute them against production. Existing public-site checks are read-only. Do not alter the real Taran/Sukhdeep accounts to manufacture negative tests, permanently delete data, submit real payments or send team notifications.

Run each applicable scenario as both **Super Admin** and **Admin**, then the explicitly specified restricted roles. Branding, organisation/default SEO, integration status and sensitive staff operations have additional Super Admin boundaries. Ineligible actions must fail at the server/API as well as in the interface. Do not use a service-role key in the browser or test login flow.

Execution states: **PASS**, **FAIL**, **BLOCKED**, **NOT RUN**, **NOT APPLICABLE**. Record actor role, environment, commit, time, actual outcome and redacted evidence for every scenario. An offline regression passing is not a browser PASS.

## Accounts, navigation and dashboard

| ID | Actor and steps | Expected result |
| --- | --- | --- |
| A01 | Super Admin: sign in normally and open `/dashboard/website`. | Staff profile resolves; CMS dashboard and permitted workspaces load without a redirect loop. |
| A02 | Admin: repeat A01; open shared settings and integrations. | General CMS works. Super Admin-only controls/status remain restricted, including direct requests. |
| A03 | Both: traverse each visible sidebar item, subproject and View action; use browser Back. | Correct destination and active item; no dead links, overlapping labels or unexpected full reload for filters. SPA operations remain in the separate portal. |
| A04 | Both: open dashboard summaries and every available quick action. | Counts agree with accessible saved records; Add Page/Event/Insight/Announcement and Upload Media open the matching tool. |
| A05 | Both: open Drafts, filter/paginate, inspect recently edited content. | Saved draft title, editor and time are accurate; no duplicate/omitted row at page boundaries. |
| A06 | Restricted programme staff: open visible locked spaces and request their APIs directly. | Access explanation and server denial; no other programme data returned. |
| A07 | Content Manager: inspect sidebar and request unassigned CMS, enquiries, users and settings routes. | Assigned CMS scope only; private CRM/admin access denied. |
| A08 | Disposable account: sign out, then reopen a private URL/API; repeat after its access is revoked by an authorised test administrator. | No cached private response; next protected request fails or returns to sign-in. |

## Pages, original layouts and publishing

| ID | Actor and steps | Expected result |
| --- | --- | --- |
| P01 | Both: create a uniquely named page, save a draft, reload editor and inspect signed-out public URL. | Draft persists; saved content is absent from the public page until published. |
| P02 | Both: add text, image, CTA and other supported blocks; reorder/hide them; save and preview. | Saved order and visibility match preview. Invalid or incomplete block data gives a clear error. |
| P03 | Both: edit native Roots/Wrestling copy in QA, reorder sections within one group and hide an allowed section. | Original typography, colours, images, navigation and form behaviour remain; only requested content/layout controls change. |
| P04 | Both: attempt to hide a protected form/payment section or forge a native ID/group. | UI prevents it and server validation rejects a crafted payload. No saved content is corrupted. |
| P05 | Both: append a reusable section to a migrated page. | Appears after original content and before the existing footer, exactly once in preview/public rendering. |
| P06 | Both: preview desktop/tablet/mobile, follow internal links, inspect focus order and sticky-header anchors. | Readable layout, usable controls and visible focused fields; preview shows the saved draft. |
| P07 | Both: change content after preview, then try Publish without saving/reviewing the changed revision. | Stale or unsaved content cannot be published as though it had been reviewed. |
| P08 | Both: publish a QA page, open it signed out, then edit/save a second draft. | Exact reviewed revision goes live; second draft never replaces live content until explicitly published. |
| P09 | Both: edit one record in two tabs; save A then save/publish B with stale pointers. | B receives a conflict; A is preserved; reload exposes current content. |
| P10 | Both: restore an older revision, inspect preview and then publish it. | Restoration creates a draft, preserving current live content until publish; history/actor/time remain consistent. |
| P11 | Both: open an older migrated draft with newly exposed fields. | Save/preview is required before publishing normalized content; matching historical edits are retained. |
| P12 | Signed out and signed-in staff: visit the same public URL while a private draft exists. | Both see only the published revision; draft pointers/content are not exposed in public responses. |

## Projects, events, notices, FAQs and Insights

| ID | Actor and steps | Expected result |
| --- | --- | --- |
| C01 | Both: create/save/preview/publish a QA project and related event. | Structured content persists; public detail and listing use the published content. |
| C02 | Both: test upcoming, completed/cancelled and visibility dates for QA events. | Public visibility and upcoming-event dashboard agree with the saved schedule. |
| C03 | Both: test announcement/notification future, active, expired and hidden states. | Public surfaces honour schedules/visibility; drafts are excluded. |
| C04 | Both: edit FAQ question/answer/order and publish. | Public FAQ uses the published order/content; accordion remains keyboard operable. |
| C05 | Both: create Insight with subtitle, category, tags, featured flag, cover, SEO and project relation; save/reload/preview. | Every supported field persists together in its revision; private changes stay private. |
| C06 | Both: publish Insight and inspect listing, detail, social metadata and related-project cards. | All derive from the same published revision; related project uses published relationship, not a newer draft. |
| C07 | Both: change the Insight project relation without publishing. | Existing public related cards remain unchanged until publish. |
| C08 | Both: archive/restore a QA article and inspect public list/detail/cache. | Archive removes public availability; restore follows the supported draft/publication workflow and invalidates affected caches. |
| C09 | Content Manager: exact View assignment; try editor, preview, save, publish, restore and archive. | View/preview allowed; Save/Publish/Restore/Archive denied unless the specific right is present. Requires Insights migration. |
| C10 | Content Manager: project View/Edit/Create without Publish; create a related draft and try another project's article. | Create only within assigned project; Publish and unrelated private content denied. Requires Insights migration. |
| C11 | Authorised Admin: grant/revoke project Publish and an exact article assignment for a disposable CM; re-test without signing out. | Fresh requests reflect access changes. Revoking one grant does not remove another valid inherited grant. Requires Insights migration. |
| C12 | Content Manager: attempt to move an existing article into a different permission scope or restore a foreign article revision. | Rejected; original content and access scope remain. Requires Insights migration. |

## Media, shared settings and SEO

| ID | Actor and steps | Expected result |
| --- | --- | --- |
| M01 | Both: upload permitted QA image/video/PDF through Media; set alt text, description and folder/project. | Asset saves and can be selected by supported editors; signed upload completes with a stable file URL. |
| M02 | Both: search/filter by file type and folder across multiple pages; clear filters. | Server filters before pagination; no unrelated items or missing matching assets due to client-only filtering. |
| M03 | Both: attempt unsupported type, oversized file and failed/interrupted upload. | Clear failure; no selectable phantom asset; retry does not duplicate completed uploads. |
| M04 | Both: use one QA asset on two pages, then replace its content and inspect history/usages. | References remain valid; replacement history and affected usages are visible. |
| M05 | Both: attempt to archive an in-use QA asset; archive/restore an unused asset. | Usage safeguards prevent broken references; unused archive/restore works through the supported flow. |
| S01 | Both: edit/reorder navigation and footer links; save, preview, publish. | Live navigation stays unchanged until publish; all published internal links resolve; unsafe destinations rejected. |
| S02 | Super Admin: update QA logo/favicon/brand/organisation/default SEO, preview and publish. | Shared website output reflects the published settings; draft settings never leak. |
| S03 | Admin: attempt the same critical settings through UI and a direct request. | Critical branding/organisation/default SEO changes denied; permitted navigation/footer management still works. |
| S04 | Both: test page/project/event/article SEO overrides, defaults, no-index and social images. | Public metadata uses published overrides/defaults; preview metadata cannot index private drafts. |
| S05 | Super Admin: open Integrations; Admin/CM: request the same route. | Super Admin sees configuration status only, never secret values; other roles are denied. |

## Forms, subscribers, staff operations and release

| ID | Actor and steps | Expected result |
| --- | --- | --- |
| F01 | Signed out in isolated QA: submit empty/space-only names, invalid email/phone, out-of-range DOB and missing conditional travel fields. | Clear validation in browser and server; invalid data never creates a usable submission. |
| F02 | QA: add/remove room-sharing children, keyboard through form, test autofill hints, honeypot and header error scroll. | Required rules follow visible fields; hidden spam trap is skipped; focused error is visible. |
| F03 | QA: submit one labelled valid Roots application with notifications disabled; inspect confirmation and assigned Roots workspace. | One submission; expected fields/status visible to permitted staff; no duplicate on refresh/retry. No real team email sent. |
| F04 | Both: open QA general enquiry, use applicable response/status/archive/restore controls and filter/paginate. | Actions persist, detail remains reachable, audit matches actor, restricted programmes cannot read it. |
| F05 | QA: newsletter signup without consent, duplicate signup, explicit signup and unsubscribe. | Consent required; no duplicate contact; unsubscribe updates status/consent/time and survives reload. |
| F06 | Both: search/filter/export synthetic subscribers; try staff-side reactivation and stale status change. | Export matches filters with safe CSV cells; staff cannot manufacture consent; stale writes return conflict. |
| U01 | Super Admin: inspect staff roster against approved account list. | Taran/Sukhdeep Super Admin; programme-only users retain correct scope; disabled accounts stay disabled. Verify email confirmation separately. |
| U02 | Authorised actor in isolated QA: change a disposable staff role/programme scope, then reopen UI and API. | Server enforces authorised role transitions; refreshed permissions apply without a privilege leak. |
| U03 | Authorised actor in isolated QA: deactivate/reactivate disposable staff; attempt protected/self/last-Super-Admin changes where guarded. | Authorisation and safety guards hold; no real staff account is locked out. No permanent deletion. |
| U04 | Both: inspect activity after saves, publishing, restore, archive, assignments and subscriber changes. | Actor, action, entity and timestamp are consistent; CM sees only permitted activity. Missing audit is a failure to investigate. |
| R01 | Both: navigate/filter representative 25-row lists while timing 10 repeated transitions after first load. | Record median/p95, API/server errors and comparison to baseline under the same conditions; no frozen interactions or repeated full reloads. Do not invent a speed result. |
| R02 | Both: repeat a save during a simulated network failure, recover and reload. | Useful error/retry; no silent data loss, duplicate revision or false success. |
| R03 | Approved production release: verify exact commit/build and migration results, publish, then read-only smoke test home, Roots, Wrestling, CMS login, published articles and file links. | Correct production commit, no broken existing content or draft leak. Monitor site errors; retain prior release and settings for rollback. |

## Automated evidence and remaining gates

Run `node scripts/run-admin-acceptance.mjs /tmp/devanhaar-admin-acceptance.json` for offline regressions. It reports executed files, counts, failures and explicit exclusions; it does not test a signed-in browser or apply migrations.

The prepared `docs/cms-insights-delegation-check.sql` contains transactional database scenarios for project inheritance, exact View-only access, denied publishing/foreign revisions and grant revocation. It must run only after the approved migration. It rolls back fixtures and temporary role changes; record the result and verify no test data remains. It has not run against the uninstalled migration.

At preparation time, all browser scenarios above are **NOT RUN**. Authenticated scenarios are **BLOCKED** until a suitable signed-in test session is available. C09–C12 and the delegation SQL check are also **BLOCKED** by the uninstalled production migration. Production release is **BLOCKED** by those acceptance gates. No percentage estimate overrides these states.

For each executed scenario copy this record:

```text
Scenario ID:
Actor role / disposable account:
Environment / commit:
Started / completed:
Result: PASS | FAIL | BLOCKED | NOT RUN | NOT APPLICABLE
Actual outcome:
Redacted evidence:
Defect and retest reference:
Cleanup / restored initial state:
```
