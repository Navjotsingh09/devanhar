import Link from 'next/link'
import { sitePages } from '@/lib/cms/site-catalog'
import { createClient } from '@/lib/supabase/server'

export default async function WebsitePages() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('admin_profiles').select('role').eq('id', user.id).single() : { data: null }
  const isAdmin = ['admin', 'super_admin'].includes(profile?.role || '')
  const { data: assigned } = profile?.role === 'content_manager' ? await supabase.from('cms_pages').select('id').eq('slug', 'sfi').maybeSingle() : { data: null }
  const canEditSfi = isAdmin || !!assigned
  const pages = profile?.role === 'content_manager' ? sitePages.filter(page => 'editor' in page && page.editor === '/dashboard/website/sfi' && !!assigned) : sitePages
  return <div className="space-y-6">
    <div><Link href="/dashboard/website" className="text-sm underline underline-offset-4">Website & content</Link><h1 className="mt-3 text-3xl font-bold tracking-tight">Website page inventory</h1><p className="mt-2 max-w-3xl text-muted-foreground">{pages.length} available content pages across Devanhaar. Short links, sign-in, checkout and individual article or product routes are excluded. “Managed in code” means a page editor still needs to be built.</p></div>
    <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">Devanhaar website content editing coverage</caption><thead className="bg-muted"><tr>{['Page', 'Area', 'Current editing', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{pages.map(page => {
      const editor = 'editor' in page ? page.editor : undefined
      const isSfi = editor === '/dashboard/website/sfi'
      return <tr key={page.path} className="border-t"><td className="px-4 py-4"><p className="font-medium">{page.title}</p><p className="mt-1 text-xs text-muted-foreground">{page.path}</p></td><td className="px-4 py-4">{page.area}</td><td className="px-4 py-4">{isSfi ? 'Draft · preview · publish' : editor ? 'Existing management tool' : 'Managed in code'}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-4"><Link href={page.path} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">View page ↗</Link>{editor && (!isSfi || canEditSfi) && <Link href={editor} className="font-medium underline underline-offset-4">{isSfi ? 'Edit page' : 'Manage'}</Link>}{isSfi && !canEditSfi && <span className="text-muted-foreground">Editor access required</span>}</div></td></tr>
    })}</tbody></table></div>
  </div>
}
