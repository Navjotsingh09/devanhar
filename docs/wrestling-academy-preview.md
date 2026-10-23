# Wrestling Academy replacement

Wrestling replaces Self Defence Academy with a Roots-inspired landing page: a full-width photographic hero, gold pill buttons, a four-part facts strip, section jump navigation, editorial introduction, dark heritage section, light timetable section, media area and gold closing CTA. The hero uses a supplied academy group photograph; the academy logo, banner, heritage artwork, class poster and training gallery use optimised copies of the supplied images under `public/wrestling`. Original attachments are unchanged. Wrestling styles are scoped beneath `.wrestling-page` in `components/wrestling/wrestling-page.css`; Roots, the shared InitiativePageLayout, navigation and footer components are unchanged.

Routes: /wrestling, /initiatives/wrestling-academy, /sda and both legacy Self Defence page routes render the same replacement. /projects/self-defence-academy redirects to /wrestling. Responsive review: /design-review/wrestling.

Navigation, homepage project cards, Projects listing, CMS defaults, page inventory and staff space title are updated. The original self-defence-academy CMS/access identity is retained so existing grants and saved revisions are not broken. Public rendering replaces the old title even when an older CMS homepage or project record is published.

The supplied Overview and Our Heritage copy is preserved in `lib/wrestling-content.ts`. Confirmed classes run Monday and Wednesday, 7:00pm–8:30pm, at Edward Street Gurdwara - Old Darbar Hall, B70 8NN. Classes are primarily 15+, with the supplied experience-based exception for younger wrestlers. Adult (16+) membership is £30/month or £5/session; under-16 membership is £20/month or £3/session. Experience guidance and the full kit list are displayed. No coaches or results were invented. The personal contact number is not public.

Enquiry buttons continue to link to `/contact`. The existing footer contact form is preserved unchanged; this is a presentation-only update, not a new registration form or a backend change. Verify desktop/mobile layout, jump links, both empty and populated timetable/media states, and all replacement route aliases before deployment.

Run `node --test scripts/test-wrestling-page.mjs` for the focused rendering, enquiry-link, route-alias and style-isolation regression checks.
