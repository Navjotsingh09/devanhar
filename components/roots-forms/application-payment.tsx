'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { checkedPayment } from '@/lib/roots-forms/application-tracker'

export type PaymentVerification = {provider_reference: string; amount_pence: number; paid_on: string; verified_at: string; verified_by: string}
export function ApplicationPayment({formId, responseId, accepted, paid, active, verification, setupReady, earliestDate, latestDate}: {
  formId: string; responseId: string; accepted: boolean; paid: boolean; active: boolean
  verification: PaymentVerification | null; setupReady: boolean; earliestDate: string; latestDate: string
}) {
  const router = useRouter()
  const [reference, setReference] = useState(''), [amount, setAmount] = useState('50'), [paidOn, setPaidOn] = useState('')
  const [verified, setVerified] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false)
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (pending || saved) return
    setError('')
    try { checkedPayment({reference, amount, paidOn, verified}) } catch (error) { setError(error instanceof Error ? error.message : 'Check the payment details.'); return }
    setPending(true)
    try {
      const response = await fetch(`/api/roots-forms/${formId}/responses/${responseId}/payment`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({reference, amount, paidOn, verified})})
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The payment could not be verified.')
      setSaved(true); router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'The payment could not be verified.') } finally { setPending(false) }
  }
  return <section className="space-y-4 rounded-2xl border bg-card p-5">
    <h2 className="font-semibold">Donation Manager payment tracker</h2>
    <p className="text-sm text-muted-foreground">Staff-verified tracker, not an automatic connection to Donation Manager. Check the completed payment there before marking it paid here.</p>
    <p className="break-all text-sm"><strong>Application reference:</strong> {responseId}</p>
    <p className="text-sm text-muted-foreground">Match this application reference against the donor&apos;s &quot;Your Message&quot;, then record Donation Manager&apos;s separate unique payment reference below. Never enter API keys, card details or passwords.</p>
    {!setupReady && <p role="alert" className="text-sm text-red-700">The payment tracker database setup is not installed or could not be loaded. No payment can be recorded here yet.</p>}
    {verification ? <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium text-green-800">Paid · Staff verified</dd></div>
      <div><dt className="text-muted-foreground">Donation Manager payment reference</dt><dd className="break-all">{verification.provider_reference}</dd></div>
      <div><dt className="text-muted-foreground">Amount</dt><dd>£{(verification.amount_pence / 100).toFixed(2)}</dd></div>
      <div><dt className="text-muted-foreground">Payment date</dt><dd>{verification.paid_on}</dd></div>
      <div><dt className="text-muted-foreground">Checked at</dt><dd>{new Date(verification.verified_at).toLocaleString('en-GB')}</dd></div>
      <div><dt className="text-muted-foreground">Checked by (staff ID)</dt><dd className="break-all">{verification.verified_by}</dd></div>
    </dl> : paid ? <p className="text-sm">Paid is already recorded. No staff-verification record is available here; do not assume an automatic provider check.</p> : accepted && active ? <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm"><span className="block">Donation Manager payment reference</span><input className="w-full rounded-lg border bg-background p-2" value={reference} onChange={event => setReference(event.target.value)} required maxLength={100} autoComplete="off" disabled={!setupReady || pending || saved} /></label>
        <label className="space-y-2 text-sm"><span className="block">Amount received (£)</span><input className="w-full rounded-lg border bg-background p-2" type="number" min="50" max="10000" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} required disabled={!setupReady || pending || saved} /></label>
        <label className="space-y-2 text-sm"><span className="block">Payment date</span><input className="w-full rounded-lg border bg-background p-2" type="date" min={earliestDate} max={latestDate} value={paidOn} onChange={event => setPaidOn(event.target.value)} required disabled={!setupReady || pending || saved} /></label>
      </div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} required disabled={!setupReady || pending || saved} /><span>I checked Donation Manager and confirmed this completed payment, its amount and the matching application reference in Your Message. This is not a test or pending payment.</span></label>
      <p className="text-xs text-muted-foreground">This creates a permanent verification record. A payment reference can only be used once. Corrections and refunds require administrator review.</p>
      <Button type="submit" disabled={!setupReady || pending || saved}>{saved ? 'Payment recorded' : pending ? 'Saving…' : 'Mark as paid'}</Button>
    </form> : <p className="text-sm">Payment is {accepted ? 'not editable for an archived or deleted application' : 'only requested after acceptance'}.</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {saved && <p role="status" className="text-sm text-green-800">Payment saved as staff verified.</p>}
  </section>
}
