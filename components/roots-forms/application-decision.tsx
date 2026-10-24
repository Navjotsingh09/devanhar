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
  const [changing, setChanging] = useState(false)
  const final = (status === 'accepted' || status === 'declined') && emailState === 'sent'
  const other: RootsDecision = status === 'accepted' ? 'declined' : 'accepted'
  async function decide(decision: RootsDecision) {
    const reversal = final ? ' This reverses the decision already emailed to the family, and they will receive a second email.' : ''
    if (!window.confirm((decision === 'accepted' ? 'Accept this application and email congratulations with the £50 payment link?' : 'Decline this application and email the parent or guardian?') + reversal)) return
    setPending(true); setMessage('')
    try {
      const response = await fetch(`/api/roots-forms/${formId}/responses/${responseId}/decision`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({decision, expectedRevision: revision}),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The decision could not be completed.')
      setFailed(false); setChanging(false); setMessage('Decision saved. The email provider accepted the notification.')
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : 'The decision could not be completed.')
    } finally { setPending(false); router.refresh() }
  }
  return <section className="space-y-3 rounded-2xl border bg-card p-5">
    <h2 className="font-semibold">Application decision</h2>
    {final ? <>
      <p className={'inline-flex rounded-full border px-3 py-1 text-sm font-medium ' + (status === 'accepted' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>{status === 'accepted' ? 'Accepted · Congratulations email sent' : 'Declined · Decline email sent'}</p>
      <p className="text-sm text-muted-foreground">This decision is final and the family has been emailed.</p>
      {paid ? <p className="text-sm text-muted-foreground">This application is paid, so the decision cannot be changed here. Contact an administrator about any cancellation or refund.</p>
        : !changing ? <button type="button" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" onClick={() => setChanging(true)}>Made a mistake? Change decision</button>
        : <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-950">Only change a decision to correct a mistake. The family will receive a second email {other === 'declined' ? 'telling them they have not been offered a place' : 'offering them a place with the £50 payment link'}.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant={other === 'declined' ? 'outline' : 'default'} disabled={pending} onClick={() => void decide(other)}>{other === 'declined' ? 'Change to declined & email' : 'Change to accepted & email'}</Button>
            <Button variant="ghost" disabled={pending} onClick={() => setChanging(false)}>Cancel</Button>
          </div>
        </div>}
    </> : <>
      <p className="text-sm">Decision: {status === 'pending' ? 'New · Awaiting review' : `${status} · Email ${emailState.replaceAll('_', ' ')}`}</p>
      <p className="text-sm text-muted-foreground">Acceptance emails include the £50 NowDonate payment link unless payment is already recorded. Decline emails do not request payment.</p>
      <div className="flex flex-wrap gap-3">
        {status !== 'declined' && <Button disabled={pending} onClick={() => void decide('accepted')}>{status === 'accepted' ? 'Retry acceptance email' : 'Accept & email'}</Button>}
        {status !== 'accepted' && <Button variant="outline" disabled={pending || paid} onClick={() => void decide('declined')}>{status === 'declined' ? 'Retry decline email' : 'Decline & email'}</Button>}
      </div>
    </>}
    {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'text-sm text-red-700' : 'text-sm text-green-700'}>{message}</p>}
  </section>
}
