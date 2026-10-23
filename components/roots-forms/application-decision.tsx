'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { RootsDecision } from '@/lib/roots-forms/decision-email'

export function ApplicationDecision({formId, responseId, revision, status, emailState, paid = false}: {
  formId: string; responseId: string; revision: number; status: string; emailState: string; paid?: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  async function decide(decision: RootsDecision) {
    if (!window.confirm(decision === 'accepted' ? 'Accept this application and email congratulations with the £50 payment link?' : 'Decline this application and email the parent or guardian?')) return
    setPending(true); setMessage('')
    try {
      const response = await fetch(`/api/roots-forms/${formId}/responses/${responseId}/decision`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({decision, expectedRevision: revision}),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The decision could not be completed.')
      setFailed(false); setMessage('Decision saved. The email provider accepted the notification.')
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : 'The decision could not be completed.')
    } finally { setPending(false); router.refresh() }
  }
  return <section className="space-y-3 rounded-2xl border bg-card p-5">
    <h2 className="font-semibold">Application decision</h2>
    <p className="text-sm">Decision: {status === 'pending' ? 'New · Awaiting review' : status} · Email: {emailState.replaceAll('_', ' ')}</p>
    <p className="text-sm text-muted-foreground">Acceptance emails include the £50 NowDonate payment link unless payment is already recorded. Decline emails do not request payment.</p>
    <div className="flex gap-3">
      <Button disabled={pending || (status === 'accepted' && emailState === 'sent')} onClick={() => void decide('accepted')}>{status === 'accepted' ? 'Retry acceptance email' : 'Accept & email'}</Button>
      <Button variant="outline" disabled={pending || paid || (status === 'declined' && emailState === 'sent')} onClick={() => void decide('declined')}>{status === 'declined' ? 'Retry decline email' : 'Decline & email'}</Button>
    </div>
    {paid && <p className="text-sm text-muted-foreground">Paid applications cannot be declined here. Contact an administrator to review any cancellation or refund.</p>}
    {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'text-sm text-red-700' : 'text-sm text-green-700'}>{message}</p>}
  </section>
}
