
import {NativePageSections} from '@/components/cms/native-page-sections'
import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { WolfRunContent } from "@/components/wolfrun/wolfrun-content"

const originalMetadata: Metadata = {
  title: "Wolf Run for Devanhaar | Born to Battle. Built to Endure.",
  description:
    "Join the Devanhaar pack for the Wolf Run — the UK's wildest obstacle run. Become a fundraiser, share your link, and collect sponsorships to support Sikh education, camps, and community programmes.",
  keywords: [
    "Wolf Run",
    "Devanhaar",
    "charity run",
    "fundraising",
    "Sikh charity",
    "obstacle run",
    "Singhs Camp UK",
    "Kaurs Camp UK",
    "sponsorship",
  ],
  openGraph: {
    title: "Wolf Run for Devanhaar | Born to Battle. Built to Endure.",
    description:
      "Join the Devanhaar pack for the Wolf Run. Become a fundraiser and collect sponsorships to support Sikh education and community programmes.",
  },
}

export default async function WolfRunPage({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-events-wolfrun')

  return withPageCopy(((
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollAnimations />
      <WolfRunContent />
      <><NativePageSections /><FooterSection /></>
    </main>
  )), cmsCopy)
}

export async function generateMetadata(){return getMigratedPageMetadata('content-events-wolfrun',originalMetadata)}
