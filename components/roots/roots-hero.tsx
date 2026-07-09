"use client"

import { CampLandingHero } from "@/components/camps/camp-landing-hero"

export function RootsHero() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <CampLandingHero
      eyebrow="Roots Residential"
      title="Roots Residential"
      subtitle="Adventure. Friendship. Identity."
      heroImage="/initiatives/roots-top.jpg"
      ctas={[
        {
          label: "Book your place",
          description:
            "Places are limited. We'll be in touch after your form is submitted to discuss availability, costs and payment.",
          onClick: scrollToForm,
          ctaLabel: "Complete the booking form",
          primary: true,
        },
        {
          label: "Get in touch",
          description:
            "Have a question before booking? Get in touch and the Roots team will be happy to help.",
          href: "/contact",
          ctaLabel: "Get in touch",
        },
      ]}
    />
  )
}
