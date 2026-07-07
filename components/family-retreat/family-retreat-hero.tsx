"use client"

import { CampLandingHero } from "@/components/camps/camp-landing-hero"

export function FamilyRetreatHero() {
  return (
    <CampLandingHero
      eyebrow="Family Retreat"
      title="Sikh Family Retreat"
      subtitle="A fun family retreat rooted in sangat, Sikhi and shared memories."
      heroImage="/initiatives/sikh-family-retreat-top.png"
      ctas={[
        {
          label: "Book your family place",
          description:
            "Places are limited. A sevadaar will follow up after your form is submitted to discuss availability, costs and payment details.",
          href: "#booking-form",
          ctaLabel: "Complete the booking form",
          primary: true,
        },
        {
          label: "Speak to a sevadaar",
          description:
            "Have questions before booking? Get in touch and a sevadaar from the retreat team will be happy to help.",
          href: "/contact",
          ctaLabel: "Get in touch",
        },
        {
          label: "Day Pass",
          description:
            "Join us for a single day. Adults from £35 and children from £15. Book and pay instantly online.",
          href: "/initiatives/sikh-family-retreat/day-pass",
          ctaLabel: "Book a Day Pass",
        },
      ]}
    />
  )
}
