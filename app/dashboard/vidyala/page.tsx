import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'
import { VidyalaSubNav } from '@/components/dashboard/vidyala-sub-nav'
import { VidyalaApplicationsTable, type VidyalaApplicationRow } from '@/components/dashboard/vidyala-applications-table'

export const dynamic = 'force-dynamic'

async function getApplications(): Promise<VidyalaApplicationRow[]> {
  const supabase = await createClient()
  const applications: VidyalaApplicationRow[] = []
  let cursor: number | undefined

  // The database API caps individual reads; fetch every row staff may access.
  while (true) {
    let query = supabase.from('vidyala_applications').select('*').order('id', { ascending: false }).limit(500)
    if (cursor !== undefined) query = query.lt('id', cursor)
    const { data, error } = await query
    if (error) throw new Error('Could not load all Vidyala applications')
    if (!data?.length) break
    const batch = data as VidyalaApplicationRow[]
    applications.push(...batch)
    cursor = batch[batch.length - 1].id
  }
  return applications.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id)
}

export default async function VidyalaApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sikhi Vidyala</h1>
          <p className="text-muted-foreground">Applications, webinar signups and interest registrations</p>
        </div>
      </div>

      <VidyalaSubNav />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Vidyala Applications <span className="ml-2 text-sm font-normal text-muted-foreground">({applications.length})</span>
          </h2>
        </div>
        <VidyalaApplicationsTable applications={applications} />
      </section>
    </div>
  )
}
