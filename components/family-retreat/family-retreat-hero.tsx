"use client"

import { CampLandingHero } from "@/components/camps/camp-landing-hero"

export function FamilyRetreatHero() {
  return (
    <CampLandingHero
      eyebrow="Sikh Family Initiative"
      title="Sikh Family Retreat"
      subtitle="A fun family retreat rooted in sangat, Sikhi and shared memories."
      heroImage="/initiatives/sikh-family-retreat-top.png"
      ctas={[
        {
          label: "2027 Retreats",
          description: "Spring: 1–4 April 2027 · Summer: 22–25 July 2027. Register your interest and we will keep you updated.",
          href: "#interest-form",
          ctaLabel: "Register interest",
          primary: true,
        },
        {
          label: "Sikh Family Initiative",
          description: "Explore the full family programme, including Sikh Family Extravaganza and Wedding Fair.",
          href: "/initiatives/sikh-family-initiative",
          ctaLabel: "View all family projects",
        },
      ]}
    />
  )
}
