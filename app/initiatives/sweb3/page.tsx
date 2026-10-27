
import {NativePageSections} from '@/components/cms/native-page-sections'
import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

const originalMetadata: Metadata = {
  title: "Sikh Web3 Initiative | Devanhaar",
  description: "Empowering Sikh communities through blockchain technology and Web3 innovation.",
}

export default async function SWeb3Page({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-sweb3')

  return withPageCopy(((
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section data-cms-section="55c0238e7b2363fe" className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Sikh Web3 Initiative</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Education, participation, and innovation in blockchain and Web3.</p>
          </div>
        </section>
      </main>
      <><NativePageSections /><FooterSection /></>
    </>
  )), cmsCopy)
}

export async function generateMetadata(){return getMigratedPageMetadata('content-sweb3',originalMetadata)}
