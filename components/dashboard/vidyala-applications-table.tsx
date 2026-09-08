'use client'

import { VidyalaRowActions } from '@/components/dashboard/vidyala-row-actions'

export interface VidyalaApplicationRow {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  status: string
  created_at: string
}

export function VidyalaApplicationsTable({ applications }: { applications: VidyalaApplicationRow[] }) {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No Vidyala applications yet.</p>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-semibold text-foreground">Applicant</th>
            <th className="px-4 py-3 font-semibold text-foreground">Email</th>
            <th className="px-4 py-3 font-semibold text-foreground">Phone</th>
            <th className="px-4 py-3 font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 font-semibold text-foreground">Applied</th>
            <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((application) => {
            const name = application.first_name + ' ' + (application.middle_name ? application.middle_name + ' ' : '') + application.last_name
            return (
              <tr key={application.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{name}</td>
                <td className="px-4 py-3"><a href={'mailto:' + application.email} className="text-blue-600 hover:underline">{application.email}</a></td>
                <td className="px-4 py-3 text-muted-foreground">{application.phone}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{application.status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(application.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <VidyalaRowActions
                    id={String(application.id)}
                    sourceTable="vidyala_applications"
                    status={application.status}
                    recipientLabel={name}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
