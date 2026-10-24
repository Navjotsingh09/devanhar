export const decisionFilters = ['all', 'pending', 'accepted', 'declined'] as const
export type DecisionFilter = typeof decisionFilters[number]
export const decisionLabels = {all: 'All applications', pending: 'New', accepted: 'Accepted', declined: 'Declined'}

export function applicationAge(createdAt: string, now = new Date()) {
  const created = new Date(createdAt)
  if (!Number.isFinite(created.getTime())) return 'Date unavailable'
  const londonDay = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(date)
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value)
    return Date.UTC(value('year'), value('month') - 1, value('day'))
  }
  const days = Math.max(0, Math.round((londonDay(now) - londonDay(created)) / 86400000))
  return days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'} old`
}

export function applicationPaymentLabel(paymentState: string, decision: string) {
  if (paymentState === 'paid') return 'Paid'
  if (decision === 'accepted') return 'Awaiting payment'
  if (decision === 'declined') return 'Not requested'
  return '£50 payable after acceptance'
}

export function checkedPayment(input: unknown, now = new Date()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter the payment details.')
  const value = input as Record<string, unknown>
  const reference = typeof value.reference === 'string' ? value.reference.trim() : ''
  if (!/^[A-Za-z0-9][A-Za-z0-9 ./_-]{1,99}$/.test(reference)) throw new Error('Enter the Donation Manager payment reference (2–100 letters, numbers, spaces, dots, slashes, underscores or hyphens).')
  if (value.verified !== true) throw new Error('Confirm that you checked the completed payment in Donation Manager.')
  if (typeof value.amount !== 'string' || !/^\d{1,5}(?:\.\d{1,2})?$/.test(value.amount.trim())) throw new Error('Enter a valid amount in pounds.')
  const amountPence = Math.round(Number(value.amount.trim()) * 100)
  if (amountPence < 5000 || amountPence > 1000000) throw new Error('Record a completed payment of at least £50 and no more than £10,000. Do not mark partial payments as paid.')
  const paidOn = typeof value.paidOn === 'string' ? value.paidOn : ''
  const date = new Date(`${paidOn}T00:00:00Z`)
  const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== paidOn || paidOn > today) throw new Error('Enter the payment date, not a future date.')
  return {reference, amountPence, paidOn}
}
