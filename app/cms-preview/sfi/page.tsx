import { SfiPageContent } from '@/components/cms/sfi-page-content'
import { getSfiEditorState, CmsError } from '@/lib/cms/sfi-server'
import { redirect, notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'SFI draft preview', robots: { index: false, follow: false } }
export default async function SfiPreviewPage() {
  let state
  try { state = await getSfiEditorState() }
  catch (error) {
    if (error instanceof CmsError && error.status === 401) redirect('/auth/login')
    notFound()
  }
  return <SfiPageContent content={state.content} />
}
