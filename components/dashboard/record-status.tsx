import { statusLabel } from '@/lib/crm/submissions'

export function RecordStatus({ status }: { status: string }) {
  const tone = ['paid', 'succeeded', 'approved', 'confirmed', 'resolved', 'payment_verified'].includes(status) ? 'positive'
    : ['new', 'pending', 'payment_pending', 'in_progress', 'waitlisted', 'requires_capture'].includes(status) ? 'pending'
    : ['declined', 'cancelled', 'rejected'].includes(status) ? 'negative' : 'neutral'
  return <span className="crm-status" data-tone={tone}>{statusLabel(status)}</span>
}
