'use client'

import { VidyalaRowActions } from '@/components/dashboard/vidyala-row-actions'

export interface VidyalaWebinarRow {
  id: string
  name: string
  email: string
  country: string | null
  notes: string | null
  status: string
  created_at: string
}

export function VidyalaWebinarTable({ signups }: { signups: VidyalaWebinarRow[] }) {
  if (signups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No webinar signups yet.</p>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-semibold text-foreground">Name</th>
            <th className="px-4 py-3 font-semibold text-foreground">Email</th>
            <th className="px-4 py-3 font-semibold text-foreground">Country</th>
            <th className="px-4 py-3 font-semibold text-foreground">Notes</th>
            <th className="px-4 py-3 font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 font-semibold text-foreground">Signed Up</th>
            <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {signups.map((s) => (
            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
              <td className="px-4 py-3"><a href={'mailto:' + s.email} className="text-blue-600 hover:underline">{s.email}</a></td>
              <td className="px-4 py-3 text-muted-foreground">{s.country ?? '\u2014'}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.notes ?? '\u2014'}</td>
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
