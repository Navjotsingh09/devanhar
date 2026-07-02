"use client"

import { CampLandingHero } from "@/components/camps/camp-landing-hero"

export function RootsHero() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <CampLandingHero
      eyebrow="Roots Residential"
      title="Roots Residential Camp"
      subtitle="Adventure. Friendship. Identity."
      heroImage="/initiatives/roots-top.jpg"
      ctas={[
        {
          label: "Book your camper's place",
          description:
            "Places are limited. An organiser will follow up after your form is submitted to discuss availability, costs and payment.",
          onClick: scrollToForm,
          ctaLabel: "Complete the booking form",
          primary: true,
        },
        {
          label: "Speak to an organiser",
          description:
            "Have a question before booking? Get in touch and the Roots team will be happy to help.",
          href: "/contact",
          ctaLabel: "Get in touch",
        },
      ]}
    />
  )
}
