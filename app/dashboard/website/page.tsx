import Link from 'next/link'
import { WebsiteSummary } from '@/components/cms/website-summary'
import { StructuredSummary } from '@/components/cms/structured-summary'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sitePages } from '@/lib/cms/site-catalog'

const tools = [
  {title:'SEO & social sharing',description:'Edit page search metadata, indexing and social sharing images through saved drafts.',href:'/dashboard/website/seo'},
  {title:'Navigation & branding',description:'Preview and publish the shared menu, logos, accent colour, contact details and footer links.',href:'/dashboard/website/pages/site-settings'},
  {title:'Media library',description:'Upload, search, describe and reuse images, videos and PDF documents.',href:'/dashboard/website/media'},
  {title:'Subscribers',description:'Search, export and manage newsletter consent.',href:'/dashboard/newsletter'},
  ...(['project','event','announcement','notification','faq'] as const).map(kind=>({title:kind==='faq'?'FAQs':kind[0].toUpperCase()+kind.slice(1)+'s',description:'Manage drafts, publishing, visibility and revision history.',href:`/dashboard/website/content/${kind}`})),
  { title: 'All content drafts', description: 'Continue saved page, project, event, notice, FAQ and article drafts you can access.', href: '/dashboard/website/drafts' },
  { title: 'Homepage builder', description: 'Edit homepage content, reorder sections, preview and publish.', href: '/dashboard/website/pages/home' },
  { title: 'Website pages', description: `Map ${sitePages.length} canonical content pages across Devanhaar, with current editing coverage.`, href: '/dashboard/website/pages' },
  { title: 'Content assignments', description: 'Delegate viewing, editing and publishing to Content Managers.', href: '/dashboard/website/assignments' },
  { title: 'Activity log', description: 'Review recorded changes and publishing actions.', href: '/dashboard/activity' },
  { title: 'Blog & insights', description: 'Manage articles, covers and publication using the existing blog tools.', href: '/dashboard/blog' },
  { title: 'Site images', description: 'Manage the existing website image collection.', href: '/dashboard/images' },
  { title: 'Products', description: 'Manage shop products in the current catalogue.', href: '/dashboard/products' },
  { title: 'Orders', description: 'Review customer orders and their status.', href: '/dashboard/orders' },
  { title: 'Submissions', description: 'Review incoming enquiries and website form submissions.', href: '/dashboard/submissions' },
  { title: 'Vacancies', description: 'Manage recruitment and applications.', href: '/dashboard/vacancies' },
  { title: 'Registration windows', description: 'Manage programme registration availability.', href: '/dashboard/registration-windows' },
  { title: 'CRM overview', description: 'Return to existing operations, emergencies, payments and programme tools.', href: '/dashboard' },
]

export default async function WebsiteOverview() {
  const {client,profile}=await getRequestStaff()
  if(profile.data?.role==='content_manager') {
    const {data:assigned,error}=await client.from('cms_pages').select('slug').order('slug')
    if(error)throw new Error('Your assigned content could not be loaded')
    return <div className="space-y-6"><header><h1 className="text-3xl font-semibold tracking-tight">Your website content</h1><p className="mt-2 text-sm text-muted-foreground">Open your assigned pages to view, edit or publish according to your permissions.</p></header><div className="flex flex-wrap gap-4"><Link href="/dashboard/website/content/project" className="text-sm underline">Assigned projects</Link><Link href="/dashboard/website/content/event" className="text-sm underline">Assigned events</Link><Link href="/dashboard/website/content/faq" className="text-sm underline">Assigned FAQs</Link></div><WebsiteSummary /><Link href="/dashboard/website/pages" className="block rounded-xl border p-6 font-semibold">Your assigned pages →</Link><Link href="/dashboard/activity" className="inline-block text-sm underline">View your activity</Link></div>
  }
  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-muted-foreground">Devanhaar · Website & CRM</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Website & content</h1><p className="mt-2 max-w-3xl text-muted-foreground">One starting point for the whole Devanhaar website and its existing management tools.</p></div>
    <WebsiteSummary />
    <StructuredSummary />
    <Card className="border-amber-300/50"><CardHeader><CardTitle>CMS rollout across Devanhaar</CardTitle><CardDescription>Edit the homepage, programme pages and organisation pages through drafts, responsive previews and publishing. The existing Devanhaar layouts and operational tools are preserved.</CardDescription></CardHeader><CardContent><Link className="font-medium underline underline-offset-4" href="/dashboard/website/pages">Open the website page inventory →</Link></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl focus-visible:outline focus-visible:outline-2"><Card className="h-full transition-shadow hover:shadow-md"><CardHeader><CardTitle className="text-lg">{tool.title} →</CardTitle><CardDescription>{tool.description}</CardDescription></CardHeader></Card></Link>)}</div>
    <p className="text-sm text-muted-foreground">Your current account permissions still apply to every tool. Programme managers retain access to their assigned programmes.</p>
  </div>
}
