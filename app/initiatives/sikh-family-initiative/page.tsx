import { SfiPageContent } from '@/components/cms/sfi-page-content'
import { getPublishedSfiContent } from '@/lib/cms/sfi-server'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { seo } = await getPublishedSfiContent()
  return { title: seo.title, description: seo.description, robots: { index: !seo.noIndex, follow: !seo.noIndex },openGraph:{title:seo.socialTitle||seo.title,description:seo.socialDescription||seo.description,...(seo.socialImage?{images:[seo.socialImage]}:{})} }
}
export default async function SikhFamilyInitiativePage() {
  return <SfiPageContent content={await getPublishedSfiContent()} />
}
