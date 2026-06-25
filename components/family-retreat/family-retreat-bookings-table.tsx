'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Check, X, Clock, Loader2 } from 'lucide-react'
import { updateFamilyRetreatStatus, updateFamilyRetreatNotes } from '@/app/dashboard/family-retreat/actions'
import { toast } from 'sonner'

type ChildEntry = { first_name: string; last_name: string; date_of_birth: string }

export type FamilyRetreatBooking = {
  id: string
  created_at: string
  status: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  postcode: string
  country: string
  children_attending: ChildEntry[]
  accommodation_preference: string | null
  dietary_requirements: string | null
  medical_requirements: string | null
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  heard_about_retreat: string | null
  additional_notes: string | null
  consent_email: boolean
  consent_whatsapp: boolean
  internal_notes: string | null
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100  text-green-800  border-green-200',
  declined:  'bg-red-100    text-red-800    border-red-200',
  waitlist:  'bg-blue-100   text-blue-800   border-blue-200',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {status}
    </span>
  )
}

function BookingRow({ booking, index }: { booking: FamilyRetreatBooking; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(booking.internal_notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStatus = (status: string) => {
    startTransition(async () => {
      try {
        await updateFamilyRetreatStatus(booking.id, status)
        toast.success(`Booking ${status}${status === 'confirmed' ? ' \u2014 confirmation email sent' : status === 'declined' ? ' \u2014 decline email sent' : ''}`)
      } catch {
        toast.error('Failed to update status. Please try again.')
      }
    })
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await updateFamilyRetreatNotes(booking.id, notes)
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <>
      <tr className={`border-b border-border transition-colors ${expanded ? 'bg-muted/20' : 'hover:bg-muted/30'}`}>
        <td className="px-4 py-3 text-muted-foreground tabular-nums text-sm">{index + 1}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-foreground text-sm whitespace-nowrap">{booking.first_name} {booking.last_name}</p>
          <p className="text-xs text-muted-foreground">{booking.city}, {booking.country}</p>
        </td>
        <td className="px-4 py-3">
          <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline text-sm">{booking.email}</a>
          <p className="text-xs text-muted-foreground"><a href={`tel:${booking.phone}`} className="hover:underline">{booking.phone}</a></p>
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">{booking.children_attending?.length ?? 0}</span>
          {(booking.children_attending?.length ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {booking.children_attending.map(c => c.first_name).join(', ')}
            </p>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground capitalize whitespace-nowrap">
          {booking.accommodation_preference?.replace(/-/g, ' ') ?? '\u2014'}
        </td>
        <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {new Date(booking.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {booking.status !== 'confirmed' && (
              <Button size="sm" variant="outline" onClick={() => handleStatus('confirmed')} disabled={isPending}
                className="h-7 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50 gap-1">
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Confirm
              </Button>
            )}
            {booking.status !== 'waitlist' && (
              <Button size="sm" variant="outline" onClick={() => handleStatus('waitlist')} disabled={isPending}
                className="h-7 px-2 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 gap-1">
                <Clock className="h-3 w-3" /> Waitlist
              </Button>
            )}
            {booking.status !== 'declined' && (
              <Button size="sm" variant="outline" onClick={() => handleStatus('declined')} disabled={isPending}
                className="h-7 px-2 text-xs text-red-700 border-red-200 hover:bg-red-50 gap-1">
                <X className="h-3 w-3" /> Decline
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="h-7 px-2 text-muted-foreground">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-muted/10 border-b border-border">
          <td />
          <td colSpan={7} className="px-4 py-5">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Children attending</p>
                {(booking.children_attending?.length ?? 0) === 0 ? <p className="text-muted-foreground">\u2014</p> : (
                  <ul className="space-y-1">
                    {booking.children_attending.map((c, i) => (
                      <li key={i} className="text-foreground">
                        {c.first_name} {c.last_name}
                        <span className="ml-2 text-xs text-muted-foreground">DOB: {new Date(c.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dietary & medical</p>
                <p className="text-foreground mb-1"><span className="font-medium">Dietary: </span><span className="text-muted-foreground">{booking.dietary_requirements || 'None stated'}</span></p>
                <p className="text-foreground"><span className="font-medium">Medical: </span><span className="text-muted-foreground">{booking.medical_requirements || 'None stated'}</span></p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Emergency contact</p>
                <p className="text-foreground">{booking.emergency_contact_name}</p>
                <p className="text-muted-foreground">{booking.emergency_contact_relationship}</p>
                <a href={`tel:${booking.emergency_contact_phone}`} className="text-blue-600 hover:underline">{booking.emergency_contact_phone}</a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Address</p>
                <p className="text-foreground">{booking.city}, {booking.postcode}</p>
                <p className="text-muted-foreground">{booking.country}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Additional info</p>
                <p className="text-foreground mb-1"><span className="font-medium">Heard via: </span><span className="text-muted-foreground">{booking.heard_about_retreat || '\u2014'}</span></p>
                <p className="text-foreground"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{booking.additional_notes || 'None'}</span></p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact consent</p>
                <p className="text-muted-foreground">Email: {booking.consent_email ? '\u2713 Yes' : '\u2717 No'}</p>
                <p className="text-muted-foreground">WhatsApp: {booking.consent_whatsapp ? '\u2713 Yes' : '\u2717 No'}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Internal notes</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm mb-2" placeholder="Add internal notes visible only to the team\u2026" />
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes} className="h-7 px-3 text-xs">
                {savingNotes ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Saving\u2026</> : 'Save notes'}
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function FamilyRetreatBookingsTable({ bookings }: { bookings: FamilyRetreatBooking[] }) {
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const waitlist  = bookings.filter(b => b.status === 'waitlist').length
  const totalChildren = bookings.reduce((s, b) => s + (b.children_attending?.length ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {[
          { label: 'Total',     value: bookings.length, cls: '' },
          { label: 'Pending',   value: pending,   cls: 'text-yellow-700' },
          { label: 'Confirmed', value: confirmed, cls: 'text-green-700' },
          { label: 'Waitlist',  value: waitlist,  cls: 'text-blue-700' },
          { label: 'Children',  value: totalChildren, cls: '' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold text-foreground ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">No booking requests yet.</div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 text-left border-b border-border">
                <th className="px-4 py-3 font-semibold text-foreground">#</th>
                <th className="px-4 py-3 font-semibold text-foreground">Family</th>
                <th className="px-4 py-3 font-semibold text-foreground">Contact</th>
                <th className="px-4 py-3 font-semibold text-foreground">Children</th>
                <th className="px-4 py-3 font-semibold text-foreground">Accommodation</th>
                <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-foreground">Submitted</th>
                <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => <BookingRow key={b.id} booking={b} index={i} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
