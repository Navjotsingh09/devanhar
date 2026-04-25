"use client"

import { useState } from "react"
import { CampLandingHero } from "./camp-landing-hero"
import { CampApplicationForm } from "@/components/camp-application-form"

export function SinghsCampHeroWithApply() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <CampLandingHero
        eyebrow="Brotherhood Retreat"
        title="Singhs Camps"
        subtitle="A space for Adult Sikh men to reconnect with Sikhi, build lifelong brotherhood and step away from the noise of everyday life."
        heroImage="/initiatives/singhs-camp-top.jpg"
        ctas={[
          {
            label: "Singhs Camp UK",
            description:
              "Our flagship UK residential. Applications are open — secure your place now.",
            ctaLabel: "Apply now",
            primary: true,
            onClick: () => {
              setShowForm(true)
              if (typeof window \!== "undefined") {
                setTimeout(() => {
                  document
                    .getElementById("singhs-application")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 50)
              }
            },
          },
          {
            label: "Singhs Camp EU 2027",
            description:
              "Our first European retreat is launching in 2027. Be the first to hear when applications open.",
            href: "/initiatives/singhs-camp/eu",
            ctaLabel: "Register interest",
          },
        ]}
      />
      {showForm ? (
        <div id="singhs-application" className="border-t border-border">
          <CampApplicationForm
            initiativeSlug="singhs-camp"
            onClose={() => setShowForm(false)}
          />
        </div>
      ) : null}
    </>
  )
}
