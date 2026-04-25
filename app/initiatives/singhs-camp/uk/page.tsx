"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CampApplicationForm } from "@/components/camp-application-form"

export default function SinghsCampUkPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl py-16 md:py-24">
          <Link
            href="/initiatives/singhs-camp"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Singhs Camps
          </Link>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(43,100%,29%)] mb-4">
            Singhs Camp UK
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
            Apply to Singhs Camp UK
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
            Spaces are limited. Submit your application below and our team will
            review it and be in touch.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white"
          >
            Start your application
          </Button>
        </div>
      </section>
      {showForm ? (
        <CampApplicationForm
          initiativeSlug="singhs-camp"
          onClose={() => setShowForm(false)}
        />
      ) : null}
    </main>
  )
}
