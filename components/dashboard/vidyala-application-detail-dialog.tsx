'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { VidyalaApplicationRow } from '@/components/dashboard/vidyala-applications-table'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border/60 bg-background/70 p-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
        {value === null || value === undefined || value === '' ? <span className="text-muted-foreground">Not provided</span> : value}
      </div>
    </div>
  )
}

function DocumentLink({ path }: { path: string | null | undefined }) {
  if (!path) return <span className="text-muted-foreground">Not uploaded</span>
  return (
    <a
      href={'/api/camp-applications/view-id?path=' + encodeURIComponent(path) + '&source=vidyala'}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline"
    >
      View document
    </a>
  )
}

function yesNo(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return 'Not provided'
  return value ? 'Yes' : 'No'
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-muted/20 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

interface VidyalaApplicationDetailDialogProps {
  application: VidyalaApplicationRow | null
  onOpenChange: (open: boolean) => void
}

export function VidyalaApplicationDetailDialog({ application, onOpenChange }: VidyalaApplicationDetailDialogProps) {
  const open = application !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {application && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {application.first_name} {application.middle_name ? application.middle_name + ' ' : ''}{application.last_name}
              </DialogTitle>
              <DialogDescription>
                Full Sikhi Vidyala application · Applied {new Date(application.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Status: <span className="capitalize">{application.status}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <Section title="Personal details">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="First name" value={application.first_name} />
                  <Field label="Middle name" value={application.middle_name} />
                  <Field label="Last name" value={application.last_name} />
                  <Field label="Date of birth" value={new Date(application.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <Field label="Email" value={<a href={'mailto:' + application.email} className="text-blue-600 hover:underline">{application.email}</a>} />
                  <Field label="Phone" value={<a href={'tel:' + application.phone} className="text-blue-600 hover:underline">{application.phone}</a>} />
                  <div className="sm:col-span-2"><Field label="Address" value={application.address} /></div>
                </div>
              </Section>

              <Section title="Emergency contacts">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Contact 1 name" value={application.emergency_contact_1_name} />
                  <Field label="Contact 1 relationship" value={application.emergency_contact_1_relationship} />
                  <Field label="Contact 1 phone" value={application.emergency_contact_1_phone} />
                  <Field label="Contact 2 name" value={application.emergency_contact_2_name} />
                  <Field label="Contact 2 relationship" value={application.emergency_contact_2_relationship} />
                  <Field label="Contact 2 phone" value={application.emergency_contact_2_phone} />
                </div>
              </Section>

              <Section title="Sikhi journey">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Amritdhari" value={yesNo(application.is_amritdhari)} />
                  <Field label="English ability" value={application.english_ability} />
                  <Field label="Panjabi ability" value={application.panjabi_ability} />
                  <div className="sm:col-span-2"><Field label="Sikhi journey" value={application.sikhi_journey} /></div>
                </div>
              </Section>

              <Section title="Motivation, seva & learning">
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Motivation" value={application.motivation} />
                  <Field label="Current seva" value={application.current_seva} />
                  <Field label="What they want to learn" value={application.what_to_learn} />
                  <Field label="Continue parchaar" value={yesNo(application.continue_parchaar)} />
                  <Field label="How they heard about Vidyala" value={application.how_heard} />
                </div>
              </Section>

              <Section title="Commitment & practical details">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Can commit" value={yesNo(application.can_commit)} />
                  <Field label="Funding option" value={application.funding_option} />
                  <Field label="Accommodation option" value={application.accommodation_option} />
                  <Field label="Requires visa" value={yesNo(application.requires_visa)} />
                  <Field label="Requires visa support" value={yesNo(application.requires_visa_support)} />
                </div>
              </Section>

              <Section title="Documents">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Photo ID" value={<DocumentLink path={application.id_document_url} />} />
                  <Field label="Has DBS check" value={yesNo(application.has_dbs_check)} />
                  <Field label="DBS certificate" value={<DocumentLink path={application.dbs_certificate_url} />} />
                </div>
              </Section>

              <Section title="Submission & tracking">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Status" value={<span className="capitalize">{application.status}</span>} />
                  <Field label="Applied" value={new Date(application.created_at).toLocaleString('en-GB')} />
                  <Field label="Updated" value={application.updated_at ? new Date(application.updated_at).toLocaleString('en-GB') : null} />
                  <Field label="Source" value={application.source} />
                  <Field label="Medium" value={application.medium} />
                  <div className="sm:col-span-2"><Field label="Page URL" value={application.page_url} /></div>
                </div>
              </Section>

              <Section title="Internal notes">
                <Field label="Notes" value={application.internal_notes} />
              </Section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
