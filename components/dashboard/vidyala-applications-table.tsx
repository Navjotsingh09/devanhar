'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { VidyalaRowActions } from '@/components/dashboard/vidyala-row-actions'
import { VidyalaApplicationDetailDialog } from '@/components/dashboard/vidyala-application-detail-dialog'

export interface VidyalaApplicationRow {
  id: number
  initiative_id: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  date_of_birth: string
  email: string
  phone: string
  address: string
  id_document_url: string | null
  has_dbs_check: boolean | null
  dbs_certificate_url: string | null
  emergency_contact_1_name: string
  emergency_contact_1_relationship: string
  emergency_contact_1_phone: string
  emergency_contact_2_name: string | null
  emergency_contact_2_relationship: string | null
  emergency_contact_2_phone: string | null
  is_amritdhari: boolean | null
  sikhi_journey: string | null
  english_ability: string | null
  panjabi_ability: string | null
  can_commit: boolean | null
  funding_option: string | null
  accommodation_option: string | null
  requires_visa: boolean | null
  requires_visa_support: boolean | null
  motivation: string | null
  current_seva: string | null
  what_to_learn: string | null
  continue_parchaar: boolean | null
  how_heard: string | null
  page_url: string | null
  source: string | null
  medium: string | null
  status: string
  internal_notes: string | null
  created_at: string
  updated_at: string | null
}

export function VidyalaApplicationsTable({ applications }: { applications: VidyalaApplicationRow[] }) {
  const [viewing, setViewing] = useState<VidyalaApplicationRow | null>(null)

  if (applications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No Vidyala applications yet.</p>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View full application"
                        onClick={() => setViewing(application)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View full application</span>
                      </Button>
                      <VidyalaRowActions
                        id={String(application.id)}
                        sourceTable="vidyala_applications"
                        status={application.status}
                        recipientLabel={name}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <VidyalaApplicationDetailDialog application={viewing} onOpenChange={(open) => { if (!open) setViewing(null) }} />
    </>
  )
}
