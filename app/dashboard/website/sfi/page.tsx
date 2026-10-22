import { SfiEditor } from '@/components/cms/sfi-editor'
import { CmsError, getSfiEditorState } from '@/lib/cms/sfi-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export default async function SfiEditorPage() {
  let initial
  try { initial = await getSfiEditorState() }
  catch (error) {
    if (error instanceof CmsError && error.status === 401) redirect('/auth/login')
    return <div role="alert" className="mx-auto max-w-2xl rounded-xl border bg-card p-8"><h1 className="text-2xl font-semibold">Website editor</h1><p className="mt-4 text-muted-foreground">{error instanceof CmsError ? error.message : 'The editor could not be loaded. Please try again.'}</p><p className="mt-3 text-sm">The published website has not been changed.</p></div>
  }
  return <SfiEditor initial={initial} />
}
