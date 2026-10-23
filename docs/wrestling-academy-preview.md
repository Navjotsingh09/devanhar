# Wrestling Academy replacement

Wrestling replaces Self Defence Academy with a Roots-inspired landing page: a full-width photographic hero, gold pill buttons, a four-part facts strip, section jump navigation, editorial introduction, dark heritage section, light timetable section, media area and gold closing CTA. The existing Self Defence hero image remains pending the academy's own supplied media. Wrestling styles are scoped beneath `.wrestling-page` in `components/wrestling/wrestling-page.css`; Roots, the shared InitiativePageLayout, navigation and footer components are unchanged.

Routes: /wrestling, /initiatives/wrestling-academy, /sda and both legacy Self Defence page routes render the same replacement. /projects/self-defence-academy redirects to /wrestling. Responsive review: /design-review/wrestling.

Navigation, homepage project cards, Projects listing, CMS defaults, page inventory and staff space title are updated. The original self-defence-academy CMS/access identity is retained so existing grants and saved revisions are not broken. Public rendering replaces the old title even when an older CMS homepage or project record is published.

Supplied copy is used for introduction and heritage. Timetable and media remain empty until actual details/photos are supplied. No times, venue, fees, eligibility, coaches or results were invented. The personal contact number is not public.

Enquiry buttons continue to link to `/contact`. The existing footer contact form is preserved unchanged; this is a presentation-only update, not a new registration form or a backend change. Verify desktop/mobile layout, jump links, both empty and populated timetable/media states, and all replacement route aliases before deployment.

Run `node --test scripts/test-wrestling-page.mjs` for the focused rendering, enquiry-link, route-alias and style-isolation regression checks.
