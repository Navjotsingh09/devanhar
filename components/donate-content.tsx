"use client"

import { ArrowRight, ShieldCheck, Building2, HeartHandshake, BookOpen, Users, Hand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DonateButton } from "@/components/donate-button"

const trustPoints = [
  {
    icon: ShieldCheck,
    text: "All donations are processed securely and encrypted",
  },
  {
    icon: Building2,
    text: "UK-based registered charity organisation",
  },
  {
    icon: HeartHandshake,
    text: "Funds support education, camps, and community initiatives",
  },
]

const pillars = [
  {
    icon: BookOpen,
    title: "Education",
    description:
      "From Sikhi Vidyala to Gurmat Academy, your support funds programmes that equip the next generation with knowledge of Gurbani, Sikh history, and philosophy.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Singhs Camp, Kaurs Camp, and Kids Camps bring Sikhs together from across the UK, building bonds of brotherhood, sisterhood, and shared spiritual growth.",
  },
  {
    icon: Hand,
    title: "Seva",
    description:
      "Every initiative is powered by selfless volunteers. Donations help us provide the resources, training, and spaces our sevadaars need to serve the Panth.",
  },
]

const usageItems = [
  "Educational programmes, resources, and curriculum development",
  "Residential camps and safe learning environments",
  "Volunteer training, DBS checks, and safeguarding",
  "Long-term sustainability of all Devanhaar initiatives",
  "University outreach and student engagement across the UK",
]

export function DonateContent() {
  return (
    <main className="pt-28">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-5">
              Support Devanhaar
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] mb-6 text-balance">
              Support the Future of Sikh Education & Sangat
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto text-pretty">
              Devanhaar is a UK-based charity dedicated to inspiring Sikhs
              through education, camps, and community programmes. Your
              contribution helps us sustain and grow this work for
              generations to come.
            </p>

            <div className="flex flex-col items-center gap-4">
              <DonateButton
                source="donate-hero"
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-14 text-base"
              />
              <p className="text-xs text-muted-foreground tracking-wide">
                Secure &middot; Trusted &middot; UK Charity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {trustPoints.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-4 py-8 md:py-10 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0 border border-border">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-snug">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Your Support Matters */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              Why Your Support Matters
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Enabling Growth, Learning & Connection
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              Devanhaar supports Sikh education, youth development, and
              community spaces across the UK. Donations help sustain and
              responsibly grow this work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                  <pillar.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Donations Are Used */}
      <section className="py-24 md:py-32 bg-secondary/40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                How Donations Are Used
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Invested Into What Matters Most
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Every donation is directed towards the programmes and
                resources that make our initiatives possible. Your
                contribution goes directly to serving the community.
              </p>
            </div>

            <div className="space-y-0 divide-y divide-border">
              {usageItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-1">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA Card */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-10 md:p-14 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-8">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
                Ready to Make a Difference?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto text-pretty">
                Choose to give a one-off amount or set up a regular monthly
                contribution. Every donation makes a real impact.
              </p>

              <div className="flex flex-col items-center gap-4">
                <DonateButton
                  source="donate-cta-card"
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-14 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  One-off or monthly donations available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground leading-relaxed text-sm italic">
              {'"'}Guru Sahib has blessed us with the opportunity to serve
              the Panth. Every contribution, no matter the size, helps
              sustain this work and bring more Sikhs closer to Sikhi.{'"'}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Devanhaar is a UK-based registered charity. All donations are
              gratefully received and carefully allocated.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
