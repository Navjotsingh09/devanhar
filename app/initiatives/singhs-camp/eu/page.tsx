import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RegisterInterestForm } from "@/components/register-interest-form"

const originalMetadata = {
  title: "Singhs Camp EU 2027 — Register interest | Devanhaar",
  description:
    "Register your interest for Singhs Camp EU launching in 2027. Be the first to hear when applications open.",
}

export default async function SinghsCampEuPage({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-singhs-camp-eu')

  return withPageCopy(((
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
            Singhs Camp EU 2027
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
            Register your interest
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Singhs Camp EU is launching in 2027. Drop your details below and we
            will let you know as soon as applications open.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <RegisterInterestForm camp="singhs-camp-eu" />
        </div>
      </section>
    </main>
  )), cmsCopy)
}

export async function generateMetadata(){return getMigratedPageMetadata('content-singhs-camp-eu',originalMetadata)}
