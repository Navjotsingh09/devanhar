import Link from 'next/link'
import {migratedPages} from '@/lib/cms/migrated-content'
import Form from 'next/form'
import { sitePages } from '@/lib/cms/site-catalog'
import { cmsSlugSchema, pagePath } from '@/lib/cms/page-content'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { CreatePage } from '@/components/cms/create-page'
export default async function WebsitePages({ searchParams }: {searchParams: Promise<{status?: string; q?: string}>}) {
  const params = await searchParams
  const filter = ['draft','published'].includes(params.status || '') ? params.status : 'all'
  const search = (params.q || '').trim().slice(0,160).toLowerCase()
  const { client, profile } = await getRequestStaff()
  const isAdmin = ['admin', 'super_admin'].includes(profile.data?.role || '')
  const { data: stored, error } = await client.from('cms_pages').select('id, slug, draft_revision_id, published_revision_id, updated_at, updated_by').order('slug')
  if (error) throw new Error('Website pages could not be loaded. Please retry.')
  const available = stored ?? []
  const pages: { title: string; path: string; area: string; editor?: string; slug?: string }[] = sitePages.map(page => {const slug=Object.keys(migratedPages).find(s=>migratedPages[s].path===page.path);return {...page,editor:slug?`/dashboard/website/pages/${slug}`:page.editor,slug:page.path==='/'?'home':page.path==='/initiatives/sikh-family-initiative'?'sfi':slug}})
  for (const page of available) if (page.slug.startsWith('page-') && cmsSlugSchema.safeParse(page.slug).success) pages.push({ title: page.slug.slice(5).replace(/-/g, ' '), path: pagePath(page.slug), area: 'Custom pages', editor: `/dashboard/website/pages/${page.slug}`, slug: page.slug })
  const assignedPages = isAdmin ? pages : pages.filter(page => page.slug && available.some(p => p.slug === page.slug))
  const visible = assignedPages.filter(page => {
    const row = available.find(p => p.slug === page.slug)
    return (!search || `${page.title} ${page.path}`.toLowerCase().includes(search)) && (filter === 'all' || (filter === 'draft' ? !!row?.draft_revision_id : !!row?.published_revision_id))
  })
  const userIds = [...new Set(available.map(p => p.updated_by).filter(Boolean))]
  const {data: editors} = userIds.length ? await client.from('admin_profiles').select('id, full_name').in('id',userIds) : {data: []}
  return <div className="space-y-6"><header><Link href="/dashboard/website" className="text-sm underline">Website & content</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Website pages</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Open an editor to view your assigned content. Page content supports drafts, previews, revision history and publishing. Existing page layouts, forms and programme tools retain their design and behaviour.</p></header>{isAdmin && <CreatePage />}<Form action="/dashboard/website/pages" className="flex flex-wrap gap-3"><label className="sr-only" htmlFor="page-query">Search pages</label><input id="page-query" name="q" defaultValue={params.q} placeholder="Search pages…" className="rounded-lg border bg-background px-3 py-2 text-sm" /><label className="sr-only" htmlFor="page-status">Page status</label><select id="page-status" name="status" defaultValue={filter} className="rounded-lg border bg-background px-3 py-2 text-sm"><option value="all">All pages</option><option value="draft">Drafts</option><option value="published">Published</option></select><button className="rounded-lg border px-4 py-2 text-sm font-medium" type="submit">Apply filters</button></Form><div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">Website pages and editing coverage</caption><thead className="bg-muted"><tr>{['Page','Area','Status','Last edited','Actions'].map(label => <th key={label} className="px-4 py-3" scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(page => {
    const stored = available.find(p => p.slug === page.slug)
    return <tr key={page.path} className="border-t"><td className="px-4 py-4"><p className="font-medium capitalize">{page.title}</p><p className="mt-1 text-xs text-muted-foreground">{page.path}</p></td><td className="px-4 py-4">{page.area}</td><td className="px-4 py-4">{stored?.draft_revision_id ? stored.published_revision_id ? 'Live · draft changes' : 'Draft only' : stored?.published_revision_id ? 'Published' : page.slug ? 'Original website content' : page.editor ? 'Existing tool' : 'Managed in code'}</td><td className="px-4 py-4">{stored?.updated_at ? <><p>{new Date(stored.updated_at).toLocaleString('en-GB',{timeZone:'Europe/London'})}</p><p className="mt-1 text-xs text-muted-foreground">{editors?.find(e=>e.id===stored.updated_by)?.full_name || 'Staff editor'}</p></> : '—'}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-4">{(!page.slug?.startsWith('page-') || stored?.published_revision_id) && <Link href={page.path} target="_blank" rel="noreferrer" className="underline">View page ↗</Link>}{page.editor && <Link href={page.editor} className="font-medium underline">{page.slug ? 'Open editor' : 'Manage'}</Link>}</div></td></tr>
  })}</tbody></table>{!visible.length && <p className="p-6 text-sm text-muted-foreground">No website pages have been assigned to this account.</p>}</div></div>
}
