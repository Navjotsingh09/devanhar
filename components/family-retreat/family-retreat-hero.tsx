"use client"

import { CampLandingHero } from "@/components/camps/camp-landing-hero"

export function FamilyRetreatHero() {
  const scrollToForm = () => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }

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
          ctaLabel: "Complete the booking form",
          primary: true,
          onClick: scrollToForm,
        },
        {
          label: "Speak to a sevadaar",
          description:
            "Have questions before booking? Get in touch and a sevadaar from the retreat team will be happy to help.",
          href: "/contact",
          ctaLabel: "Get in touch",
        },
      ]}
    />
  )
}
