// ============================================================================
// SPN (Sikh Professionals Network) transactional emails — via Resend
// ----------------------------------------------------------------------------
// Mirrors lib/vidyala-emails.ts. Sends:
//   - applicant confirmation ("bounce-back") on submit
//   - internal team notification on submit
//   - approval email   (on dashboard Approve)
//   - decline email    (on dashboard Decline)
//
// All functions are non-throwing: if RESEND_API_KEY (or the Resend call) is
// unavailable they log and return false, so a submission/approval never fails
// because of email. Sender/recipient addresses come from env vars with sane
// defaults. NOTE: the FROM domain must be verified in Resend — devanhaar.com
// is verified, so defaults use it; reply-to points at the SPN inbox.
// ============================================================================

// Applicant-facing sender (verified domain). Override with SPN_FROM_EMAIL.
const SPN_FROM_EMAIL = process.env.SPN_FROM_EMAIL || 'Sikh Professionals Network <spn@devanhaar.com>'
// System sender for internal notifications. Override with SPN_SYSTEM_FROM.
const SPN_SYSTEM_FROM = process.env.SPN_SYSTEM_FROM || 'SPN Website <spn@devanhaar.com>'
// Where new-submission alerts go. Hardcoded to the SPN inbox — do NOT rely on
// SPN_INTERNAL_EMAIL env var which may be stale from a previous deployment.
const SPN_INTERNAL_EMAIL = 'hello@sikhpn.org'
// Reply-to for applicant emails. Override with SPN_REPLY_TO.
const SPN_REPLY_TO = process.env.SPN_REPLY_TO || 'hello@sikhpn.org'

const NAVY = '#132030'
const NAVY2 = '#172e49'
const ACCENT = '#b86c40'

type SubmissionType = 'join' | 'advisor' | 'grad_award' | 'event' | string

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Human-readable label for each submission type.
function typeLabel(t: SubmissionType): string {
  switch (t) {
    case 'join': return 'SPN membership'
    case 'advisor': return 'SPN Advisor'
    case 'grad_award': return 'Sikh Graduate Awards'
    case 'event': return 'SPN event'
    default: return 'SPN'
  }
}

// What we tell the applicant we received.
function applicantSubjectNoun(t: SubmissionType): string {
  switch (t) {
    case 'join': return 'membership request'
    case 'advisor': return 'advisor application'
    case 'grad_award': return 'Sikh Graduate Awards registration'
    case 'event': return 'event registration'
    default: return 'submission'
  }
}

function shell(innerHtml: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#191615;max-width:600px;margin:0 auto;">
      <div style="background:${NAVY};border-radius:12px 12px 0 0;padding:32px;text-align:center;">
        <h1 style="color:${ACCENT};margin:0;font-size:20px;letter-spacing:1px;">SIKH PROFESSIONALS NETWORK</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">Connect &middot; Empower &middot; Succeed</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:36px;">
        ${innerHtml}
      </div>
    </div>
  `
}

// ----------------------------------------------------------------------------
// 1) Applicant confirmation ("bounce-back") on submit
// ----------------------------------------------------------------------------
export async function sendSpnConfirmationEmail(params: {
  to: string
  firstName: string
  submissionType: SubmissionType
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[SPN Email] Skipping confirmation email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const noun = applicantSubjectNoun(params.submissionType)
  const label = typeLabel(params.submissionType)

  const html = shell(`
    <h2 style="margin:0 0 16px;color:${NAVY};">Thank you, ${name}</h2>
    <p>We've received your <strong>${escapeHtml(noun)}</strong> for the <strong>${escapeHtml(label)}</strong> and it is now with our team for review.</p>
    <div style="background:#faf6f2;border-left:4px solid ${ACCENT};border-radius:4px;padding:16px;margin:24px 0;">
      <p style="margin:0;color:${NAVY};font-weight:600;">What happens next?</p>
      <ul style="color:#474747;font-size:14px;margin:8px 0 0;padding-left:20px;">
        <li>Our team will review your details</li>
        <li>We'll be in touch by email with the outcome and next steps</li>
        <li>If you have any questions in the meantime, just reply to this email</li>
      </ul>
    </div>
    <p style="margin-top:24px;">Warm regards,<br/><strong>The SPN Team</strong><br/>Sikh Professionals Network</p>
  `)

  const text = `Thank you, ${params.firstName}

We've received your ${noun} for the ${label} and it is now with our team for review.

What happens next?
- Our team will review your details
- We'll be in touch by email with the outcome and next steps
- If you have any questions in the meantime, just reply to this email

Warm regards,
The SPN Team
Sikh Professionals Network`

  try {
    await resend.emails.send({
      from: SPN_FROM_EMAIL,
      to: params.to,
      replyTo: SPN_REPLY_TO,
      subject: `We've received your ${noun} — Sikh Professionals Network`,
      html,
      text,
    })
    console.log('[SPN Email] Confirmation email sent to', params.to)
    return true
  } catch (err) {
    console.error('[SPN Email] Failed to send confirmation email:', err)
    return false
  }
}

// ----------------------------------------------------------------------------
// 2) Approval email (on dashboard Approve)
// ----------------------------------------------------------------------------
export async function sendSpnApprovalEmail(params: {
  to: string
  firstName: string
  submissionType: SubmissionType
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[SPN Email] Skipping approval email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const label = typeLabel(params.submissionType)

  const html = shell(`
    <h2 style="margin:0 0 16px;color:${NAVY};">Welcome aboard, ${name}!</h2>
    <p>We're delighted to let you know that your ${escapeHtml(applicantSubjectNoun(params.submissionType))} for the <strong>${escapeHtml(label)}</strong> has been <span style="color:#2a6041;font-weight:bold;">approved</span>.</p>
    <div style="background:#f0fdf4;border-left:4px solid #2a6041;border-radius:4px;padding:16px;margin:24px 0;">
      <p style="margin:0;color:#065f46;font-weight:600;">What happens next?</p>
      <ul style="color:#065f46;font-size:14px;margin:8px 0 0;padding-left:20px;">
        <li>Our team will be in touch with details and next steps</li>
        <li>Keep an eye on your inbox for important updates</li>
        <li>If you have any questions, just reply to this email</li>
      </ul>
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://sikhpn.org" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Visit SPN</a>
    </p>
    <p style="margin-top:24px;">Warm regards,<br/><strong>The SPN Team</strong><br/>Sikh Professionals Network</p>
  `)

  const text = `Welcome aboard, ${params.firstName}!

We're delighted to let you know that your ${applicantSubjectNoun(params.submissionType)} for the ${label} has been approved.

What happens next?
- Our team will be in touch with details and next steps
- Keep an eye on your inbox for important updates
- If you have any questions, just reply to this email

Warm regards,
The SPN Team
Sikh Professionals Network`

  try {
    await resend.emails.send({
      from: SPN_FROM_EMAIL,
      to: params.to,
      replyTo: SPN_REPLY_TO,
      subject: `Your ${label} application has been approved`,
      html,
      text,
    })
    console.log('[SPN Email] Approval email sent to', params.to)
    return true
  } catch (err) {
    console.error('[SPN Email] Failed to send approval email:', err)
    return false
  }
}

// ----------------------------------------------------------------------------
// 3) Decline email (on dashboard Decline)
// ----------------------------------------------------------------------------
export async function sendSpnDeclineEmail(params: {
  to: string
  firstName: string
  submissionType: SubmissionType
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[SPN Email] Skipping decline email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const label = typeLabel(params.submissionType)

  const html = shell(`
    <h2 style="margin:0 0 16px;color:${NAVY};">Thank you, ${name}</h2>
    <p>Thank you for your interest in the <strong>${escapeHtml(label)}</strong>. After careful consideration, we're sorry to let you know that we're unable to take your ${escapeHtml(applicantSubjectNoun(params.submissionType))} forward on this occasion.</p>
    <p>We'd warmly encourage you to stay connected with the Sikh Professionals Network — our community, events and opportunities are always growing, and we'd love to see you involved in future.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://sikhpn.org" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">Stay Connected with SPN</a>
    </p>
    <p>If you have any questions, please reply to this email.</p>
    <p style="margin-top:24px;">Warm regards,<br/><strong>The SPN Team</strong><br/>Sikh Professionals Network</p>
  `)

  const text = `Thank you, ${params.firstName}

Thank you for your interest in the ${label}. After careful consideration, we're sorry to let you know that we're unable to take your ${applicantSubjectNoun(params.submissionType)} forward on this occasion.

We'd warmly encourage you to stay connected with the Sikh Professionals Network — our community, events and opportunities are always growing, and we'd love to see you involved in future.

If you have any questions, please reply to this email.

Warm regards,
The SPN Team
Sikh Professionals Network`

  try {
    await resend.emails.send({
      from: SPN_FROM_EMAIL,
      to: params.to,
      replyTo: SPN_REPLY_TO,
      subject: `Update on your ${label} application`,
      html,
      text,
    })
    console.log('[SPN Email] Decline email sent to', params.to)
    return true
  } catch (err) {
    console.error('[SPN Email] Failed to send decline email:', err)
    return false
  }
}

// ----------------------------------------------------------------------------
// 4) Internal team notification on submit
// ----------------------------------------------------------------------------
export async function sendSpnInternalNotification(params: {
  submissionId: number | string
  submissionType: SubmissionType
  data: Record<string, unknown>
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const d = params.data
  const esc = (v: unknown) => escapeHtml(String(v ?? '—'))
  const label = typeLabel(params.submissionType)
  const dashboardUrl = 'https://devanhaar.com/dashboard/submissions'

  const row = (lbl: string, value: string) =>
    `<tr><td style="padding:6px 12px;font-weight:600;color:${NAVY};white-space:nowrap;width:200px;vertical-align:top;">${escapeHtml(lbl)}</td><td style="padding:6px 12px;color:#191615;">${value}</td></tr>`

  // Render every non-empty field that isn't a system/duplicate column.
  const SKIP = new Set([
    'submission_type', 'first_name', 'last_name', 'email', 'phone',
    'initiative_id', 'status', 'form_data', 'page_url', 'source', 'medium',
    'newsletter_opt_in', 'access_key', 'botcheck', 'from_name', 'subject',
    'replyto', 'redirect',
  ])
  const prettify = (k: string) =>
    k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const detailRows = Object.entries(d)
    .filter(([k, v]) => !SKIP.has(k) && v !== null && v !== undefined && String(v).trim() !== '')
    .map(([k, v]) => row(prettify(k), esc(v)))
    .join('')

  const fullName = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#191615;max-width:680px;margin:0 auto;">
      <div style="background:${NAVY2};border-radius:12px 12px 0 0;padding:24px 32px;">
        <h1 style="color:${ACCENT};margin:0;font-size:18px;letter-spacing:1px;">SPN — New ${escapeHtml(label)} Submission</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">Submission #${esc(params.submissionId)} received from the SPN website</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:32px;">
        <p style="margin:0 0 20px;"><a href="${dashboardUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:14px;">Review in Dashboard</a></p>
        <h3 style="color:${NAVY};border-bottom:2px solid ${ACCENT};padding-bottom:6px;margin-bottom:0;">Contact</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row('Type', escapeHtml(label))}
          ${row('Name', esc(fullName))}
          ${row('Email', esc(d.email))}
          ${row('Phone', esc(d.phone))}
          ${row('Newsletter opt-in', d.newsletter_opt_in ? 'Yes' : 'No')}
        </table>
        <h3 style="color:${NAVY};border-bottom:2px solid ${ACCENT};padding-bottom:6px;margin-bottom:0;">Details</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${detailRows || row('—', 'No additional fields')}
        </table>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: SPN_SYSTEM_FROM,
      to: SPN_INTERNAL_EMAIL,
      replyTo: d.email ? String(d.email) : undefined,
      subject: `New SPN ${label} submission — ${escapeHtml(fullName)} (#${esc(params.submissionId)})`,
      html,
    })
    console.log('[SPN Email] Internal notification sent for submission #' + params.submissionId)
    return true
  } catch (err) {
    console.error('[SPN Email] Failed to send internal notification:', err)
    return false
  }
}
