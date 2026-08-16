const PADEL_FROM_EMAIL = 'Sikh Padel Association <noreply@devanhaar.com>'
const PADEL_EVENT_DETAILS = '6 September, 11am–5pm, Wellness Suite, Rocket Padel, 2 The Drive, Ilford IG1 3PS'

function escapeHtml(value: string | null | undefined): string {
  const str = value == null ? '' : String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function shell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top:24px;">Sat Sri Akal,</p>
      <p><strong>Sikh Padel Association</strong><br/>Devanhaar</p>
    </div>
  `
}

export async function sendPadelPaymentPendingEmail(params: {
  to: string
  firstName: string
  teamName: string
  resumeUrl: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Padel Email] Skipping payment-pending email - RESEND_API_KEY not configured')
    return false
  }
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const team = escapeHtml(params.teamName)
  const html = shell('Team registered — payment required', `
    <p>Dear ${name},</p>
    <p>Your team <strong>${team}</strong> has been registered for the Sikh Padel Association tournament. To secure your place, please complete your entry fee payment using the link below.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${params.resumeUrl}" style="display:inline-block;background:#92400e;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Complete payment</a>
    </p>
    <p>This link is personal to you and will always work — if the payment page has expired it will automatically open a fresh one.</p>
  `)
  const text = `Team registered — payment required

Dear ${params.firstName},

Your team ${params.teamName} has been registered. To secure your place, please complete your entry fee payment:

${params.resumeUrl}

Sat Sri Akal,
Sikh Padel Association
Devanhaar`
  try {
    await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Complete your Sikh Padel Association team entry', html, text })
    return true
  } catch (err) {
    console.error('[Padel Email] payment-pending send failed:', err)
    return false
  }
}

export async function sendPadelRegistrationReceivedEmail(params: {
  to: string
  firstName: string
  teamName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const team = escapeHtml(params.teamName)
  const html = shell('Team registration received', `
    <p>Dear ${name},</p>
    <p>Thank you for registering your team <strong>${team}</strong> for the Sikh Padel Association. The team will be in touch with next steps, including payment instructions.</p>
  `)
  try {
    await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — registration received', html })
    return true
  } catch (err) {
    console.error('[Padel Email] received send failed:', err)
    return false
  }
}

export async function sendPadelRegistrationApprovedEmail(params: {
  to: string
  firstName: string
  teamName?: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const team = escapeHtml(params.teamName || 'your team')
  const html = shell('Your place is confirmed', `
    <p>Dear ${name},</p>
    <p>Great news — <strong>${team}</strong> is confirmed for the Sikh Padel Association tournament. Your entry fee payment has been completed.</p>
    <p>Your event details are <strong>${PADEL_EVENT_DETAILS}</strong>.</p>
  `)
  try {
    await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — your place is confirmed', html })
    return true
  } catch (err) {
    console.error('[Padel Email] approved send failed:', err)
    return false
  }
}

export async function sendPadelRegistrationDeclinedEmail(params: {
  to: string
  firstName: string
  teamName?: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const html = shell('Registration update', `
    <p>Dear ${name},</p>
    <p>Thank you for your interest in the Sikh Padel Association. Unfortunately we are unable to confirm your team's place on this occasion, and any held payment has been released.</p>
    <p>We would love to see you at a future event.</p>
  `)
  try {
    await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — registration update', html })
    return true
  } catch (err) {
    console.error('[Padel Email] declined send failed:', err)
    return false
  }
}

export async function sendPadelRegistrationUnderReviewEmail(params: {
  to: string
  firstName: string
  teamName?: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const team = escapeHtml(params.teamName || 'your team')
  const html = shell('Payment received — under review', `
    <p>Dear ${name},</p>
    <p>We have received the entry fee for <strong>${team}</strong>. Your payment is being held securely while the team confirms places. You will receive a confirmation email once your place is secured.</p>
  `)
  try {
    await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — payment received', html })
    return true
  } catch (err) {
    console.error('[Padel Email] under-review send failed:', err)
    return false
  }
}

export async function sendPadelRegistrationOwnerNotification(params: {
  registrationId: string
  payload: Record<string, unknown>
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const adminEmail =
    process.env.PADEL_OWNER_NOTIFICATION_EMAIL ||
    process.env.CAMP_OWNER_NOTIFICATION_EMAIL ||
    'info@devanhaar.com'
  const p = params.payload as Record<string, string>
  const rows = [
    ['Player', `${p.captain_first_name ?? ''} ${p.captain_last_name ?? ''}`],
    ['Date of birth', p.captain_date_of_birth],
    ['Email', p.captain_email],
    ['Mobile', p.captain_phone],
    ['City / Country', p.city_country],
    ['Playtomic ID', p.playtomic_id],
    ['Occupation', p.occupation],
    ['Form of ID', p.id_document_type],
    ['ID document', p.id_document_url],
    ['Partner', `${p.player2_first_name ?? ''} ${p.player2_last_name ?? ''}`],
    ['Partner date of birth', p.player2_date_of_birth],
    ['Registration ID', params.registrationId],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(k)}</td><td><strong>${escapeHtml(v || '—')}</strong></td></tr>`
    )
    .join('')
  const html = `
    <div style="font-family:sans-serif;font-size:14px;">
      <p>A new padel registration has been received.</p>
      <table style="border-collapse:collapse;">${rows}</table>
    </div>
  `
  try {
    await resend.emails.send({
      from: 'Devanhaar Alerts <noreply@devanhaar.com>',
      to: adminEmail,
      subject: `New padel registration — ${p.captain_first_name ?? ''} ${p.captain_last_name ?? ''}`,
      html,
    })
    return true
  } catch (err) {
    console.error('[Padel Email] owner notification failed:', err)
    return false
  }
}
