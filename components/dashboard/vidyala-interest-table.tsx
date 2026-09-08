'use client'

import { VidyalaRowActions } from '@/components/dashboard/vidyala-row-actions'

export interface VidyalaInterestRow {
  id: string
  name: string
  email: string
  dob: string | null
  occupation: string | null
  schedule: string[] | null
  status: string
  created_at: string
}

export function VidyalaInterestTable({ signups }: { signups: VidyalaInterestRow[] }) {
  if (signups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No interest registrations yet.</p>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-semibold text-foreground">Name</th>
            <th className="px-4 py-3 font-semibold text-foreground">DOB</th>
            <th className="px-4 py-3 font-semibold text-foreground">Email</th>
            <th className="px-4 py-3 font-semibold text-foreground">Occupation</th>
            <th className="px-4 py-3 font-semibold text-foreground">Schedule</th>
            <th className="px-4 py-3 font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 font-semibold text-foreground">Signed Up</th>
            <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {signups.map((s) => (
            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {s.dob ? new Date(s.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014'}
              </td>
              <td className="px-4 py-3"><a href={'mailto:' + s.email} className="text-blue-600 hover:underline">{s.email}</a></td>
              <td className="px-4 py-3 text-muted-foreground">{s.occupation ?? '\u2014'}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.schedule?.length ? s.schedule.join(', ') : '\u2014'}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{s.status}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {new Date(s.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-4 py-3">
                <VidyalaRowActions
                  id={s.id}
                  sourceTable="register_interest"
                  status={s.status}
                  recipientLabel={s.name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
