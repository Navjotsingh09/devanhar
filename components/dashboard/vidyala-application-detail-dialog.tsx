'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { VidyalaApplicationRow } from '@/components/dashboard/vidyala-applications-table'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground break-words">{value}</div>
    </div>
  )
}

function DocumentLink({ path }: { path: string | null | undefined }) {
  if (!path) return <span className="text-sm text-muted-foreground">Not uploaded</span>
  return (
    <a
      href={'/api/camp-applications/view-id?path=' + encodeURIComponent(path) + '&source=vidyala'}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium underline break-all text-sm"
    >
      View document
    </a>
  )
}

function yesNo(value: boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return value ? 'Yes' : 'No'
}

interface VidyalaApplicationDetailDialogProps {
  application: VidyalaApplicationRow | null
  onOpenChange: (open: boolean) => void
}

export function VidyalaApplicationDetailDialog({ application, onOpenChange }: VidyalaApplicationDetailDialogProps) {
  const open = application !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {application && (
          <>
            <DialogHeader>
              <DialogTitle>
                {application.first_name} {application.middle_name ? application.middle_name + ' ' : ''}{application.last_name}
              </DialogTitle>
              <DialogDescription>
                Applied {new Date(application.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} &middot; Status: <span className="capitalize">{application.status}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 rounded-lg p-3">
                <h3 className="col-span-full text-sm font-semibold text-foreground">Personal details</h3>
                <Field label="Date of birth" value={new Date(application.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <Field label="Email" value={<a href={'mailto:' + application.email} className="text-blue-600 hover:underline">{application.email}</a>} />
                <Field label="Phone" value={application.phone} />
                <Field label="Address" value={application.address} />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 rounded-lg p-3">
                <h3 className="col-span-full text-sm font-semibold text-foreground">Documents</h3>
                <Field label="Photo ID" value={<DocumentLink path={application.id_document_url} />} />
                <Field label="Has DBS check" value={yesNo(application.has_dbs_check)} />
                <Field label="DBS certificate" value={<DocumentLink path={application.dbs_certificate_url} />} />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 rounded-lg p-3">
                <h3 className="col-span-full text-sm font-semibold text-foreground">Emergency contacts</h3>
                <Field label="Contact 1 name" value={application.emergency_contact_1_name} />
                <Field label="Contact 1 relationship" value={application.emergency_contact_1_relationship} />
                <Field label="Contact 1 phone" value={application.emergency_contact_1_phone} />
                <Field label="Contact 2 name" value={application.emergency_contact_2_name} />
                <Field label="Contact 2 relationship" value={application.emergency_contact_2_relationship} />
                <Field label="Contact 2 phone" value={application.emergency_contact_2_phone} />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 rounded-lg p-3">
                <h3 className="col-span-full text-sm font-semibold text-foreground">Sikhi journey & commitment</h3>
                <Field label="Amritdhari" value={yesNo(application.is_amritdhari)} />
                <Field label="English ability" value={application.english_ability} />
                <Field label="Panjabi ability" value={application.panjabi_ability} />
                <Field label="Funding option" value={application.funding_option} />
                <Field label="Continue parchaar" value={yesNo(application.continue_parchaar)} />
                <Field label="How heard" value={application.how_heard} />
                <div className="col-span-full"><Field label="Sikhi journey" value={application.sikhi_journey} /></div>
                <div className="col-span-full"><Field label="Motivation" value={application.motivation} /></div>
                <div className="col-span-full"><Field label="Current seva" value={application.current_seva} /></div>
                <div className="col-span-full"><Field label="What they want to learn" value={application.what_to_learn} /></div>
              </section>

              {application.internal_notes && (
                <section className="grid grid-cols-1 gap-3 bg-muted/40 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-foreground">Internal notes</h3>
                  <Field label="Notes" value={application.internal_notes} />
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
