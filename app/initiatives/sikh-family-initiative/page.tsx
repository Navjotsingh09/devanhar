import { SfiPageContent } from '@/components/cms/sfi-page-content'
import { getPublishedSfiContent } from '@/lib/cms/sfi-server'
import { pageMetadata } from '@/lib/cms/seo'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { seo } = await getPublishedSfiContent()
  return pageMetadata(seo)
}
export default async function SikhFamilyInitiativePage() {
  return <SfiPageContent content={await getPublishedSfiContent()} />
}
