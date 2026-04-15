const OWNER_NOTIFICATION_EMAIL = process.env.CAMP_OWNER_NOTIFICATION_EMAIL || 'admin@devanhaar.com'

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function toDisplayValue(value: unknown): string {
  if (value == null) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : 'N/A'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildFieldEntries(payload: Record<string, unknown>): Array<[string, string]> {
  const hiddenKeys = new Set([
    'stripe_session_id',
    'stripe_payment_intent_id',
    'payment_captured_at',
    'payment_authorized_at',
    'payment_released_at',
    'internal_notes',
    'status',
    'initiative_id',
  ])

  return Object.entries(payload)
    .filter(([key]) => !hiddenKeys.has(key))
    .map(([key, value]) => [formatLabel(key), toDisplayValue(value)])
}

function buildTextBody(entries: Array<[string, string]>, submissionId: string): string {
  const lines = [
    'New Singhs Camp application submitted.',
    '',
    `Submission ID: ${submissionId}`,
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Form submission copy:',
    ...entries.map(([label, value]) => `${label}: ${value}`),
  ]

  return lines.join('\n')
}

function buildHtmlBody(entries: Array<[string, string]>, submissionId: string): string {
  const rows = entries
    .map(([label, value]) => {
      return `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #ddd;vertical-align:top;">${escapeHtml(value)}</td></tr>`
    })
    .join('')

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;">
      <h2 style="margin:0 0 8px;">New Singhs Camp application submitted</h2>
      <p style="margin:0 0 4px;"><strong>Submission ID:</strong> ${escapeHtml(submissionId)}</p>
      <p style="margin:0 0 16px;"><strong>Generated at:</strong> ${escapeHtml(new Date().toISOString())}</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

export async function sendCampApplicationOwnerNotification(params: {
  submissionId: string
  payload: Record<string, unknown>
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Camp Notification] Skipping owner email - RESEND_API_KEY is not configured')
    return false
  }

  const entries = buildFieldEntries(params.payload)

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Devanhaar <noreply@devanhaar.org>',
    to: OWNER_NOTIFICATION_EMAIL,
    subject: `New Singhs Camp submission - ${params.submissionId}`,
    text: buildTextBody(entries, params.submissionId),
    html: buildHtmlBody(entries, params.submissionId),
  })

  return true
}
