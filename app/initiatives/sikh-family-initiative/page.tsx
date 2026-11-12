import { SfiPageContent } from '@/components/cms/sfi-page-content'
import { getPublishedSfiContent } from '@/lib/cms/sfi-server'
import { getPublishedEntries } from '@/lib/cms/entries/server'
import { getSfiOpenBookings } from '@/lib/sfi-open-bookings'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const { seo } = await getPublishedSfiContent()
  return { title: seo.title, description: seo.description, robots: { index: !seo.noIndex, follow: !seo.noIndex },openGraph:{title:seo.socialTitle||seo.title,description:seo.socialDescription||seo.description,...(seo.socialImage?{images:[seo.socialImage]}:{})} }
}
export default async function SikhFamilyInitiativePage() {
  const [content, projects, events] = await Promise.all([getPublishedSfiContent(), getPublishedEntries('project'), getPublishedEntries('event')])
  if (!projects || !events) console.error('[sfi] Could not load published project bookings')
  return <SfiPageContent content={content} openBookings={getSfiOpenBookings(projects ?? [], events ?? [])} />
}
