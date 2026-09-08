import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'
import { VidyalaSubNav } from '@/components/dashboard/vidyala-sub-nav'
import { VidyalaWebinarTable, type VidyalaWebinarRow } from '@/components/dashboard/vidyala-webinar-table'

export const dynamic = 'force-dynamic'

async function getWebinarSignups(): Promise<VidyalaWebinarRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('register_interest')
    .select('id, name, email, country, notes, status, created_at')
    .eq('camp', 'vidyala-webinar')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (data ?? []) as VidyalaWebinarRow[]
}

export default async function VidyalaWebinarPage() {
  const webinarSignups = await getWebinarSignups()

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
            Webinar Signups
            <span className="ml-2 text-sm font-normal text-muted-foreground">({webinarSignups.length})</span>
          </h2>
        </div>
        <VidyalaWebinarTable signups={webinarSignups} />
      </section>
    </div>
  )
}
