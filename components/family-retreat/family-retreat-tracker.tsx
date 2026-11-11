'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { recordRetreatEvent } from '@/app/dashboard/family-retreat/tracker-actions'
import { retreatMoney, retreatProgress, retreatTrackerLabels, type RetreatTrackerAction, type RetreatTrackerEvent } from '@/lib/family-retreat-tracker'
import { retreatSubmittedAt } from '@/lib/family-retreat-booking-details'
import type { FamilyRetreatBooking } from './family-retreat-bookings-table'

const titles: Record<RetreatTrackerAction, string> = {
  contacted: 'Mark as spoken to', link_sent: 'Log payment link sent', payment: 'Mark as paid',
  refund_requested: 'Flag refund', refund_approved: 'Approve refund', refund_declined: 'Decline refund',
  refund_recorded: 'Record completed refund',
}

export function RetreatBookingTracker({ booking, events, reviewer, legacyCheckout }: {
  booking: FamilyRetreatBooking; events: RetreatTrackerEvent[]; reviewer: boolean; legacyCheckout: boolean
}) {
  const [action, setAction] = useState<RetreatTrackerAction | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null)
  const progress = retreatProgress(events, booking)
  const active = booking.status !== 'archived' && booking.status !== 'declined'
  const amountRequired = action === 'link_sent' || action === 'payment' || action === 'refund_requested'
  const providerRequired = action === 'payment' || action === 'refund_recorded'

  function open(next: RetreatTrackerAction) {
    setMessage(null)
    setAction(next)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !action) return
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setMessage(null)
    try {
      await recordRetreatEvent(booking.id, form)
      setMessage({ error: false, text: retreatTrackerLabels[action] + ' saved.' })
      setAction(null)
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Could not save the update.' })
    } finally {
      setBusy(false)
    }
  }

  return <section aria-label="Contact, payments and refunds" className="space-y-3 rounded-lg border bg-background p-4">
    <div className="flex flex-wrap gap-2">
      {active && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('contacted')}>{progress.contacted ? 'Log another conversation' : titles.contacted}</Button>}
      {active && <Button type="button" size="sm" variant="outline" disabled={busy || !progress.contacted} onClick={() => open('link_sent')}>{titles.link_sent}</Button>}
      {active && progress.link && !legacyCheckout && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('payment')}>{progress.received ? 'Record another payment' : titles.payment}</Button>}
      {progress.refundable > 0 && !progress.pendingRefund && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('refund_requested')}>{titles.refund_requested}</Button>}
      {reviewer && progress.refundState === 'refund_requested' && <>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('refund_approved')}>{titles.refund_approved}</Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('refund_declined')}>{titles.refund_declined}</Button>
      </>}
      {reviewer && progress.refundState === 'refund_approved' &&
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => open('refund_recorded')}>{titles.refund_recorded}</Button>}
    </div>
    {progress.pendingRefund && <p className="text-sm font-medium">
      {progress.refundState === 'refund_approved' ? 'Approved · awaiting provider refund' : 'Refund awaiting admin review'} · {retreatMoney(progress.refund?.amount_pence ?? 0)} · {progress.refund?.note}
    </p>}
    {action && <form key={action} onSubmit={submit} className="space-y-3 rounded-md border p-3">
      <h4 className="text-sm font-semibold">{titles[action]}</h4>
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="requestId" value={progress.refund?.id ?? ''} />
      {action === 'link_sent' && <p className="text-sm text-muted-foreground">Enter the total requested in the link you already sent. This does not send an email.</p>}
      {action === 'refund_approved' && <p className="text-sm text-muted-foreground">This approves the request. Process it with the payment provider, then return here to record it.</p>}
      {amountRequired && <label className="block max-w-xs space-y-1 text-sm">
        {action === 'link_sent' ? 'Amount requested (£)' : action === 'refund_requested' ? 'Refund amount (£)' : 'Amount received (£)'}
        <Input name="amount" type="number" min="0.01" max={action === 'refund_requested' ? progress.refundable / 100 : 100000} step="0.01" required />
      </label>}
      {providerRequired && <>
        {action === 'refund_recorded' && <p className="text-sm">Approved amount: {retreatMoney(progress.refund?.amount_pence ?? 0)}. Only record it once the provider has completed the refund.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Provider transaction reference<Input name="reference" required maxLength={100} /></label>
          <label className="space-y-1 text-sm">Transaction date<Input type="date" name="date" required /></label>
        </div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="verified" className="mt-1" required /> I checked the completed transaction and the amount with the payment provider.</label>
      </>}
      {(action === 'contacted' || action === 'refund_requested' || action === 'refund_declined') && <label className="block space-y-1 text-sm">
        {action === 'refund_requested' ? 'Reason for refund' : 'Note (optional)'}
        <Textarea name="note" rows={2} maxLength={1000} required={action === 'refund_requested'} />
      </label>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setAction(null)}>Cancel</Button>
      </div>
    </form>}
    {message && <p className={message.error ? 'text-sm text-red-700' : 'text-sm text-emerald-700'} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    {events.length > 0 && <details className="text-sm">
      <summary className="cursor-pointer font-medium">Activity history ({events.length})</summary>
      <ol className="mt-2 space-y-2">
        {events.map(item => <li key={item.id} className="break-words">
          <strong>{retreatTrackerLabels[item.action]}</strong>{item.amount_pence != null && ` · ${retreatMoney(item.amount_pence)}`} · {item.actor_name} · {retreatSubmittedAt(item.created_at)}
          {item.reference && ` · Ref: ${item.reference}`}{item.occurred_on && ` · Transaction date: ${item.occurred_on}`}{item.note && ` · ${item.note}`}
        </li>)}
      </ol>
    </details>}
  </section>
}
