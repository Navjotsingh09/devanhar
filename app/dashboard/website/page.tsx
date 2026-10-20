import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sitePages } from '@/lib/cms/site-catalog'

const tools = [
  { title: 'Website pages', description: `Map ${sitePages.length} canonical content pages across Devanhaar, with current editing coverage.`, href: '/dashboard/website/pages' },
  { title: 'Blog & insights', description: 'Manage articles, covers and publication using the existing blog tools.', href: '/dashboard/blog' },
  { title: 'Site images', description: 'Manage the existing website image collection.', href: '/dashboard/images' },
  { title: 'Products', description: 'Manage shop products in the current catalogue.', href: '/dashboard/products' },
  { title: 'Orders', description: 'Review customer orders and their status.', href: '/dashboard/orders' },
  { title: 'Submissions', description: 'Review incoming enquiries and website form submissions.', href: '/dashboard/submissions' },
  { title: 'Vacancies', description: 'Manage recruitment and applications.', href: '/dashboard/vacancies' },
  { title: 'Registration windows', description: 'Manage programme registration availability.', href: '/dashboard/registration-windows' },
  { title: 'CRM overview', description: 'Return to existing operations, emergencies, payments and programme tools.', href: '/dashboard' },
]

export default function WebsiteOverview() {
  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-muted-foreground">Devanhaar · Website & CRM</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Website & content</h1><p className="mt-2 max-w-3xl text-muted-foreground">One starting point for the whole Devanhaar website and its existing management tools.</p></div>
    <Card className="border-amber-300/50"><CardHeader><CardTitle>CMS rollout across Devanhaar</CardTitle><CardDescription>The page inventory covers the organisation and all programmes. The SFI page has the first draft, preview and publish editor. Other page layouts still need to be connected to the CMS; their current editing status is listed individually.</CardDescription></CardHeader><CardContent><Link className="font-medium underline underline-offset-4" href="/dashboard/website/pages">Open the website page inventory →</Link></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl focus-visible:outline focus-visible:outline-2"><Card className="h-full transition-shadow hover:shadow-md"><CardHeader><CardTitle className="text-lg">{tool.title} →</CardTitle><CardDescription>{tool.description}</CardDescription></CardHeader></Card></Link>)}</div>
    <p className="text-sm text-muted-foreground">Your current account permissions still apply to every tool. Programme managers retain access to their assigned programmes.</p>
  </div>
}
