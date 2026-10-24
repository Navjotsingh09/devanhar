import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

const originalMetadata: Metadata = {
  title: "Community Forums | Devanhaar",
  description: "Join local Sikh community forums across the UK.",
}

export default async function ForumsPage({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-forums')

  return withPageCopy(((
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Community Forums</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Derby, London, and Birmingham community groups with regular meetups.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )), cmsCopy)
}

export async function generateMetadata(){return getMigratedPageMetadata('content-forums',originalMetadata)}
