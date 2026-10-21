# Devanhaar CRM interface — first preview

Mercury references supplied by Nav inform spacing, hierarchy and interaction
consistency. Devanhaar retains its logo, Inter family, saffron primary actions,
navy text and supporting blue accents. No Mercury assets are shipped.

## Implemented

- Dashboard-scoped theme; public pages and standalone SPA portal are untouched.
- Operations / Website workspace navigation with existing account restrictions.
  Website pages, articles, imagery, products and orders remain reachable.
- Shared header with accurate route labels, skip link and public-site link.
- Overview with actual enquiry, emergency and vacancy counts, bounded recent
  records and explicit unavailable states. No simulated charts or activity feed.
  The previously unconditional Vidyala overview queries/cards are removed; the
  programme's existing scoped workflow remains unchanged.
- Refined dataset tabs, accessible filter labels, responsive tables, readable
  status pills, current-page export and pagination. List loaders stay unchanged.
- Contact/message summary on a selected submission, existing record actions,
  and preserved list filters/page/order in the Back link. Programme detail Back
  links also retain validated list state. No arbitrary redirect parameter.
- Keyboard focus, reduced-motion and existing accessibility preferences retained.

This is the shared shell and first-screen design pass. Other module interiors,
login, full CMS builders, global search, saved views and activity history are not
claimed complete. There are no schema/role/payment/action endpoint changes.

## Validation

159 regression checks pass, including bounded loaders, API guards and
SFI/blog/access behaviour and an actual selected-record page fixture that restores
validated list state while ignoring arbitrary return destinations. The changed TSX files and their import graph pass a
strict targeted TypeScript check. Whole-repository TypeScript checking is blocked
by existing JSX syntax in lib/events-data.ts; no whole-repository clean claim.
Live acceptance is read-only: no payments, emails, donor exports or record writes.

## Visual and workflow acceptance

| ID | Check | Expected |
|---|---|---|
| UI01 | Open Overview | Actual operational counts, correct logo and no console/render error. |
| UI02 | Switch Operations / Website | All existing tools reachable; correct active section; scoped users keep existing restrictions. |
| UI03 | Open submissions, Padel and Roots | Shared typography/table layout; up to 25 summary rows, no new fields in list payloads. |
| UI04 | Apply search/status/order; use Next/Previous and Clear | Existing server filtering/paging works; Clear restores defaults. |
| UI05 | Open an existing labelled QA fixture from a filtered list, then Back | One record; existing controls; same list filters and page restored. Do not click mutations. |
| UI06 | Keyboard and narrow viewport | Visible focus, labelled controls, usable navigation and horizontal scroll confined to wide tables. |
| UI07 | Empty, out-of-range and unavailable data | Honest empty/error state; correct count; First page recovery works. |

Role/financial mutations, full accessibility audit and independent mobile-device
acceptance still require the appropriate isolated environment and fixtures.
