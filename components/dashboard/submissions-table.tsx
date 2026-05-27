'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateSubmissionStatus, updateSubmissionNotes, captureApplicationPayment, cancelApplicationPayment, deleteSubmission, resendPaymentLink, sendAllPaymentLinks, getSendableApplicants, captureAllPayments } from '@/app/dashboard/submissions/actions'
import type { SendableApplicant } from '@/app/dashboard/submissions/actions'
import { Eye, StickyNote, CheckCircle, XCircle, Download, Search, Trash2, Mail, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ReplyComposer } from '@/components/dashboard/reply-composer'
import { Input } from '@/components/ui/input'

interface Submission {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string | null
  form_data: Record<string, unknown>
  status: string
  internal_notes: string | null
  created_at: string
  initiatives: { name: string; slug: string } | null
  source_table: 'form_submissions' | 'camp_applications'
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
  stripe_checkout_expires_at?: string | null
  stripe_pi_status?: string | null
  stripe_review_state?: string | null
}

function formatFieldValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\bid\b/gi, 'ID')
    .replace(/\burl\b/gi, 'URL')
    .replace(/\bsms\b/gi, 'SMS')
    .replace(/\bbjj\b/gi, 'BJJ')
    .replace(/\bdob\b/gi, 'DOB')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const FIELD_SECTIONS: Array<{ title: string; keys: string[]; collapsible?: boolean }> = [
  { title: 'Personal', keys: ['first_name', 'last_name', 'date_of_birth', 'age_at_camp', 'university', 'occupation'] },
  { title: 'Contact', keys: ['email', 'phone', 'address_line_1', 'address_line_2', 'address_line_3', 'city', 'postcode', 'country'] },
  { title: 'Emergency Contact', keys: ['emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone', 'under_18_consent'] },
  { title: 'Health & Dietary', keys: ['dietary_requirements', 'medical_requirements', 'allergies', 'other_allergy', 'carries_epipen'] },
  { title: 'Camp Details', keys: ['travel_method', 'own_transport_type', 'room_preference', 'heard_about_camp', 'first_residential_camp', 'been_to_singhs_camp_before', 'previous_camps', 'sikhi_knowledge_level', 'takeaway_from_camp', 'bjj_interest', 'bjj_fought_professionally', 'bjj_sport_preference'] },
  { title: 'ID & Sevadaar', keys: ['id_document_type', 'id_document_url', 'is_sevadaar', 'sevadaar_verified'] },
  { title: 'Consent', keys: ['consent_email', 'consent_phone', 'consent_sms', 'consent_whatsapp'] },
  { title: 'Payment Details', collapsible: true, keys: ['requires_payment_support', 'payment_support_details', 'donation_amount', 'gift_aid', 'monthly_donation_opted', 'monthly_donation_amount', 'stripe_payment_intent_id', 'stripe_checkout_session_id', 'stripe_checkout_url', 'stripe_checkout_expires_at', 'stripe_checkout_amount_pence', 'phone_normalized'] },
]

function renderFieldValue(key: string, value: unknown) {
  if (key === 'id_document_url' && typeof value === 'string' && value.length > 0) {
    return (
      <a
        href={`/api/camp-applications/view-id?path=${encodeURIComponent(String(value))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-medium underline break-all"
      >
        View Document
      </a>
    )
  }
  if (key === 'stripe_checkout_url' && typeof value === 'string' && value.length > 0) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all text-xs">
        Open Stripe Checkout
      </a>
    )
  }
  if ((key === 'stripe_payment_intent_id' || key === 'stripe_checkout_session_id') && typeof value === 'string') {
    return <span className="font-mono text-xs break-all">{value}</span>
  }
  if (key === 'stripe_checkout_amount_pence' && (typeof value === 'number' || typeof value === 'string')) {
    const pence = Number(value)
    if (Number.isFinite(pence)) return <span className="font-medium">£{(pence / 100).toFixed(2)}</span>
  }
  return <span className="font-medium break-words">{formatFieldValue(value)}</span>
}

function FormDataSections({ formData }: { formData: Record<string, unknown> }) {
  const isPresent = (v: unknown) => v != null && v !== '' && String(v) !== 'null'
  const usedKeys = new Set<string>()

  const sections = FIELD_SECTIONS.map((section) => {
    const present = section.keys.filter((k) => isPresent(formData[k]))
    present.forEach((k) => usedKeys.add(k))
    return { ...section, present }
  }).filter((s) => s.present.length > 0)

  const otherKeys = Object.keys(formData).filter((k) => !usedKeys.has(k) && isPresent(formData[k]))
  if (otherKeys.length > 0) {
    sections.push({ title: 'Other', collapsible: true, keys: otherKeys, present: otherKeys })
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => {
        const body = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 bg-muted/40 rounded-lg p-3 text-sm">
            {section.present.map((key) => (
              <div key={key} className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{formatLabel(key)}</span>
                <div className="text-foreground text-sm min-w-0">{renderFieldValue(key, formData[key])}</div>
              </div>
            ))}
          </div>
        )
        if (section.collapsible) {
          return (
            <details key={section.title} className="group">
              <summary className="cursor-pointer select-none text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1 hover:text-foreground">
                {section.title} <span className="text-[10px] font-normal">({section.present.length}) — click to expand</span>
              </summary>
              <div className="mt-1.5">{body}</div>
            </details>
          )
        }
        return (
          <div key={section.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{section.title}</p>
            {body}
          </div>
        )
      })}
    </div>
  )
}



// Payment health derived from camp_application status + Stripe fields.
// "approved_no_payment" is the silent-approve bug victim subset: status=approved but no PI.
type PaymentHealth =
  | 'needs_action'
  | 'authorized'
  | 'awaiting_payment'
  | 'captured'
  | 'declined'
  | 'pending_review'
  | 'na'

type AwaitingSubState = 'abandoned' | 'expired' | 'reminder' | 'not_started'
type NeedsActionSubState = 'dispute' | 'radar_review'

function getPaymentHealth(sub: Submission): PaymentHealth {
  if (sub.source_table !== 'camp_applications') return 'na'
  const review = sub.stripe_review_state
  const pi = sub.stripe_pi_status
  // Highest priority: disputes / chargebacks / Radar reviews
  if (review === 'payment_support' || review === 'new') return 'needs_action'
  // Stripe payment intent state takes precedence over DB status when present
  if (pi === 'succeeded') return 'captured'
  if (pi === 'requires_capture') return 'authorized'
  if (pi === 'canceled') return 'declined'
  // Fallback to DB status
  switch (sub.status) {
    case 'approved':
    case 'paid':
      return sub.stripe_payment_intent_id ? 'captured' : 'awaiting_payment' // no PI = silent approve, needs payment
    case 'payment_authorized':
      return 'authorized'
    case 'payment_pending':
    case 'payment_support_review':
      return 'awaiting_payment'
    case 'declined':
      return 'declined'
    case 'pending':
    case 'in_review':
      return 'pending_review'
    default:
      return 'pending_review'
  }
}

function getAwaitingSubState(sub: Submission): AwaitingSubState {
  const pi = sub.stripe_pi_status
  const expires = sub.stripe_checkout_expires_at ? new Date(sub.stripe_checkout_expires_at).getTime() : 0
  const now = Date.now()
  if (pi === 'requires_payment_method' || pi === 'requires_action' || pi === 'requires_confirmation') return 'abandoned'
  if (sub.stripe_checkout_session_id && expires && expires < now) return 'expired'
  if (sub.stripe_checkout_session_id) return 'reminder'
  return 'not_started'
}

function getNeedsActionSubState(sub: Submission): NeedsActionSubState {
  return sub.stripe_review_state === 'payment_support' ? 'dispute' : 'radar_review'
}

// ── Awaiting-payment breakdown ─────────────────────────────────────────────
type AwaitingReason = 'silent_approve' | 'payment_failed' | 'checkout_expired' | 'checkout_active' | 'never_started'

function getAwaitingReason(sub: Submission): AwaitingReason {
  const pi = sub.stripe_pi_status
  // Approved by team but no payment was ever collected (silent-approve bug)
  if (sub.status === 'approved' && !sub.stripe_payment_intent_id) return 'silent_approve'
  // Stripe said payment failed or was explicitly abandoned
  if (pi === 'canceled' || pi === 'requires_payment_method') return 'payment_failed'
  const expires = sub.stripe_checkout_expires_at ? new Date(sub.stripe_checkout_expires_at).getTime() : 0
  if (sub.stripe_checkout_session_id && expires && expires < Date.now()) return 'checkout_expired'
  if (sub.stripe_checkout_session_id) return 'checkout_active'
  return 'never_started'
}

const AWAITING_REASON_CONFIG: Record<AwaitingReason, { label: string; why: string; action: string; border: string; bg: string; text: string }> = {
  silent_approve: {
    label: 'Approved — payment never collected',
    why: 'The team approved this application but no payment was ever taken. This happened because of a bug in the old approval flow (payment link was bypassed). The applicant does NOT know they owe money.',
    action: 'Send payment link',
    border: 'border-red-300', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-800 dark:text-red-200',
  },
  payment_failed: {
    label: 'Payment failed or abandoned mid-flow',
    why: 'The applicant clicked the payment link and started entering card details, but the payment did not complete — either their card was declined or they abandoned the form.',
    action: 'Resend payment link',
    border: 'border-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-800 dark:text-orange-200',
  },
  checkout_expired: {
    label: 'Payment link expired',
    why: 'A payment link was sent to the applicant but they did not complete it before it expired (Stripe checkout links expire after 24 hours).',
    action: 'Resend payment link',
    border: 'border-orange-200', bg: 'bg-orange-50/60 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300',
  },
  checkout_active: {
    label: 'Checkout link sent — not yet completed',
    why: 'A payment link has been sent and is still active. The applicant may still complete it. Send a reminder if needed.',
    action: 'Send reminder',
    border: 'border-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-800 dark:text-yellow-200',
  },
  never_started: {
    label: 'No payment link sent yet',
    why: 'This applicant is awaiting payment but no Stripe checkout link has been created or sent to them yet.',
    action: 'Send payment link',
    border: 'border-gray-200', bg: 'bg-gray-50 dark:bg-gray-900/40', text: 'text-gray-700 dark:text-gray-300',
  },
}

function AwaitingPaymentBreakdown({ submissions, onSendLink, onSendAll, isSendingAll, isPending }: {
  submissions: Submission[]
  onSendLink: (sub: Submission) => void
  onSendAll: () => void
  isSendingAll: boolean
  isPending: boolean
}) {
  if (submissions.length === 0) {
    return (
      <div className="mb-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground text-center">
        No applications awaiting payment.
      </div>
    )
  }

  // Group by reason, in priority order
  const ORDER: AwaitingReason[] = ['silent_approve', 'payment_failed', 'checkout_expired', 'checkout_active', 'never_started']
  const grouped: Record<AwaitingReason, Submission[]> = {
    silent_approve: [], payment_failed: [], checkout_expired: [], checkout_active: [], never_started: [],
  }
  for (const sub of submissions) grouped[getAwaitingReason(sub)].push(sub)

  return (
    <div className="mb-3 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50/40 dark:bg-orange-950/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-orange-200 dark:border-orange-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            {submissions.length} application{submissions.length !== 1 ? 's' : ''} awaiting payment — grouped by reason
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={onSendAll} disabled={isSendingAll || isPending} className="shrink-0 gap-1.5 text-xs border-orange-300 text-orange-700 hover:bg-orange-100">
          <Send className="h-3 w-3" />
          {isSendingAll ? 'Sending...' : `Send all ${submissions.length}`}
        </Button>
      </div>
      <div className="divide-y divide-orange-100 dark:divide-orange-900/50">
        {ORDER.filter(r => grouped[r].length > 0).map(reason => {
          const cfg = AWAITING_REASON_CONFIG[reason]
          const rows = grouped[reason]
          return (
            <div key={reason} className={'p-4 ' + cfg.bg}>
              <div className="flex items-start gap-2 mb-2">
                <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + cfg.border + ' ' + cfg.text}>
                  {rows.length} — {cfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cfg.why}</p>
              <div className="flex flex-col gap-2">
                {rows.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => onSendLink(sub)}
                      className="shrink-0 gap-1.5 text-xs"
                    >
                      <Send className="h-3 w-3" />
                      {cfg.action}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuthorisedBreakdown({ submissions, onCapture, onDecline, onCaptureAll, isCaptureAll, isPending }: {
  submissions: Submission[]
  onCapture: (id: string) => void
  onDecline: (id: string) => void
  onCaptureAll: () => void
  isCaptureAll: boolean
  isPending: boolean
}) {
  if (submissions.length === 0) {
    return (
      <div className="mb-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground text-center">
        No on-hold payments.
      </div>
    )
  }
  return (
    <div className="mb-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-200 dark:border-indigo-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              {submissions.length} payment{submissions.length !== 1 ? 's' : ''} on hold — capture within 7 days
            </span>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-0.5">
              Stripe is holding the money but it has NOT been taken yet. You must click Capture for each one. If you wait more than 7 days from the authorisation date, Stripe automatically releases the hold and the money goes back to the applicant.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          disabled={isPending || isCaptureAll}
          onClick={onCaptureAll}
          className="shrink-0 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <CheckCircle className="h-3 w-3" />
          {isCaptureAll ? 'Capturing…' : `Capture all ${submissions.length}`}
        </Button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {submissions.map(sub => (
          <div key={sub.id} className="flex items-center justify-between gap-3 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-card px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{sub.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" disabled={isPending} onClick={() => onCapture(sub.id)} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <CheckCircle className="h-3 w-3" /> Capture
              </Button>
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => onDecline(sub.id)} className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="h-3 w-3" /> Release
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const HEALTH_CARDS: Array<{ key: PaymentHealth | 'all'; label: string; hint: string; dot: string; ringSelected: string; textSelected: string }> = [
  { key: 'all',              label: 'All applications', hint: 'Every camp application',                                       dot: 'bg-foreground',  ringSelected: 'ring-foreground',  textSelected: 'text-foreground' },
  { key: 'needs_action',     label: 'Needs action',     hint: 'Stripe disputes, chargebacks, or Radar reviews — act in Stripe', dot: 'bg-red-500',     ringSelected: 'ring-red-500',     textSelected: 'text-red-700' },
  { key: 'authorized',       label: 'Authorised',       hint: 'Card auth held — capture within 7 days or funds release',      dot: 'bg-indigo-500',  ringSelected: 'ring-indigo-500',  textSelected: 'text-indigo-700' },
  { key: 'awaiting_payment', label: 'Awaiting payment', hint: 'Approved but no payment yet — send / resend a link',           dot: 'bg-orange-500',  ringSelected: 'ring-orange-500',  textSelected: 'text-orange-700' },
  { key: 'captured',         label: 'Captured',         hint: 'Payment succeeded — money in the account',                     dot: 'bg-emerald-500', ringSelected: 'ring-emerald-500', textSelected: 'text-emerald-700' },
  { key: 'declined',         label: 'Declined',         hint: 'Payment cancelled / declined by Stripe',                       dot: 'bg-gray-500',    ringSelected: 'ring-gray-500',    textSelected: 'text-gray-700' },
  { key: 'pending_review',   label: 'Pending review',   hint: 'Application awaiting admin approve / reject',                  dot: 'bg-yellow-500',  ringSelected: 'ring-yellow-500',  textSelected: 'text-yellow-700' },
]




function PaymentHealthCards({ submissions, selected, onSelect, expandedPanel, onTogglePanel }: { submissions: Submission[]; selected: PaymentHealth | 'all'; onSelect: (v: PaymentHealth | 'all') => void; expandedPanel: PaymentHealth | null; onTogglePanel: (v: PaymentHealth | null) => void }) {
  const campApps = submissions.filter((s) => s.source_table === 'camp_applications')
  if (campApps.length === 0) return null
  const counts: Record<string, number> = { all: campApps.length }
  for (const s of campApps) {
    const h = getPaymentHealth(s)
    counts[h] = (counts[h] || 0) + 1
  }
  return (
    <div className="mb-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment health (camp applications)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
      {HEALTH_CARDS.map((card) => {
        const count = counts[card.key] || 0
        const isSel = selected === card.key
        const canExpand = card.key === 'awaiting_payment' || card.key === 'authorized'
        const isExpanded = expandedPanel === card.key
        return (
          <div key={card.key} className="relative">
            <button
              type="button"
              onClick={() => onSelect(card.key)}
              title={card.hint}
              className={'text-left rounded-lg border border-border bg-card px-3 py-2 transition hover:border-foreground/30 w-full ' + (isSel ? 'ring-2 ' + card.ringSelected + ' border-transparent' : '')}
            >
              <div className="flex items-center gap-1.5">
                <span className={'h-2 w-2 rounded-full ' + card.dot} />
                <span className={'text-[11px] uppercase tracking-wide ' + (isSel ? card.textSelected : 'text-muted-foreground')}>{card.label}</span>
              </div>
              <div className={'text-xl font-semibold mt-1 ' + (isSel ? card.textSelected : 'text-foreground')}>{count}</div>
            </button>
            {canExpand && count > 0 && (
              <button
                type="button"
                title={isExpanded ? 'Collapse breakdown' : 'Expand breakdown — see why and send emails'}
                onClick={(e) => { e.stopPropagation(); onTogglePanel(isExpanded ? null : (card.key as PaymentHealth)) }}
                className={'absolute bottom-1 right-1 rounded p-0.5 transition ' + (isExpanded ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
              >
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; badge: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new:                     { label: 'New',              dot: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950',       text: 'text-blue-700 dark:text-blue-300',    badge: 'default' },
  in_review:               { label: 'In Review',       dot: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950',     text: 'text-amber-700 dark:text-amber-300',  badge: 'secondary' },
  replied:                 { label: 'Replied',          dot: 'bg-sky-500',     bg: 'bg-sky-50 dark:bg-sky-950',         text: 'text-sky-700 dark:text-sky-300',      badge: 'outline' },
  resolved:                { label: 'Resolved',         dot: 'bg-gray-400',    bg: 'bg-gray-50 dark:bg-gray-900',       text: 'text-gray-600 dark:text-gray-400',    badge: 'outline' },
  archived:                { label: 'Archived',         dot: 'bg-gray-400',    bg: 'bg-gray-50 dark:bg-gray-900',       text: 'text-gray-500 dark:text-gray-500',    badge: 'secondary' },
  pending:                 { label: 'Pending',          dot: 'bg-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-950',   text: 'text-yellow-700 dark:text-yellow-300', badge: 'default' },
  payment_pending:         { label: 'Awaiting Payment', dot: 'bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950',   text: 'text-orange-700 dark:text-orange-300', badge: 'secondary' },
  payment_authorized:      { label: 'Payment Auth',    dot: 'bg-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950',   text: 'text-indigo-700 dark:text-indigo-300', badge: 'secondary' },
  payment_support_review:  { label: 'Payment Support',  dot: 'bg-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950',   text: 'text-purple-700 dark:text-purple-300', badge: 'secondary' },
  paid:                    { label: 'Paid',             dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', badge: 'outline' },
  approved:                { label: 'Approved',         dot: 'bg-green-500',   bg: 'bg-green-50 dark:bg-green-950',     text: 'text-green-700 dark:text-green-300',  badge: 'outline' },
  declined:                { label: 'Declined',         dot: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-950',         text: 'text-red-700 dark:text-red-300',      badge: 'destructive' },
}

function getStatus(status: string) {
  return statusConfig[status] || { label: status, dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', badge: 'default' as const }
}

function StatusPill({ status }: { status: string }) {
  const s = getStatus(status)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const router = useRouter()
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [notesDialog, setNotesDialog] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<PaymentHealth | 'all'>('all')
  const [expandedPanel, setExpandedPanel] = useState<PaymentHealth | null>(null)

  // Distinct statuses present in this list (so the dropdown only shows relevant options)
  const availableStatuses = Array.from(new Set(submissions.map((s) => s.status))).sort()

  const filteredSubmissions = submissions.filter((s) => {
    if (paymentFilter !== 'all' && getPaymentHealth(s) !== paymentFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const hay = `${s.full_name} ${s.email} ${s.phone ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const handleExportCsv = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('Nothing to export')
      return
    }

    const formDataKeys = new Set<string>()
    filteredSubmissions.forEach((s) => {
      Object.keys(s.form_data || {}).forEach((k) => formDataKeys.add(k))
    })
    const formDataCols = Array.from(formDataKeys).sort()

    const baseCols = ['id', 'source', 'full_name', 'email', 'phone', 'status', 'project', 'created_at', 'message', 'internal_notes']
    const headers = [...baseCols, ...formDataCols]

    const escape = (val: unknown): string => {
      if (val == null) return ''
      let s: string
      if (typeof val === 'object') s = JSON.stringify(val)
      else s = String(val)
      if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
      return s
    }

    const rows = filteredSubmissions.map((s) => {
      const row: Record<string, unknown> = {
        id: s.id,
        source: s.source_table,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        project: s.initiatives?.name ?? '',
        created_at: s.created_at,
        message: s.message,
        internal_notes: s.internal_notes,
      }
      formDataCols.forEach((k) => {
        row[k] = s.form_data?.[k]
      })
      return headers.map((h) => escape(row[h])).join(',')
    })

    const csv = '\ufeff' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `submissions-${statusFilter}-${ts}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredSubmissions.length} row${filteredSubmissions.length === 1 ? '' : 's'}`)
  }

  const handleStatusChange = (id: string, status: string, sourceTable: 'form_submissions' | 'camp_applications' = 'form_submissions') => {
    startTransition(async () => {
      try {
        // For camp applications, approve/decline must go through Stripe so the
        // payment is actually captured (or the auth released). A plain status
        // update would leave the payment in an authorized-but-uncaptured state.
        if (sourceTable === 'camp_applications' && status === 'approved') {
          await captureApplicationPayment(id)
          toast.success('Approved — payment captured')
          return
        }
        if (sourceTable === 'camp_applications' && status === 'declined') {
          await cancelApplicationPayment(id)
          toast.success('Declined — funds released')
          return
        }
        await updateSubmissionStatus(id, status, sourceTable)
        toast.success('Status updated')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  const handleApprove = (id: string) => {
    startTransition(async () => {
      try { await captureApplicationPayment(id); toast.success('Approved - payment captured') } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to approve') }
    })
  }

  const handleDecline = (id: string) => {
    startTransition(async () => {
      try { await cancelApplicationPayment(id); toast.success('Declined - funds released') } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to decline') }
    })
  }

  const [isCaptureAll, setIsCaptureAll] = useState(false)

  const handleCaptureAll = () => {
    const authCount = submissions.filter(s => s.source_table === 'camp_applications' && getPaymentHealth(s) === 'authorized').length
    if (!window.confirm(`Capture payments for all ${authCount} applicant${authCount !== 1 ? 's' : ''} on hold? This will charge their cards and send them approval emails.`)) return
    setIsCaptureAll(true)
    captureAllPayments().then(result => {
      if (result.failed > 0) {
        toast.error(`Captured ${result.captured}, failed ${result.failed}: ${result.errors.slice(0, 2).join('; ')}`)
      } else {
        toast.success(`Captured ${result.captured} payment${result.captured !== 1 ? 's' : ''} — approval emails sent`)
      }
      if ((result as any).debug) {
        toast.info((result as any).debug, { duration: 30000 })
        console.log('[CaptureAll DEBUG]', (result as any).debug)
      }
      router.refresh()
    }).catch(err => {
      toast.error(err instanceof Error ? err.message : 'Capture all failed')
    }).finally(() => setIsCaptureAll(false))
  }

  const [isSendingAll, setIsSendingAll] = useState(false)
  const [sendAllModal, setSendAllModal] = useState(false)
  const [sendableApplicants, setSendableApplicants] = useState<SendableApplicant[]>([])
  const [selectedSendIds, setSelectedSendIds] = useState<Set<number>>(new Set())
  const [sendAllResults, setSendAllResults] = useState<{ sent: number; failed: number; sent_to: string[]; errors: string[]; skipped_already_contacted: string[] } | null>(null)

  const openSendAllPreview = async () => {
    try {
      const applicants = await getSendableApplicants()
      setSendableApplicants(applicants)
      // Pre-select only applicants NOT already invoiced manually via Stripe
      setSelectedSendIds(new Set(applicants.filter(a => !a.stripe_manual_contact).map(a => a.id)))
      setSendAllResults(null)
      setSendAllModal(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load applicants')
    }
  }

  const toggleSendId = (id: number, checked: boolean) => {
    setSelectedSendIds(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const confirmBulkSend = async (force = false) => {
    const ids = Array.from(selectedSendIds)
    if (ids.length === 0) return
    if (force) {
      const flaggedCount = sendableApplicants.filter(a => a.stripe_manual_contact && selectedSendIds.has(a.id)).length
      if (flaggedCount > 0 && !window.confirm(`Force send will email ${flaggedCount} applicant(s) who were ALREADY invoiced manually via Stripe. Continue?`)) return
    }
    setIsSendingAll(true)
    try {
      const result = await sendAllPaymentLinks(ids, force ? { force: true } : undefined)
      setSendAllResults(result)
      const skipNote = result.skipped_already_contacted.length > 0 ? `, ${result.skipped_already_contacted.length} skipped (already invoiced)` : ''
      if (result.failed > 0) {
        toast.error(`Sent ${result.sent}, ${result.failed} failed${skipNote} — see details below`)
      } else if (result.skipped_already_contacted.length > 0) {
        toast.warning(`Sent ${result.sent}${skipNote}`)
      } else {
        toast.success(`Payment emails sent to ${result.sent} applicant${result.sent !== 1 ? 's' : ''}`)
        setSendAllModal(false)
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk send failed')
    } finally {
      setIsSendingAll(false)
    }
  }

  const handleSendAllPaymentLinks = openSendAllPreview

  const handleSendRepaymentLink = (sub: Submission) => {
    const isBroken = sub.status === 'approved' && !!(sub.stripe_payment_intent_id && sub.stripe_payment_intent_id.length > 0) === false
    const msg = isBroken
      ? 'This application was approved but NO payment was ever taken (silent-approve bug victim). Reset to payment_pending and email a fresh Stripe checkout link to ' + sub.email + '?'
      : 'Send a fresh Stripe checkout link to ' + sub.email + '?'
    if (!window.confirm(msg)) return
    startTransition(async () => {
      try { await resendPaymentLink(sub.id); toast.success('Payment link sent to ' + sub.email) }
      catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to send payment link'
        if (errMsg.startsWith('Blocked:') && window.confirm(errMsg + '\n' + '\n' + 'Send anyway?')) {
          try { await resendPaymentLink(sub.id, { force: true }); toast.success('Payment link force-sent to ' + sub.email) }
          catch (e2) { toast.error(e2 instanceof Error ? e2.message : 'Failed to send payment link') }
        } else {
          toast.error(errMsg)
        }
      }
    })
  }



  const handleDelete = (sub: Submission) => {
    const confirmed = window.confirm(
      `Permanently delete this ${sub.source_table === 'camp_applications' ? 'camp application' : 'submission'} from ${sub.full_name} <${sub.email}>?\n\nThis cannot be undone. Any uncaptured Stripe authorisation will be cancelled first.`
    )
    if (!confirmed) return
    startTransition(async () => {
      try {
        await deleteSubmission(sub.id, sub.source_table)
        toast.success('Deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete')
      }
    })
  }

  const handleSaveNotes = () => {
    if (!notesDialog) return
    startTransition(async () => {
      try {
        await updateSubmissionNotes(notesDialog.id, notes, notesDialog.source_table)
        toast.success('Notes saved')
        setNotesDialog(null)
      } catch {
        toast.error('Failed to save notes')
      }
    })
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">No submissions found</p>
        <p className="text-sm text-muted-foreground mt-1">Submissions will appear here when users submit forms on the website.</p>
      </div>
    )
  }

  return (
    <>
      <PaymentHealthCards submissions={submissions} selected={paymentFilter} onSelect={setPaymentFilter} expandedPanel={expandedPanel} onTogglePanel={setExpandedPanel} />
      {expandedPanel === 'awaiting_payment' && (
        <AwaitingPaymentBreakdown
          submissions={submissions.filter(s => s.source_table === 'camp_applications' && getPaymentHealth(s) === 'awaiting_payment')}
          onSendLink={handleSendRepaymentLink}
          onSendAll={handleSendAllPaymentLinks}
          isSendingAll={isSendingAll}
          isPending={isPending}
        />
      )}
      {expandedPanel === 'authorized' && (
        <AuthorisedBreakdown
          submissions={submissions.filter(s => s.source_table === 'camp_applications' && getPaymentHealth(s) === 'authorized')}
          onCapture={handleApprove}
          onDecline={handleDecline}
          onCaptureAll={handleCaptureAll}
          isCaptureAll={isCaptureAll}
          isPending={isPending}
        />
      )}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses ({submissions.length})</SelectItem>
              {availableStatuses.map((s) => {
                const cfg = getStatus(s)
                const count = submissions.filter((x) => x.status === s).length
                return (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cfg.label} ({count})
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {filteredSubmissions.length} of {submissions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredSubmissions.length === 0}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Project</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No submissions match the current filter.
                </TableCell>
              </TableRow>
            ) : filteredSubmissions.map((sub) => (
              <TableRow key={sub.id + sub.source_table}>
                <TableCell className="font-medium text-foreground">
                  {sub.full_name}
                  {sub.source_table === 'camp_applications' && (
                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Camp</Badge>
                  )}
                  {sub.source_table === 'camp_applications' && sub.form_data?.is_sevadaar === true && (
                    <Badge
                      variant="outline"
                      className="ml-1 text-[10px] px-1 py-0 border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300"
                      title="Applicant claims to be a Sevadaar - verify before issuing discount code"
                    >
                      Sevadaar
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{sub.initiatives?.name || 'General'}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{sub.email}</TableCell>
                <TableCell>
                  {sub.source_table === 'camp_applications' && (sub.status === 'approved' || sub.status === 'declined') ? (
                    <span title={sub.status === 'approved' ? 'Status locked - payment captured. Use Delete to reverse.' : 'Status locked - declined and refunded.'}>
                      <StatusPill status={sub.status} />
                    </span>
                  ) : (
                  <Select
                    value={sub.status}
                    onValueChange={(v) => handleStatusChange(sub.id, v, sub.source_table)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-50">
                      <StatusPill status={sub.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {sub.source_table === 'camp_applications' ? (
                        <>
                          <SelectItem value="pending"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500" />Pending</span></SelectItem>
                          <SelectItem value="in_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />In Review</span></SelectItem>
                          <SelectItem value="payment_pending"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500" />Awaiting Payment</span></SelectItem>
                          <SelectItem value="payment_authorized"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Payment Authorized</span></SelectItem>
                          <SelectItem value="payment_support_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Payment Support</span></SelectItem>
                          <SelectItem value="paid"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Paid</span></SelectItem>
                          <SelectItem value="approved"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" />Approved</span></SelectItem>
                          <SelectItem value="declined"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Declined</span></SelectItem>
                          <SelectItem value="archived"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Archived</span></SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="new"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />New</span></SelectItem>
                          <SelectItem value="in_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />In Review</span></SelectItem>
                          <SelectItem value="replied"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Replied</span></SelectItem>
                          <SelectItem value="resolved"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Resolved</span></SelectItem>
                          <SelectItem value="archived"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Archived</span></SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                  {sub.source_table === 'camp_applications' && sub.status !== 'declined' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(sub.id)}
                        disabled={isPending}
                        title={sub.status === 'approved' ? 'Re-run Stripe capture' : 'Approve - capture payment'}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">{sub.status === 'approved' ? 'Re-capture payment' : 'Approve'}</span>
                      </Button>
                      {sub.status !== 'approved' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDecline(sub.id)} disabled={isPending} title="Decline - release funds">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Decline</span>
                        </Button>
                      )}
                      {(() => {
                        const h = getPaymentHealth(sub)
                        if (h === 'awaiting_payment') {
                          const isBroken = sub.status === 'approved' && !sub.stripe_payment_intent_id
                          return (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={'h-8 w-8 ' + (isBroken ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50')}
                              onClick={() => handleSendRepaymentLink(sub)}
                              disabled={isPending}
                              title={isBroken ? 'Approved with NO payment - reset and send fresh Stripe link' : 'Send fresh Stripe payment link to applicant'}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Send repayment link</span>
                            </Button>
                          )
                        }
                        return null
                      })()}
                    </>
                  )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(sub)}
                      disabled={isPending}
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSubmission(sub)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Submission Details</DialogTitle>
                          <DialogDescription>
                            From {selectedSubmission?.full_name || sub.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="text-foreground font-medium">{sub.email}</p>
                            </div>
                            {sub.phone && (
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="text-foreground font-medium">{sub.phone}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Project</p>
                              <p className="text-foreground font-medium">{sub.initiatives?.name || 'General'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <StatusPill status={sub.status} />
                            </div>
                          </div>
                          {sub.message && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Message</p>
                              <p className="text-sm text-foreground bg-muted rounded-lg p-3">{sub.message}</p>
                            </div>
                          )}
                          {sub.form_data && Object.keys(sub.form_data).length > 0 && (
                            <FormDataSections formData={sub.form_data} />
                          )}
                          {sub.internal_notes && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                              <p className="text-sm text-foreground bg-accent/20 rounded-lg p-3">{sub.internal_notes}</p>
                            </div>
                          )}
                          {sub.source_table === 'camp_applications' && sub.status !== 'declined' && (
                            <div className="flex gap-2 pt-2">
                              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(sub.id)} disabled={isPending}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {sub.status === 'approved' ? 'Re-run Stripe Capture' : 'Approve & Capture Payment'}
                              </Button>
                              {sub.status !== 'approved' && (
                                <Button variant="destructive" className="flex-1" onClick={() => handleDecline(sub.id)} disabled={isPending}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline & Release Funds
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <ReplyComposer
                      submissionId={sub.id}
                      sourceTable={sub.source_table}
                      recipientName={sub.full_name}
                      recipientEmail={sub.email}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setNotesDialog(sub)
                        setNotes(sub.internal_notes || '')
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      <span className="sr-only">Add notes</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!notesDialog} onOpenChange={(open) => !open && setNotesDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Internal Notes</DialogTitle>
            <DialogDescription>
              Add private notes for {notesDialog?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Label htmlFor="notes" className="text-foreground">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes here..."
              rows={4}
            />
            <Button onClick={handleSaveNotes} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Send All: Pre-send Review Modal ── */}
      <Dialog open={sendAllModal} onOpenChange={setSendAllModal}>
        <DialogContent className="max-w-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-orange-600" />
              Review before sending
            </DialogTitle>
            <DialogDescription>
              Each applicant below has been approved for a camp seat by an admin.
              Sending issues them a <strong>unique, personal payment link</strong> via email.
              A seat is reserved when their payment is authorised by Stripe.
              Uncheck anyone you are not yet ready to send to.
            </DialogDescription>
          </DialogHeader>

          {/* Banner explaining auto-exclusions */}
          {sendableApplicants.some(a => a.stripe_manual_contact) && (
            <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-3 py-2 text-xs text-red-800 dark:text-red-200 mt-2">
              <strong>{sendableApplicants.filter(a => a.stripe_manual_contact).length} applicant(s) already invoiced manually via Stripe</strong> &mdash; pre-excluded from this send. These are blocked server-side and will be skipped even if ticked, unless you use Force Send below.
            </div>
          )}

          {/* Select all bar */}
          <div className="flex items-center justify-between px-1 py-2 border-b text-xs text-muted-foreground">
            <div className="flex gap-3">
              <button className="underline hover:text-foreground" onClick={() => setSelectedSendIds(new Set(sendableApplicants.map(a => a.id)))}>Select all</button>
              <button className="underline hover:text-foreground" onClick={() => setSelectedSendIds(new Set())}>Deselect all</button>
            </div>
            <span className="font-medium text-foreground">{selectedSendIds.size} of {sendableApplicants.length} selected</span>
          </div>

          {/* Applicant list */}
          <div className="overflow-y-auto flex-1 divide-y">
            {sendableApplicants.map(app => {
              const manual = app.stripe_manual_contact
              return (
              <label key={app.id} className={"flex items-center gap-3 px-1 py-3 cursor-pointer hover:bg-muted/40 rounded " + (manual ? "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 pl-2" : "")}>
                <Checkbox
                  checked={selectedSendIds.has(app.id)}
                  onCheckedChange={(v) => toggleSendId(app.id, Boolean(v))}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{app.first_name} {app.last_name}</p>
                  <p className="text-xs text-muted-foreground">{app.email}</p>
                  {manual && (
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 mt-0.5">
                      ⚠ Already contacted manually: Stripe {manual.kind} {manual.identifier} ({manual.status}, £{manual.amount_gbp.toFixed(2)})
                    </p>
                  )}
                  {app.payment_reminder_sent_at && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Previously sent {new Date(app.payment_reminder_sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${app.status === 'approved' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'}`}>
                    {app.status === 'approved' ? 'Approved — no link yet' : 'Awaiting payment'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    £{app.stripe_checkout_amount_pence ? (app.stripe_checkout_amount_pence / 100).toFixed(2) : '199.00'}
                  </p>
                </div>
              </label>
              )
            })}
          </div>

          {/* Post-send results */}
          {sendAllResults && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-2 max-h-40 overflow-y-auto">
              <p className="font-semibold text-green-700 dark:text-green-400">
                ✓ Sent to {sendAllResults.sent} applicant{sendAllResults.sent !== 1 ? 's' : ''}
              </p>
              {sendAllResults.sent_to.map((name, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {name}</p>
              ))}
              {sendAllResults.skipped_already_contacted && sendAllResults.skipped_already_contacted.length > 0 && (
                <div className="pt-1 border-t">
                  <p className="font-semibold text-red-700 dark:text-red-300">{sendAllResults.skipped_already_contacted.length} skipped (already invoiced manually):</p>
                  {sendAllResults.skipped_already_contacted.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">• {e}</p>
                  ))}
                </div>
              )}
              {sendAllResults.errors.length > 0 && (
                <div className="pt-1 border-t">
                  <p className="font-semibold text-red-600">{sendAllResults.errors.length} failed:</p>
                  {sendAllResults.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-500">• {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendAllModal(false)}>
              {sendAllResults ? 'Close' : 'Cancel'}
            </Button>
            {!sendAllResults && (
              <>
                <Button onClick={() => confirmBulkSend(false)} disabled={selectedSendIds.size === 0 || isSendingAll} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                  <Send className="h-4 w-4" />
                  {isSendingAll ? 'Sending...' : `Send to ${selectedSendIds.size} applicant${selectedSendIds.size !== 1 ? 's' : ''}`}
                </Button>
                {sendableApplicants.some(a => a.stripe_manual_contact && selectedSendIds.has(a.id)) && (
                  <Button onClick={() => confirmBulkSend(true)} disabled={selectedSendIds.size === 0 || isSendingAll} variant="destructive" className="gap-2" title="Override dedupe guard and send even to applicants already invoiced manually">
                    <Send className="h-4 w-4" />
                    Force send (override)
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
