# Submissions remediation — focused retest

Scope: FORM04 initial-response exposure on `/dashboard/submissions` and
`/dashboard/recovery-payments`, with related application server-action guards.
This is the first repair increment, not completion of the full CMS brief.

## Implemented

- One allowlisted dataset per list request, database range of 25 rows, explicit
  summary columns, deterministic date/id ordering and exact filtered count.
- Search, exact status and chronological order applied on the server. Page links
  retain them. Existing application/payment statuses are not migrated.
- List responses omit payment references, notes, medical fields, phone and full
  form answers. Full detail is read only for one selected ID; detail links do not
  prefetch sensitive record payloads.
- Recovered payments uses the session/RLS client instead of a service-role client
  and is paginated separately. No Stripe scans run during list or detail reads.
- Routes, current-page CSV and general submission actions reject CMS-only roles,
  missing profiles, lookup errors and programme-scoped access to the global CRM.
  Existing general Staff/Admin/Super Admin operational access is retained.
- Existing scoped Vidyala row actions remain possible for Vidyala records only;
  interest actions check the selected record's camp. Existing SPA decision guards
  remain in effect.
- CSV exports only the selected list page, with formula-prefix protection and
  private/no-store responses. Record actions remain on the selected record.
- Bulk payment/reminder panels are not shown on the single-record view: the old
  bulk routines operate globally and must not be presented as page-scoped.
- SPN submissions and Wolf Run fundraiser tables queried by the old page are
  absent in the connected schema; those sources are marked unavailable. The
  existing separate Wolf Run runner system is not replaced or migrated.

## Validation completed before deployment

55 new tests exercise the actual list/detail loaders, current-page export,
permission helper and 20 actual server-action refusals using mocked dependencies.
The 87 existing CMS/access tests also pass (142 combined). Targeted TypeScript
checks pass. Read-only database queries confirmed the explicit form and recovered
payment projections each return only 25 rows; no row contents were printed.

These tests are not equivalent to full role-based browser acceptance. Record the
actual deployment/build for manual retest and keep the historical reported
FORM04 failure separate from the new result. No live records, roles, schema,
payment state, email or publication was changed by these checks.

## Manual scenarios

| ID | Mode | Steps | Expected result |
|---|---|---|---|
| RET01 / FORM04 | Read-only, general Staff | Open submissions; inspect the initial document and RSC responses in developer tools. | At most 25 selected-dataset summaries; no embedded recovery ledger, full application answers, health data, notes or Stripe references. Record response bytes, but do not share raw personal data. |
| RET02 / FORM04 | Read-only | Go Next then Previous on a stable dataset; compare IDs privately. | Server URLs change page; each page has at most 25 rows; date/id ordering is stable; Previous returns to the original page. Concurrent inserts may shift offset pages and are not a snapshot guarantee. |
| RET03 / LIST01 | Read-only | Search a permitted test string; filter an exact existing status; change order; go Next; clear filters. | Database-backed search/status/order persist across page navigation; applying/changing filters starts at page 1; Clear resets inputs and results. |
| RET04 / FORM04 | Read-only | Select Camps, Padel, interest/webinar, Roots, family and Recovered Payments; inspect each response. | Only the selected dataset is loaded; summary fields remain minimal and bounded; statuses retain original meaning. |
| RET05 | Read-only | Follow one Open record link; inspect navigation and response without clicking mutation controls. | Exactly one selected record loads; existing permitted detail/actions are present; returning to list does not dump all records. No global bulk charge/send control appears in this single-record view. |
| RET06 / FORM03 | Read-only, separate role fixtures | Open list, record and CSV endpoints as signed out, CMS-only CM, vacancies-only and programme-scoped accounts. | No global CRM record data returned. Programme users keep only their existing scoped workflows. Do not change real accounts to create fixtures. |
| RET07 | Isolated fixtures | Attempt notes/status/archive/payment server actions as CM or unrelated programme user. | Server refuses before database mutation, email, Stripe or audit side effects. Never test a possibly authorised financial action against live records. |
| RET08 | Isolated export fixture | Export a filtered page with formula-like names and more than 25 total matching records. | At most 25 summary rows; current filter/page retained; dangerous formula prefixes neutralised; no detailed personal/payment fields. On live data, inspect only headers/response bounds without downloading a donor export. |
| RET09 | Read-only | Open page -1, oversized/nonnumeric pages, an out-of-range page and a forged source name. | Inputs are bounded/defaulted; source cannot select arbitrary tables; out-of-range page offers First page; no unbounded fallback query. |
| RET10 | Isolated error injection | Fail the selected query and an access lookup. | Clear load error rather than false zero totals; access lookup fails closed; raw database errors/secrets are not returned. |
| RET11 | Read-only existing roles | Inspect SPA rankings, programme navigation and assigned Vidyala detail controls. | Existing read workflows still work; own Vidyala row actions retain their scoped authorisation. Mutation regression requires isolation. |
| RET12 | Read-only | Choose unavailable SPN/Wolf Run fundraiser sources and inspect menu state. | They are marked unavailable rather than pretending to load an empty table. Existing separate runner pages remain independent. |

## Remaining work / policy limits

FORM03 is not fully closed: general Staff still has its existing broad operational
scope. DEC02 must explicitly assign sensitive donor/enquiry/export rights before
that scope is changed. Page/action guards are not a replacement for a full RLS
and direct Data API audit. Existing scoped RLS policies are retained; no shared
production database policy was changed by this patch.

This patch does not implement the remaining page builders, homepage, delegation
UI, content modules, full blog versioning, privacy workflows or generic CMS
settings. Those remain in the main test pack. Do not report their tests as passed.

## Follow-up: range handling, Padel and Roots

Historical acceptance: the user reported RET01–RET05, RET11 (read) and RET12
passing on `dpl_BQt54yUU7LYEReRXWiDJefyYTMpD`, 20 October 2026, Staff,
with RET09 failing only for an out-of-range page. RET06/07/10 remained blocked
and RET08 was not run. The prior large-response FORM04 failure remains part of
the older build's historical result; it is not overwritten by a later pass.

The follow-up recognises only PostgREST `PGRST103` on a positive offset. It
performs a count-only request with identical source/search/status/programme
filters, and returns an empty page only when that count confirms the offset is
outside the dataset. Genuine errors and failed count checks remain errors.
The protocol reference is
https://docs.postgrest.org/en/stable/references/errors.html#group-1-api-request.

Clear filters now resets search, status, page and sort (Newest first). Friendly
status labels, such as Awaiting Payment for `payment_pending`, change display
only; the exact stored status/filter value is preserved.

Padel and Roots now have separate Live records and Recovered evidence datasets,
each with 25 minimal summary rows per request, server search/status/order and
private page-scoped exports. Recovered evidence retains the old programme
predicate (`%Padel%` or `%Roots Residential%`) on both rows and counts. Separate
evidence records may refer to a live registration; do not add the two datasets'
counts and interpret the sum as unique applicants. No records are merged or
deleted. A read-only count query during implementation returned 39 Padel live
registrations, 69 Padel evidence rows, 0 Roots live bookings and 172 Roots evidence
rows; these are point-in-time counts, not fixed acceptance constants.

Opening a live record fetches only that ID and retains the existing Padel or Roots
controls. Archived records initialise the existing selected-record controls in
the archived view rather than disappearing. Historical evidence detail URLs also
apply the programme predicate, so another programme's ledger ID cannot be read
through that programme-specific route. Record/navigation links do not prefetch
full detail payloads. Roots list reads now use the authenticated/RLS client,
without a service-role bypass. Existing mutation workflows are retained and are
not exercised against live data.

71 submissions/programme tests plus 87 existing tests pass (158 total), with
targeted TypeScript checks. Tests include the actual Padel selected-record
loader, scoped CSV behaviour, precise range errors, count failure, unrelated
errors and forged sources. The separate SPA portal's existing registration list,
other CRM pages and the broad Staff access policy remain outside this follow-up.
No database schema, roles, payment data or published content is changed.

### Focused follow-up retest

| ID | Mode | Steps | Expected result |
|---|---|---|---|
| RET13 | Read-only | Open submissions and recovered payments at `page=99999`, including filtered datasets with zero or a few matches. | Empty page, accurate matching total and First page link; no outage message. First page restores the same filters and sort. Genuine errors are not silently hidden. |
| RET14 | Read-only | Search/filter/sort Oldest first, go to page 2, then Clear filters. | Page resets to 1, blank search/status and Newest first; selected dataset stays selected. |
| RET15 | Read-only | Inspect statuses on list and detail views; filter by raw `payment_pending` and exact `archived`. | Friendly labels appear; status meanings and case-sensitive exact filtering remain intact. |
| RET16 | Read-only | Open `/dashboard/padel`; inspect initial document/RSC payloads, then page 2. | Up to 25 live summaries; no phones/full answers/Stripe references or hidden recovered dump; page 2 has remaining live records. Existing SPA management links still resolve. |
| RET17 | Read-only | Switch Padel to Recovered evidence; page through and search/filter; inspect source and rows. | Up to 25 evidence summaries per request, scoped to Padel. Rows do not include other programmes or merge into live registrations. Each detail link stays on the Padel route. |
| RET18 | Read-only | Open `/dashboard/roots`, then Recovered evidence; test Next/Previous and a high out-of-range page. | Live empty state is valid if no bookings exist. Roots evidence is scoped, paginated and minimal, with the same range recovery. No service-role bulk response. |
| RET19 | Read-only / isolated fixtures for mutations | Open an existing labelled QA live record and an authorised evidence detail; inspect controls, then return. In isolation test an archived fixture and try another programme's ledger ID through this detail route. | Exactly one permitted record loads without prefetch. Existing Padel/Roots actions remain available; archived selection is visible. Unrelated evidence returns no record. Do not approve, charge, email, archive or delete live records during read-only retest. |
| RET20 | Isolated CSV/error fixtures | Export programme-filtered page with synthetic data; inject a normal database failure, a count failure and a valid out-of-range error. | Export remains at most 25 summaries with matching programme scope. Only a confirmed out-of-range condition becomes an empty page; other failures remain explicit. |

Record end-to-end request times separately for normal, malformed and out-of-range
requests. No numeric latency improvement is claimed from mocked tests; the
fallback adds a count-only query only for a specific range error. If slow invalid
requests persist, inspect auth/middleware/database timings independently.
