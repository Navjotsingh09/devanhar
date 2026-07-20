import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'

async function getVidyalaData() {
  const supabase = await createClient()
  const [{ data: webinarSignups }, { data: interestSignups }] = await Promise.all([
    supabase
      .from('register_interest')
      .select('*')
      .eq('camp', 'vidyala-webinar')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('register_interest')
      .select('*')
      .eq('camp', 'vidyala-interest')
      .order('created_at', { ascending: false })
      .limit(5000),
  ])

  return {
    webinarSignups: (webinarSignups ?? []) as Array<{
      id: string; name: string; email: string; country: string | null; notes: string | null; created_at: string
    }>,
    interestSignups: (interestSignups ?? []) as Array<{
      id: string; name: string; email: string; dob: string | null; occupation: string | null; schedule: string[] | null; created_at: string
    }>,
  }
}

export default async function VidyalaDashboard() {
  const { webinarSignups, interestSignups } = await getVidyalaData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sikhi Vidyala</h1>
          <p className="text-muted-foreground">Webinar registrations and programme data</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Webinar Signups
            <span className="ml-2 text-sm font-normal text-muted-foreground">({webinarSignups.length})</span>
          </h2>
        </div>

        {webinarSignups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">
            No webinar signups yet.
          </p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">#</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Country</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Notes</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {webinarSignups.map((s, i) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">{s.email}</a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.country ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.notes ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">
                      {new Date(s.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Interest Registrations
            <span className="ml-2 text-sm font-normal text-muted-foreground">({interestSignups.length})</span>
          </h2>
        </div>

        {interestSignups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">
            No interest registrations yet.
          </p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">#</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">DOB</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Occupation</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Schedule</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {interestSignups.map((s, i) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {s.dob ? new Date(s.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014'}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">{s.email}</a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.occupation ?? '\u2014'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.schedule?.length ? s.schedule.join(', ') : '\u2014'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">
                      {new Date(s.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
