import Link from 'next/link'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { migratedPages } from '@/lib/cms/migrated-content'
import { pagePath, cmsSlugSchema } from '@/lib/cms/page-content'

export default async function SeoOverview() {
  const { client, profile } = await getRequestStaff()
  const { data, error } = await client.from('cms_pages').select('slug').order('slug')
  if (error) throw new Error('SEO editing access could not be loaded. Please retry.')
  const isAdmin = ['admin', 'super_admin'].includes(profile.data?.role ?? '')
  const assigned = new Set((data ?? []).map(page => page.slug))
  const pages = [
    { slug: 'home', title: 'Homepage', path: '/', editor: '/dashboard/website/pages/home?tab=seo' },
    { slug: 'sfi', title: 'Sikh Family Initiative', path: '/sfi', editor: '/dashboard/website/sfi' },
    ...Object.entries(migratedPages).map(([slug, page]) => ({ slug, title: page.title, path: page.path, editor: `/dashboard/website/pages/${slug}?tab=seo` })),
    ...(data ?? []).filter(page => page.slug.startsWith('page-') && cmsSlugSchema.safeParse(page.slug).success).map(page => ({
      slug: page.slug, title: page.slug.slice(5).replace(/-/g, ' '), path: pagePath(page.slug), editor: `/dashboard/website/pages/${page.slug}?tab=seo`,
    })),
  ].filter(page => isAdmin || assigned.has(page.slug))
  return <div className="space-y-6">
    <header><Link href="/dashboard/website" className="text-sm underline">Website & content</Link><h1 className="mt-3 text-3xl font-semibold">SEO & social sharing</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Manage search titles, descriptions, indexing and social sharing images using each page&apos;s draft, preview and publish workflow. Existing public addresses are preserved.</p></header>
    <div className="grid gap-4 md:grid-cols-2">{pages.map(page => <Link key={page.slug} href={page.editor} className="rounded-xl border bg-card p-5"><h2 className="font-semibold">{page.title}</h2><p className="mt-2 text-sm text-muted-foreground">{page.path}</p><p className="mt-3 text-sm underline">Edit SEO and social sharing</p></Link>)}</div>
    {!pages.length && <p className="rounded-xl border p-5 text-sm">No website pages have been assigned to this account.</p>}
    <p className="text-sm text-muted-foreground">Project and event SEO remains in the corresponding structured-content editors. Article metadata remains in the article editor.</p>
  </div>
}
