"use client"

import { useState } from "react"
import { CampLandingHero } from "@/components/camps/camp-landing-hero"
import { PadelRegistrationForm } from "@/components/padel-registration-form"

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
            label: "Tournament — 4th July",
            description:
              "Our upcoming team tournament takes place on 4th July. Register your pair now to secure your place.",
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
            label: "Live leaderboard",
            description:
              "Follow games, points and rankings as they are updated after each round on tournament day.",
            href: "/initiatives/sikh-padel-association/leaderboard",
            ctaLabel: "View leaderboard",
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
