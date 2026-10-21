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

190 automated checks pass: 159 original regressions, 19 performance/access
checks and 12 additional SPA navigation/sign-in permission checks.
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

## SPA access-page correction

A programme-scoped session opening /spa-admin previously received a raw JSON
403. GET/HEAD requests now redirect to /auth/spa-access, with clear workspace
and organiser-sign-in links. The login and password-recovery routes remain
reachable for restricted sessions; mutation/API requests remain forbidden.
The SPA sign-in check now refuses programme grants before membership fallback,
matching the existing portal gate and avoiding a misleading successful login.
No account grants are altered.

The performance build was verified Ready on Vercel. The browser verification
session expired during cold navigation, so no signed-in before/after timing
improvement is claimed. Independent live retiming remains necessary.
