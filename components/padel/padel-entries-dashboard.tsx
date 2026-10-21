"use client"

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { decidePadelRegistration, archivePadelRegistration, recordPadelPayment } from '@/app/spa-admin/registration-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type PadelEntry = {
  id: string
  name: string
  email: string
  phone: string | null
  amount: number | null
  currency: string | null
  status: 'approved' | 'pending' | 'declined' | 'archived'
  paymentStatus: 'paid' | 'pending' | 'unverified' | 'authorized' | 'refunded'
  eventName: string
  source: string
  created_at: string
  details?: Record<string, unknown>
  isLiveRegistration?: boolean
}
const applicationLabels = { approved: 'Approved', pending: 'Awaiting decision', declined: 'Declined', archived: 'Archived' }
const paymentLabels = { paid: 'Verified paid', pending: 'Awaiting payment', unverified: 'Payment unverified', authorized: 'Authorised hold', refunded: 'Refunded' }

export function PadelEntriesDashboard({ entries, recordOnly = false }: { entries: PadelEntry[]; recordOnly?: boolean }) {
  const router = useRouter()
  const [filter, setFilter] = useState(recordOnly ? entries[0]?.status || 'active' : 'active')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [paymentEntry, setPaymentEntry] = useState<PadelEntry | null>(null)
  const [reference, setReference] = useState('')
  const [amount, setAmount] = useState('')
  const [receiptChecked, setReceiptChecked] = useState(false)
  const visible = entries.filter(e => (filter === 'active' ? e.status !== 'archived' : e.status === filter) && (paymentFilter === 'all' || e.paymentStatus === paymentFilter))

  const run = (action: () => Promise<unknown>, message: string) => startTransition(async () => {
    try {
      const result = await action() as { emailSent?: boolean } | undefined
      toast.success(message)
      if (result?.emailSent === false) toast.warning('The change was saved, but the applicant email could not be sent.')
      setPaymentEntry(null)
      router.refresh()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save') }
  })
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2" aria-label="Application filters">{[
      ['active', 'All active'], ['pending', 'Awaiting decision'], ['approved', 'Approved'], ['declined', 'Declined'], ['archived', 'Archived'],
    ].map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? 'default' : 'outline'} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label} ({entries.filter(e => value === 'active' ? e.status !== 'archived' : e.status === value).length})</Button>)}
      <Label htmlFor="payment-filter" className="ml-auto text-xs">Payment</Label><select id="payment-filter" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="rounded-md border bg-white px-3 py-2 text-sm"><option value="all">All payments</option>{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
    </div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[1000px] text-left text-sm">
      <thead className="border-b bg-muted/40 text-xs text-muted-foreground"><tr>{['Team captain', 'Tournament', 'Application', 'Payment', 'Submitted', 'Actions'].map(t => <th key={t} className="px-4 py-3">{t}</th>)}</tr></thead>
      <tbody>{visible.map(entry => <Fragment key={entry.id}><tr className="border-b last:border-0">
        <td className="px-4 py-4"><p className="font-semibold">{entry.name}</p><p className="text-xs text-muted-foreground">{entry.email}</p><p className="text-xs text-muted-foreground">{entry.phone}</p></td>
        <td className="px-4 py-4"><p>{entry.eventName}</p><p className="text-xs text-muted-foreground">{entry.source}</p></td>
        <td className={`px-4 py-4 font-medium ${entry.status === 'approved' ? 'text-emerald-700' : entry.status === 'declined' ? 'text-red-700' : 'text-muted-foreground'}`}>{applicationLabels[entry.status]}</td>
        <td className="px-4 py-4"><p className={entry.paymentStatus === 'paid' ? 'font-medium text-emerald-700' : 'text-amber-700'}>{paymentLabels[entry.paymentStatus]}</p>{entry.amount != null && <p className="mt-1 text-xs text-muted-foreground">Entry fee: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: entry.currency || 'GBP' }).format(entry.amount)}</p>}</td>
        <td className="px-4 py-4 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString('en-GB')}</td>
        <td className="px-4 py-4"><div className="flex flex-wrap gap-2">
          {entry.isLiveRegistration && entry.status === 'pending' && <Button size="sm" disabled={isPending} onClick={() => run(() => decidePadelRegistration(entry.id, 'approved'), 'Application approved')}>Approve</Button>}
          {entry.isLiveRegistration && ['pending', 'approved'].includes(entry.status) && <Button size="sm" variant="outline" disabled={isPending} onClick={() => { if (confirm('Decline this application? This does not refund or release a payment.')) run(() => decidePadelRegistration(entry.id, 'declined'), 'Application declined') }}>Decline</Button>}
          {entry.isLiveRegistration && ['pending', 'approved'].includes(entry.status) && !['paid','refunded'].includes(entry.paymentStatus) && <Button size="sm" variant="outline" disabled={isPending} onClick={() => {setPaymentEntry(entry); setReference(''); setAmount(String(entry.amount ?? '')); setReceiptChecked(false)}}>Record verified payment</Button>}
          {entry.isLiveRegistration && entry.status !== 'archived' && <Button size="sm" variant="ghost" disabled={isPending} onClick={() => {if (confirm('Archive this registration? It remains available under Archived.')) run(() => archivePadelRegistration(entry.id), 'Registration archived')}}>Archive</Button>}
          {entry.details && <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>{expanded === entry.id ? 'Hide' : 'Details'}</Button>}
        </div></td></tr>
        {expanded === entry.id && entry.details && <tr className="border-b bg-muted/20"><td colSpan={6} className="p-4"><dl className="grid gap-3 sm:grid-cols-3">{Object.entries(entry.details).filter(([,v]) => v !== null && v !== '').map(([key,value]) => <div key={key}><dt className="text-xs capitalize text-muted-foreground">{key.replaceAll('_',' ')}</dt><dd className="mt-1 break-words text-sm">{typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value)}</dd></div>)}</dl></td></tr>}
      </Fragment>)}</tbody>
    </table>{visible.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No registrations match these filters.</p>}</div>
    <Dialog open={Boolean(paymentEntry)} onOpenChange={open => {if (!open) setPaymentEntry(null)}}><DialogContent><DialogHeader><DialogTitle>Record a verified entry fee</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Check the payment receipt against {paymentEntry?.name}&apos;s application. This records the payment; it does not collect money.</p>
      <div className="space-y-2"><Label htmlFor="receipt-reference">Receipt / transaction reference</Label><Input id="receipt-reference" value={reference} onChange={e => setReference(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="verified-amount">Verified amount (£)</Label><Input id="verified-amount" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={receiptChecked} onChange={e => setReceiptChecked(e.target.checked)} className="mt-1" />I have checked the receipt, amount and applicant identity.</label>
      <Button disabled={isPending || !receiptChecked || reference.trim().length < 3} onClick={() => {if (paymentEntry) run(() => recordPadelPayment(paymentEntry.id, reference, Math.round(Number(amount)*100)), 'Payment recorded and place confirmed')}}>{isPending ? 'Saving…' : 'Record payment & confirm place'}</Button>
    </DialogContent></Dialog>
  </div>
}
