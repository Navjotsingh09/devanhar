# CRM navigation performance repair

## Changes

- The layout, general Staff gate and Padel Staff gate share verified account
  reads with React.cache during a single Server Component render. The cookie
  client/user/grants are never placed in a persistent or process-level cache.
  Outside a render (e.g. actions), checks execute fresh.
- Profile and programme queries run concurrently after getUser verification.
  Middleware checks remain separate and fresh; no access gate is removed.
- List filter forms use Next Form with prefetch disabled, so applying filters
  performs client-side navigation instead of reloading/hydrating the whole page.
- Leaf loading boundaries and pending sidebar indicators give navigation feedback.
  Record links still do not prefetch personal details. List bounds stay at 25.
- The sidebar logo uses Next image optimisation rather than downloading the
  5119px source for a roughly 100px display.
- The global cart provider skips its mount-time shop-cart request in dashboard
  and SPA admin routes. Entering public pages still loads the cart normally.

## Verification and limits

178 automated checks pass: the existing 159 plus 19 access/concurrency checks.
The modified component graph passes strict targeted TypeScript checking.
Access tests cover missing/failed authentication, missing/failed profiles/grants,
CMS-only and vacancies-only roles, programme accounts, approved general Staff
roles, concurrent query initiation and fresh action checks after a role change.
Unit fixtures model calls outside an RSC render; React owns render cache lifetime.

No database schema, role, RLS, payment or record changes. No persistent user-data
cache, general prefetch or service-role bypass is introduced. Existing broad Staff
access decisions and unrelated unbounded module queries remain separate work.

Before/after browser acceptance must verify filtered URLs/counts, page navigation,
optimised logo loading, empty/high-page recovery and absence of rendering errors.
Report timings only as observed samples with automation/network overhead; no
universal percentage or latency target is inferred from mocked tests.
