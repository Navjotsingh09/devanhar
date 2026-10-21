# Roots form studio — implementation and activation

Entry: `/dashboard/roots/forms`. The existing Roots bookings list links to it. Start from a camp template or a blank design. Ten question types support text, long answers, email, phone, date, number, dropdown, choices, acknowledgement and repeatable rows. Reorder questions, add conditional questions, attach public PDFs, preview without saving responses, import/export designs, save drafts, publish and close submissions. Payments are optional fixed GBP amounts, not subscriptions or variable shopping baskets.

The camp template includes every requested item plus guardian name/email/phone and guardian confirmation. Activity consent permits Yes or No; the camp rules require acknowledgement. The team must supply the two PDFs before publication. No PDFs were invented or uploaded. Room requests have repeatable child/parent pairs and the non-guarantee explanation.

## Activation blocker

The connected Supabase tools refused access to project `igkpvudaqxkncxgslbvb` during implementation. No SQL was applied. The editor detects missing storage and enables design, preview and design export while disabling save and publish. Public forms fail closed. This is not a claim of operational submission storage or verified live checkout.

An authorised project administrator must apply `docs/roots-form-builder-setup.sql` through the normal migration workflow, then run the isolated acceptance checks below. The setup adds two new tables, their indexes, RLS, an atomic server-only submission/rate-limit function, and a public PDF-only bucket. It does not migrate or delete existing Roots bookings. The SQL has been reviewed but not executed against this database. Confirm the connected project's existing `admin_profiles` and `staff_programme_access` RLS lets staff read their own role/grants before activation.

The form studio preserves the existing general staff access boundary. Programme-restricted accounts cannot manage it yet; no user roles or grants were changed. Agree a Roots-specific delegation matrix before widening access. Rules/activity PDFs are public documents; child files are not accepted. Form answers remain in protected database rows. Retention/erasure should follow the charity's agreed policy; no automatic purge is introduced.

## Payments

Existing Stripe SDK/configuration is reused. Paid publication requires both secret key and webhook secret, although configuration presence alone does not verify that the correct Stripe account or endpoint is configured. Checkout prices come from the saved submission snapshot, never the browser. The existing signed `/api/webhooks/stripe` handler accepts completed, asynchronous success/failure and expired Checkout events for the new form metadata. Existing non-form event handling is preserved. Register these events on the same endpoint if not already enabled. Only a matching signed event with `payment_status=paid` marks paid. Amount, currency, form, session and test/live environment must match. Replays are idempotent and paid responses never regress. Sensitive answers and child medical details are excluded from Stripe metadata.

Use an isolated database and Stripe test keys for acceptance. Never substitute test keys into the existing production project or process a real payment to test this feature. No live payment or live submission was created during implementation.

## Verification and retest scenarios

Automated: `node scripts/test-roots-forms.mjs` (61 checks), plus the existing 190 submission/blog/SFI/dashboard/performance checks. Targeted TypeScript passed. The full repository check has a pre-existing syntax problem in `lib/events-data.ts`; this patch does not claim it passed. Database RLS, storage and real webhook delivery require post-setup integration tests.

| Scenario | Expected result | Environment |
| --- | --- | --- |
| Open Roots bookings and Form studio | Existing bookings remain reachable; camp and blank starts available | Read-only deployment |
| Preview camp; choose transport No then Yes | Location appears only for Yes; stale hidden values are not submitted | Preview |
| Add two room companions, remove one | Child and parent required on each added row; no guarantee text visible | Preview |
| Leave mandatory fields or rules unticked | Validation blocks submission; activity consent allows an explicit No | Preview |
| Preview without PDFs | Preview works; publishing refuses missing required PDFs | Preview / isolated save |
| Build a blank form | Add/reorder/remove questions, choose types and conditions, import/export design | Preview |
| Save draft of a published form | Public version stays unchanged until explicit publication | Isolated database |
| Two editors save the same revision | Second stale save returns conflict and does not overwrite | Isolated database |
| Free submission | One saved response, private detail; public receipt contains no answers | Isolated database |
| Paid submission and duplicate click | Saved price governs checkout; retry key creates no duplicate charge/session | Stripe test / isolated database |
| Return from unpaid checkout | Response remains pending; returning to checkout is possible | Stripe test |
| Signed paid/async paid event | Matching response marked paid; wrong amount/session/environment rejected | Stripe test |
| Replay event or failure after paid | Paid state preserved, no duplicate update | Stripe test |
| Response list with more than 25 fixtures | Bounded summaries; answers load only for one opened response | Isolated database |
| Anonymous/scoped account direct URL and API | Management denied; no draft, answers or medical data leaked | Isolated role fixtures |
| Foreign origin or excessive submission burst | Mutation refused; atomic rate limit protects new submissions | Isolated database |
| Close published form | New collection blocked; existing responses retained | Isolated database |
| Cookie widget on dashboard/auth/SPA portal | Hidden on direct load and public-to-dashboard navigation | Browser |
| Cookie widget on public website | Public controls still available, including return from dashboard | Browser |

Browser verification was attempted, but the browser runtime could not resume its credential state and then timed out after reset. A fresh signed-in browser check is outstanding. No browser screenshot or live end-to-end result is claimed.
