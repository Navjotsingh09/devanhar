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
