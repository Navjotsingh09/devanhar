"use client"

import { useState } from "react"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
import { PadelRegistrationForm } from "@/components/padel-registration-form"
import type { PublicPadelEvent } from "@/lib/padel-public-event"

export function PadelHeroWithRegister({ event }: { event: PublicPadelEvent }) {
  const [showForm, setShowForm] = useState(false)

  const eventLine = [event.date, event.time, event.venue].filter(Boolean).join(", ")

  return (
    <>
      <CampLandingHero
        eyebrow="Sikh Padel Association"
        title="Sikh Padel Association"
        subtitle="Bringing the Sikh community together through padel — register your team and compete."
        heroImage="/initiatives/sikh-padel-association-top.jpg"
        ctas={[
          {
            label: `Tournament — ${event.name}`,
            description: event.description || `Our upcoming team tournament takes place ${eventLine}. Register your pair now to secure your place.`,
            ctaLabel: event.registrationOpen ? "Register your team" : "Registration closed",
            primary: true,
            onClick: event.registrationOpen ? () => {
              setShowForm(true)
              if (typeof window !== "undefined") {
                setTimeout(() => {
                  document.getElementById("padel-registration")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 50)
              }
            } : undefined,
          },
          {
            label: "Player rankings",
            description: "See where every player stands across Sikh Padel Association tournaments.",
            href: "/initiatives/sikh-padel-association/leaderboard",
            ctaLabel: "View player leaderboard",
          },
        ]}
      />
      {showForm ? (
        <div id="padel-registration" className="border-t border-border">
          <PadelRegistrationForm event={event} onClose={() => setShowForm(false)} />
        </div>
      ) : null}
    </>
  )
}
