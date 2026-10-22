import Link from 'next/link'
import { sitePages } from '@/lib/cms/site-catalog'
import { cmsSlugSchema, pagePath } from '@/lib/cms/page-content'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { CreatePage } from '@/components/cms/create-page'
export default async function WebsitePages() {
  const { client, profile } = await getRequestStaff()
  const isAdmin = ['admin', 'super_admin'].includes(profile.data?.role || '')
  const { data: stored, error } = await client.from('cms_pages').select('id, slug, draft_revision_id, published_revision_id').order('slug')
  if (error) throw new Error('Website pages could not be loaded. Please retry.')
  const available = stored ?? []
  const pages: { title: string; path: string; area: string; editor?: string; slug?: string }[] = sitePages.map(page => ({ ...page, slug: page.path === '/' ? 'home' : page.path === '/initiatives/sikh-family-initiative' ? 'sfi' : undefined }))
  for (const page of available) if (page.slug.startsWith('page-') && cmsSlugSchema.safeParse(page.slug).success) pages.push({ title: page.slug.slice(5).replace(/-/g, ' '), path: pagePath(page.slug), area: 'Custom pages', editor: `/dashboard/website/pages/${page.slug}`, slug: page.slug })
  const visible = isAdmin ? pages : pages.filter(page => page.slug && available.some(p => p.slug === page.slug))
  return <div className="space-y-6"><header><Link href="/dashboard/website" className="text-sm underline">Website & content</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Website pages</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Open an editor to view your assigned content. Homepage, SFI and custom pages support drafts, previews and publishing. Existing pages marked “Managed in code” keep their current layouts.</p></header>{isAdmin && <CreatePage />}<div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">Website pages and editing coverage</caption><thead className="bg-muted"><tr>{['Page','Area','Status','Actions'].map(label => <th key={label} className="px-4 py-3" scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(page => {
    const stored = available.find(p => p.slug === page.slug)
    return <tr key={page.path} className="border-t"><td className="px-4 py-4"><p className="font-medium capitalize">{page.title}</p><p className="mt-1 text-xs text-muted-foreground">{page.path}</p></td><td className="px-4 py-4">{page.area}</td><td className="px-4 py-4">{stored?.draft_revision_id ? stored.published_revision_id ? 'Live · draft changes' : 'Draft only' : stored?.published_revision_id ? 'Published' : page.slug ? 'Original website content' : page.editor ? 'Existing tool' : 'Managed in code'}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-4">{(!page.slug?.startsWith('page-') || stored?.published_revision_id) && <Link href={page.path} target="_blank" rel="noreferrer" className="underline">View page ↗</Link>}{page.editor && <Link href={page.editor} className="font-medium underline">{page.slug ? 'Open editor' : 'Manage'}</Link>}</div></td></tr>
  })}</tbody></table>{!visible.length && <p className="p-6 text-sm text-muted-foreground">No website pages have been assigned to this account.</p>}</div></div>
}
