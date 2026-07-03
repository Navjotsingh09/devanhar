"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, CreditCard, Clock, Baby, CalendarDays, Download, ChevronDown, ChevronUp } from 'lucide-react'

export interface DayPassBooking {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  postcode: string
  country: string
  selected_date: string
  num_adults: number
  children_attending: Array<{ first_name: string; last_name: string; date_of_birth: string }>
  dietary_requirements?: string | null
  medical_requirements?: string | null
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
  heard_about_retreat?: string | null
  additional_notes?: string | null
  consent_email: boolean
  consent_whatsapp: boolean
  amount_due?: number | null
  amount_paid?: number | null
  payment_status: string
  paid_at?: string | null
  stripe_payment_link?: string | null
  internal_notes?: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtPounds(pence: number | null | undefined) {
  if (!pence) return '—'
  return `\u00a3${(pence / 100).toFixed(2)}`
}

function bookingsToCsv(bookings: DayPassBooking[]): string {
  const headers = ['ID','Created','First Name','Last Name','Email','Phone','City','Postcode','Country',
    'Selected Date','Adults','Children Count','Children (name + DOB)',
    'Dietary','Medical','EC Name','EC Relationship','EC Phone',
    'Heard Via','Notes','Consent Email','Consent WhatsApp',
    'Amount Due','Amount Paid','Payment Status','Paid At']
  const rows = bookings.map(b => [
    b.id, b.created_at, b.first_name, b.last_name, b.email, b.phone,
    b.city, b.postcode, b.country, b.selected_date, b.num_adults,
    b.children_attending?.length ?? 0,
    b.children_attending?.map(c => `${c.first_name} ${c.last_name} (${c.date_of_birth})`).join('; ') || '',
    b.dietary_requirements || '', b.medical_requirements || '',
    b.emergency_contact_name, b.emergency_contact_relationship, b.emergency_contact_phone,
    b.heard_about_retreat || '', b.additional_notes || '',
    b.consent_email ? 'Yes' : 'No', b.consent_whatsapp ? 'Yes' : 'No',
    b.amount_due != null ? (b.amount_due / 100).toFixed(2) : '',
    b.amount_paid != null ? (b.amount_paid / 100).toFixed(2) : '',
    b.payment_status, b.paid_at || '',
  ])
  const escape = (v: unknown) => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s }
  return '\ufeff' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n')
}

function downloadCsv(bookings: DayPassBooking[]) {
  const csv = bookingsToCsv(bookings)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `day-pass-bookings-${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function BookingRow({ booking }: { booking: DayPassBooking }) {
  const [expanded, setExpanded] = useState(false)
  const paid = booking.payment_status === 'paid'

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 text-sm font-medium">{booking.first_name} {booking.last_name}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(booking.selected_date)}</td>
        <td className="px-4 py-3 text-sm">{booking.num_adults}</td>
        <td className="px-4 py-3 text-sm">{booking.children_attending?.length ?? 0}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
            {paid ? '\u2713 Paid' : 'Unpaid'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {paid ? fmtPounds(booking.amount_paid) : fmtPounds(booking.amount_due)}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{booking.city}</td>
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(v => !v)} className="text-muted-foreground hover:text-foreground p-1">
            {expanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/10 border-b border-border">
          <td colSpan={8} className="px-4 py-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact</p>
                <p>{booking.email}</p>
                <p>{booking.phone}</p>
                <p className="text-muted-foreground">{booking.city}, {booking.postcode}, {booking.country}</p>
              </div>
              {(booking.children_attending?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Children attending</p>
                  <ul className="space-y-1">
                    {booking.children_attending.map((c, i) => (
                      <li key={i}>{c.first_name} {c.last_name} <span className="text-xs text-muted-foreground">DOB: {new Date(c.date_of_birth).toLocaleDateString('en-GB')}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dietary &amp; medical</p>
                <p>Dietary: {booking.dietary_requirements || 'None stated'}</p>
                <p>Medical: {booking.medical_requirements || 'None stated'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Emergency contact</p>
                <p>{booking.emergency_contact_name}</p>
                <p className="text-muted-foreground">{booking.emergency_contact_relationship}</p>
                <a href={`tel:${booking.emergency_contact_phone}`} className="text-blue-600 hover:underline">{booking.emergency_contact_phone}</a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Payment</p>
                <p className={paid ? 'text-green-700 font-medium' : 'text-yellow-700'}>
                  {paid ? `Paid ${fmtPounds(booking.amount_paid)}` : `Unpaid (due ${fmtPounds(booking.amount_due)})`}
                </p>
                {booking.paid_at && <p className="text-xs text-muted-foreground mt-1">{new Date(booking.paid_at).toLocaleString('en-GB')}</p>}
                {booking.stripe_payment_link && !paid && (
                  <a href={booking.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">Open payment link</a>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Other</p>
                <p>Heard via: {booking.heard_about_retreat || '—'}</p>
                <p>Notes: {booking.additional_notes || 'None'}</p>
                <p>Consent email: {booking.consent_email ? 'Yes' : 'No'}</p>
                <p>Consent WhatsApp: {booking.consent_whatsapp ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function DayPassBookingsTable({ bookings }: { bookings: DayPassBooking[] }) {
  const paid = bookings.filter(b => b.payment_status === 'paid').length
  const unpaid = bookings.length - paid
  const totalAdults = bookings.reduce((s, b) => s + (b.num_adults || 0), 0)
  const totalChildren = bookings.reduce((s, b) => s + (b.children_attending?.length ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        <Button size="sm" variant="outline" onClick={() => downloadCsv(bookings)} disabled={bookings.length === 0} className="gap-1.5">
          <Download className="h-4 w-4"/> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {[
          { label: 'Total', value: bookings.length, icon: CalendarDays, cls: '', iconCls: 'text-muted-foreground' },
          { label: 'Paid', value: paid, icon: CreditCard, cls: 'text-green-700', iconCls: 'text-green-600' },
          { label: 'Unpaid', value: unpaid, icon: Clock, cls: 'text-yellow-700', iconCls: 'text-yellow-600' },
          { label: 'Adults', value: totalAdults, icon: Users, cls: '', iconCls: 'text-muted-foreground' },
          { label: 'Children', value: totalChildren, icon: Baby, cls: '', iconCls: 'text-muted-foreground' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.iconCls}`}/>
            </div>
            <p className={`text-2xl font-bold text-foreground ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No day pass bookings yet.</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Adults</th>
                <th className="px-4 py-3 text-left font-semibold">Children</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Location</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => <BookingRow key={b.id} booking={b}/>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
