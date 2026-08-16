"use client"

import { useState } from "react"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
import { PadelRegistrationForm } from "@/components/padel-registration-form"
import { PADEL_EVENT, PREVIOUS_PADEL_EVENT } from "@/components/padel/padel-event"

export function PadelHeroWithRegister() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <CampLandingHero
        eyebrow="Sikh Padel Association"
        title="Sikh Padel Association"
        subtitle="Bringing the Sikh community together through padel — register your team and compete."
        heroImage="/initiatives/sikh-padel-association-top.jpg"
        ctas={[
          {
            label: `Tournament — ${PADEL_EVENT.date}`,
            description:
              `Our upcoming team tournament takes place on ${PADEL_EVENT.date}, ${PADEL_EVENT.time}, at ${PADEL_EVENT.venue}. Register your pair now to secure your place.`,
            ctaLabel: "Register your team",
            primary: true,
            onClick: () => {
              setShowForm(true)
              if (typeof window !== "undefined") {
                setTimeout(() => {
                  document
                    .getElementById("padel-registration")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 50)
              }
            },
          },
          {
            label: "Previous tournament results",
            description:
              `View the ${PREVIOUS_PADEL_EVENT.date} tournament results from ${PREVIOUS_PADEL_EVENT.venue}.`,
            href: PREVIOUS_PADEL_EVENT.leaderboardUrl,
            ctaLabel: "View previous results",
          },
        ]}
      />
      {showForm ? (
        <div id="padel-registration" className="border-t border-border">
          <PadelRegistrationForm onClose={() => setShowForm(false)} />
        </div>
      ) : null}
    </>
  )
}
