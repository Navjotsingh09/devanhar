import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowUpRight, FolderOpen } from 'lucide-react'
import { findProjectSpace, projectSpacePath } from '@/lib/project-spaces'

export default async function ProjectSpacePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const found=findProjectSpace(slug)
  if(!found) notFound()
  const {space,parent}=found
  if(space.dashboardPath) redirect(space.dashboardPath)
  return <div className="space-y-8">
    <header>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Project space</p>
      {parent && <Link href={projectSpacePath(parent)} prefetch={false} className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-4">{parent.title}</Link>}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{space.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{space.children?.length ? 'Choose a subproject below to open its space.' : 'This project has its own space. Staff tools have not been connected here yet.'}</p>
    </header>
    {!!space.children?.length && <section aria-label="Subprojects" className="grid gap-4 sm:grid-cols-2">
      {space.children.map(child=><Link key={child.id} href={projectSpacePath(child)} prefetch={false} className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:bg-muted/40 focus-visible:outline focus-visible:outline-2"><FolderOpen aria-hidden="true" className="h-5 w-5 text-muted-foreground" /><span className="flex-1 font-medium">{child.title}</span><ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>)}
    </section>}
    {space.publicPath && <a href={space.publicPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">View project website<ArrowUpRight aria-hidden="true" className="h-4 w-4" /><span className="sr-only"> (opens in a new tab)</span></a>}
  </div>
}
