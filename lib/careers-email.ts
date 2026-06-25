import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const CAREERS_EMAIL = process.env.CAREERS_EMAIL || 'contact@devanhaar.com'
const FROM_EMAIL = process.env.CAREERS_FROM_EMAIL || `Devanhaar Careers <${CAREERS_EMAIL}>`
const STAFF_NOTIFY = process.env.CAREERS_NOTIFY_EMAIL || CAREERS_EMAIL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devanhaar.vercel.app'

const baseStyles = `
  body { margin:0; padding:0; background:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; padding:40px 20px; }
  .card { background:white; border-radius:12px; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  h1 { color:#111827; font-size:22px; margin:0 0 16px; }
  p { color:#374151; font-size:15px; line-height:1.6; }
  .muted { color:#6b7280; font-size:13px; }
  .btn { display:inline-block; background:#111827; color:white; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px; }
  .footer { text-align:center; color:#9ca3af; font-size:12px; margin-top:20px; }
`

function shell(inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${baseStyles}</style></head><body><div class="wrap"><div class="card">${inner}</div><p class="footer">Devanhaar. All rights reserved.</p></div></body></html>`
}

export async function sendApplicationConfirmation(opts: {
  to: string
  applicantName: string
  vacancyTitle: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const inner = `
    <p>Dear ${escapeHtml(opts.applicantName)},</p>
    <p>Thank you for your application and for taking the time to express your interest in joining the Devanhaar team.</p>
    <p>Your application has been successfully received and will now be reviewed by our team. If your experience and skills align with the requirements of the role, a member of our team will be in touch regarding the next stages of the process.</p>
    <p>Please note that due to the volume of applications we may receive, we may not be able to provide individual feedback to every applicant.</p>
    <p>Thank you again for your interest in Devanhaar, and we wish you all the best throughout the recruitment process.</p>
    <p style="margin-top:24px;">Kind regards,<br><strong>Devanhaar Team</strong></p>
  `
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      replyTo: CAREERS_EMAIL,
      subject: `We received your application for ${opts.vacancyTitle}`,
      html: shell(inner),
    })
  } catch (e) {
    console.error('[Careers Email] confirmation failed:', e)
  }
}

export async function sendStaffApplicationNotification(opts: {
  applicantName: string
  applicantEmail: string
  vacancyTitle: string
  vacancyId: string
  applicationId: string
  hasCv: boolean
}) {
  if (!process.env.RESEND_API_KEY) return
  const inner = `
    <h1>New application: ${escapeHtml(opts.vacancyTitle)}</h1>
    <p><strong>${escapeHtml(opts.applicantName)}</strong> &lt;${escapeHtml(opts.applicantEmail)}&gt;</p>
    <p class="muted">CV attached: ${opts.hasCv ? 'Yes' : 'No'}</p>
    <p style="margin-top:24px;">
      <a class="btn" href="${SITE_URL}/dashboard/vacancies?app=${opts.applicationId}">Open in dashboard</a>
    </p>
  `
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: STAFF_NOTIFY,
      subject: `New application: ${opts.vacancyTitle} — ${opts.applicantName}`,
      html: shell(inner),
    })
  } catch (e) {
    console.error('[Careers Email] staff notify failed:', e)
  }
}

export async function sendApplicantMessage(opts: {
  to: string
  applicantName: string
  subject: string
  body: string
  vacancyTitle: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'Email service not configured' }
  }
  const safeBody = escapeHtml(opts.body).replace(/\n/g, '<br>')
  const inner = `
    <p>Dear ${escapeHtml(opts.applicantName)},</p>
    <p>${safeBody}</p>
    <p style="margin-top:24px;" class="muted">Regarding: ${escapeHtml(opts.vacancyTitle)}</p>
    <p>You can reply directly to this email.</p>
    <p style="margin-top:16px;">Warm regards,<br><strong>The Devanhaar Team</strong></p>
  `
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      replyTo: CAREERS_EMAIL,
      subject: opts.subject,
      html: shell(inner),
    })
    return { ok: true }
  } catch (e) {
    console.error('[Careers Email] applicant message failed:', e)
    return { ok: false, error: e instanceof Error ? e.message : 'Send failed' }
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
