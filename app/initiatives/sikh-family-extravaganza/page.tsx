import {getMigratedPageMetadata} from '@/lib/cms/page-seo-server'

import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {getPublicPageCopy} from '@/lib/cms/copy-server'
import {withPageCopy} from '@/components/cms/page-copy-server'
import { FamilyProjectPage } from "@/components/family-initiative/family-project-page"

const originalMetadata = {
  title: "Sikh Family Extravaganza | Sikh Family Initiative | Devanhaar",
  description: "A large Sikh family celebration bringing generations together through activities, connection and community.",
}

export default async function SikhFamilyExtravaganzaPage({ cmsCopy: suppliedCopy }: {cmsCopy?:PageCopy} = {}) {
  const cmsCopy = suppliedCopy ?? await getPublicPageCopy('content-sikh-family-extravaganza')

  return withPageCopy(((
    <FamilyProjectPage
      eyebrow="Sikh Family Initiative"
      title="Sikh Family Extravaganza"
      subtitle="A vibrant family experience designed to bring generations together through community, activities and shared memories."
      date="Provisional · December 2027 – January 2028"
      body={[
        "The Sikh Family Extravaganza is designed as a large, welcoming family event where parents, children and extended families can spend meaningful time together in a Sikh-led community environment.",
        "The programme will combine family activities, entertainment, opportunities to connect and a strong sense of sangat. Full programme details will be announced as the event is confirmed.",
        "The current event window is provisional. We will publish the confirmed date and registration details here as soon as they are finalised.",
      ]}
      ctaHref="/initiatives/sikh-family-initiative"
      ctaLabel="See all upcoming dates"
    />
  )), cmsCopy)
}

export async function generateMetadata(){return getMigratedPageMetadata('content-sikh-family-extravaganza',originalMetadata)}
