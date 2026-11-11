export const retreatTrackerActions = ['contacted','link_sent','payment','refund_requested','refund_approved','refund_declined','refund_recorded'] as const
export type RetreatTrackerAction = typeof retreatTrackerActions[number]
export type RetreatTrackerEvent = {
  id: number; booking_id: string; action: RetreatTrackerAction; amount_pence: number | null
  note: string | null; reference: string | null; occurred_on: string | null; request_id: number | null
  actor_name: string; created_at: string
}

export const retreatTrackerLabels: Record<RetreatTrackerAction, string> = {
  contacted: 'Spoken to', link_sent: 'Payment link sent', payment: 'Payment verified',
  refund_requested: 'Refund flagged', refund_approved: 'Refund approved',
  refund_declined: 'Refund declined', refund_recorded: 'Refund recorded',
}

export function parseRetreatPounds(value: string) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value.trim())) return null
  const [whole, decimals = ''] = value.trim().split('.')
  const pence = Number(whole) * 100 + Number(decimals.padEnd(2, '0'))
  return pence > 0 && pence <= 10000000 ? pence : null
}

export function retreatMoney(pence: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100)
}

export function retreatProgress(events: RetreatTrackerEvent[], booking: {
  amount_due?: number | null; amount_paid?: number | null; payment_status?: string | null
}) {
  const last = (action: RetreatTrackerAction) => events.find(event => event.action === action)
  const contacted = last('contacted')
  const link = last('link_sent')
  const sum = (action: RetreatTrackerAction) => events.reduce((total, event) =>
    total + (event.action === action ? event.amount_pence ?? 0 : 0), 0)
  const received = Math.max(sum('payment'), Math.round(Number(booking.amount_paid || 0) * 100))
  const refunded = sum('refund_recorded')
  const due = link?.amount_pence ?? Math.round(Number(booking.amount_due || 0) * 100)
  const refund = last('refund_requested')
  const refundState = refund && (events.find(event => event.request_id === refund.id)?.action ?? refund.action)
  return {
    contacted, link, received, refunded, due, refund, refundState,
    paid: refunded < received && (due > 0 ? received >= due : received > 0) || (due === 0 && received === 0 && booking.payment_status === "paid"),
    outstanding: Math.max(0, due - received),
    refundable: Math.max(0, received - refunded),
    pendingRefund: refundState === 'refund_requested' || refundState === 'refund_approved',
  }
}
