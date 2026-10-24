import Link from 'next/link'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { getBlogStaff } from '@/lib/blog-staff-server'
import { kindSchema } from '@/lib/cms/entries/content'

export default async function DraftInbox() {
  const { client } = await getRequestStaff()
  const blogAccess = await getBlogStaff()
  const [pages, entries, articles] = await Promise.all([
    client.from('cms_pages').select('slug,updated_at,draft_revision_id').not('draft_revision_id', 'is', null).order('updated_at', { ascending: false }).limit(100),
    client.from('cms_entries').select('slug,kind,updated_at,draft_revision_id').eq('archived', false).not('draft_revision_id', 'is', null).order('updated_at', { ascending: false }).limit(100),
    blogAccess.allowed ? client.from('blog_posts').select('slug,updated_at,draft_revision_id').is('archived_at', null).not('draft_revision_id', 'is', null).order('updated_at', { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
  ])
  if (pages.error || entries.error || articles.error) throw new Error('The draft inbox could not be loaded. Please retry.')
  const rows = [
    ...(pages.data ?? []).map(page => ({ ...page, type: 'Page', href: page.slug === 'sfi' ? '/dashboard/website/sfi' : `/dashboard/website/pages/${page.slug}` })),
    ...(entries.data ?? []).filter(entry => kindSchema.safeParse(entry.kind).success).map(entry => ({ ...entry, type: entry.kind, href: `/dashboard/website/content/${entry.kind}/${entry.slug}` })),
    ...(articles.data ?? []).map(article => ({ ...article, type: 'Article', href: `/dashboard/blog/${article.slug}/edit` })),
  ].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
  return <div className="space-y-6">
    <header><Link href="/dashboard/website" className="text-sm underline">Website & content</Link><h1 className="mt-3 text-3xl font-semibold">All content drafts</h1><p className="mt-2 text-sm text-muted-foreground">Saved page, structured-content and article drafts you can access. Each editor retains its own preview, publishing permissions and revision history.</p></header>
    <p className="text-sm text-muted-foreground">Showing up to 100 most recently edited drafts per content type. Use the individual content managers for older drafts.</p>
    <ul className="divide-y rounded-xl border">{rows.map(row => <li key={`${row.type}:${row.slug}`} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><Link href={row.href} className="font-semibold underline">{row.slug.replace(/^(page-|content-)/, '').replace(/-/g, ' ')}</Link><p className="mt-1 text-sm capitalize text-muted-foreground">{row.type}</p></div><time className="text-sm text-muted-foreground" dateTime={row.updated_at}>{new Date(row.updated_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })}</time></li>)}</ul>
    {!rows.length && <p className="rounded-xl border p-6">No saved drafts are available to this account.</p>}
  </div>
}
