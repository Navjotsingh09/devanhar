import { PageEditor } from '@/components/cms/page-editor'
import { CmsError, getPageEditorState } from '@/lib/cms/page-server'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let initial
  try { initial = await getPageEditorState(slug) }
  catch (error) {
    if (error instanceof CmsError && error.status === 401) redirect('/auth/login')
    return <div role="alert" className="rounded-xl border p-8"><h1 className="text-2xl font-semibold">Website editor</h1><p className="mt-4">{error instanceof CmsError ? error.message : 'The editor could not be loaded. Please retry.'}</p></div>
  }
  return <PageEditor slug={slug} initial={initial} />
}
