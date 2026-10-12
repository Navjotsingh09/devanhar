"use client"

import Link from "next/link"
import { CalendarDays, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FamilyRetreatInterestForm } from "@/components/family-retreat/family-retreat-interest-form"
import { useState } from "react"

const upcoming = [
  {
    label: "SFR – New Year Reset",
    date: "31 December 2026 – 3 January 2027",
    href: "/initiatives/sikh-family-retreat",
    registration: true,
  },
  {
    label: "Wedding Fair",
    date: "13 February 2027",
    href: "/initiatives/wedding-fair",
  },
  {
    label: "SFR Spring",
    date: "1–4 April 2027",
    href: "/initiatives/sikh-family-retreat",
  },
  {
    label: "Sikh Family Extravaganza",
    date: "May 2027",
    href: "/initiatives/sikh-family-extravaganza",
  },
  {
    label: "SFR Summer",
    date: "22–25 July 2027",
    href: "/initiatives/sikh-family-retreat",
  },
]

export function FamilyInitiativeUpcomingCards() {
  const [interestOpen, setInterestOpen] = useState(false)

  return (
    <>
      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {upcoming.map((event, index) => (
          <article
            key={event.label}
            className={`group flex min-h-[220px] flex-col rounded-2xl border p-5 backdrop-blur-md transition ${
              event.registration
                ? "border-amber-300/60 bg-amber-300/15 shadow-[0_12px_30px_rgba(251,191,36,0.12)]"
                : "border-white/15 bg-white/10 hover:bg-white/15"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${
                event.registration ? "bg-amber-300 text-slate-950" : "bg-amber-400 text-slate-950"
              }`}>
                <CalendarDays className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-white/60">0{index + 1}</span>
            </div>

            <div className="mt-5 flex-1">
              <p className="text-sm font-semibold text-white">{event.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-200">{event.date}</p>
            </div>

            {event.registration ? (
              <Button
                type="button"
                onClick={() => setInterestOpen(true)}
                className="mt-5 w-full rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                Register interest
              </Button>
            ) : (
              <Link
                href={event.href}
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-white/80 transition group-hover:text-white"
              >
                View project <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </article>
        ))}
      </div>

      <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
          <div className="border-b border-border bg-[#101b2d] px-6 py-6 text-white md:px-8">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">SFR – New Year Reset</DialogTitle>
              <DialogDescription className="text-white/70">
                31 December 2026 – 3 January 2027 · Register your family&apos;s interest.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <FamilyRetreatInterestForm
              interestFor="SFR – New Year Reset · 31 December 2026 – 3 January 2027"
              sourcePage="Sikh Family Initiative · New Year Reset"
              successMessage="Thank you. Your interest in SFR – New Year Reset has been registered. The Sikh Family Initiative team can contact you with the next booking details."
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
