'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Check, X, Clock, Loader2, Download } from 'lucide-react'
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
  payment_status?: string | null
  amount_due?: number | null
  amount_paid?: number | null
  stripe_payment_link?: string | null
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
  const [confirming, setConfirming] = useState(false)
  const [adults, setAdults] = useState('')
  const [amount, setAmount] = useState('')

  const handleStatus = (status: string) => {
    startTransition(async () => {
      try {
        await updateFamilyRetreatStatus(booking.id, status)
        toast.success(`Booking ${status}${status === 'confirmed' ? ' — confirmation email sent' : status === 'declined' ? ' — decline email sent' : ''}`)
      } catch {
        toast.error('Failed to update status. Please try again.')
      }
    })
  }

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await updateFamilyRetreatStatus(booking.id, 'confirmed', { adults: adults.trim(), amount: amount.trim() })
        toast.success('Booking confirmed \u2014 confirmation email sent')
        setConfirming(false)
      } catch {
        toast.error('Failed to confirm. Please try again.')
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
          {booking.accommodation_preference?.replace(/-/g, ' ') ?? '—'}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={booking.status} />
          {booking.status === 'confirmed' && (
            <span className={`mt-1 block text-xs font-medium ${booking.payment_status === 'paid' ? 'text-green-700' : 'text-amber-600'}`}>
              {booking.payment_status === 'paid'
                ? `\u2713 Paid${booking.amount_paid ? ` \u00a3${booking.amount_paid}` : ''}`
                : 'Awaiting payment'}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {new Date(booking.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {booking.status !== 'confirmed' && (
              <Button size="sm" variant="outline" onClick={() => setConfirming(true)} disabled={isPending}
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

      {confirming && (
        <tr className="bg-green-50/40 border-b border-border">
          <td />
          <td colSpan={7} className="px-4 py-4">
            <div className="flex flex-col gap-3 max-w-2xl">
              <p className="text-sm font-medium text-foreground">
                Confirm {booking.first_name} {booking.last_name}&apos;s booking
              </p>
              <p className="text-xs text-muted-foreground">
                Family name, number of children and accommodation are taken from the form. Enter the number of adults and the total amount agreed on the call &mdash; these are merged into the confirmation email.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground">Number of adults</label>
                  <Input value={adults} onChange={(e) => setAdults(e.target.value)} placeholder="e.g. 2" inputMode="numeric" className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-foreground">Total amount agreed (&pound;)</label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 350" inputMode="decimal" className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleConfirm} disabled={isPending || !adults.trim() || !amount.trim()}
                  className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5">
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Send confirmation email
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={isPending} className="h-8 px-3 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {expanded && (
        <tr className="bg-muted/10 border-b border-border">
          <td />
          <td colSpan={7} className="px-4 py-5">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Children attending</p>
                {(booking.children_attending?.length ?? 0) === 0 ? <p className="text-muted-foreground">—</p> : (
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
                <p className="text-foreground mb-1"><span className="font-medium">Heard via: </span><span className="text-muted-foreground">{booking.heard_about_retreat || '—'}</span></p>
                <p className="text-foreground"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{booking.additional_notes || 'None'}</span></p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact consent</p>
                <p className="text-muted-foreground">Email: {booking.consent_email ? '✓ Yes' : '✗ No'}</p>
                <p className="text-muted-foreground">WhatsApp: {booking.consent_whatsapp ? '✓ Yes' : '✗ No'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Payment</p>
                <p className="text-muted-foreground">Status: <span className={booking.payment_status === 'paid' ? 'text-green-700 font-medium' : booking.status === 'confirmed' ? 'text-amber-600 font-medium' : ''}>{booking.payment_status === 'paid' ? 'Paid' : booking.status === 'confirmed' ? 'Awaiting payment' : 'Not yet invoiced'}</span></p>
                {booking.amount_due != null && <p className="text-muted-foreground">Amount due: £{booking.amount_due}</p>}
                {booking.amount_paid != null && <p className="text-muted-foreground">Amount paid: £{booking.amount_paid}</p>}
                {booking.stripe_payment_link && (
                  <a href={booking.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-xs">Open payment link</a>
                )}
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Internal notes</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm mb-2" placeholder="Add internal notes visible only to the team…" />
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes} className="h-7 px-3 text-xs">
                {savingNotes ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Saving…</> : 'Save notes'}
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

function bookingsToCsv(bookings: FamilyRetreatBooking[]): string {
  const headers = [
    'Booking #', 'Submitted', 'Status',
    'First name', 'Last name', 'Email', 'Phone',
    'City', 'Postcode', 'Country',
    'Children count', 'Children (name + DOB)',
    'Accommodation preference', 'Dietary requirements', 'Medical requirements',
    'Emergency contact name', 'Emergency contact relationship', 'Emergency contact phone',
    'Heard about retreat', 'Additional notes',
    'Consent email', 'Consent WhatsApp', 'Internal notes',
  ]
  const rows = bookings.map((b, i) => [
    i + 1,
    b.created_at ? new Date(b.created_at).toLocaleString('en-GB') : '',
    b.status,
    b.first_name, b.last_name, b.email, b.phone,
    b.city, b.postcode, b.country,
    b.children_attending?.length ?? 0,
    (b.children_attending ?? []).map(c => `${c.first_name} ${c.last_name} (DOB ${c.date_of_birth})`).join('; '),
    b.accommodation_preference ?? '',
    b.dietary_requirements ?? '',
    b.medical_requirements ?? '',
    b.emergency_contact_name, b.emergency_contact_relationship, b.emergency_contact_phone,
    b.heard_about_retreat ?? '',
    b.additional_notes ?? '',
    b.consent_email ? 'Yes' : 'No',
    b.consent_whatsapp ? 'Yes' : 'No',
    b.internal_notes ?? '',
  ])
  return [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n')
}

function downloadBookingsCsv(bookings: FamilyRetreatBooking[]) {
  const csv = '\uFEFF' + bookingsToCsv(bookings)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `family-retreat-bookings-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function FamilyRetreatBookingsTable({ bookings }: { bookings: FamilyRetreatBooking[] }) {
  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const waitlist  = bookings.filter(b => b.status === 'waitlist').length
  const totalChildren = bookings.reduce((s, b) => s + (b.children_attending?.length ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length === 1 ? '' : 's'} total
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadBookingsCsv(bookings)}
          disabled={bookings.length === 0}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
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
