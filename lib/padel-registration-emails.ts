const PADEL_FROM_EMAIL = 'Sikh Padel Association <noreply@devanhaar.com>'
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
  resumeUrl?: string
  paymentUrl?: string
  registrationId?: string
  eventName?: string
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
    <p>Your team <strong>${team}</strong> has been registered for ${escapeHtml(params.eventName || 'the Sikh Padel Association tournament')}. Please complete your entry fee using the link below. Registration and payment are recorded separately; the team will confirm your place.</p>
    ${params.registrationId ? `<p>Registration reference: <strong>${escapeHtml(params.registrationId)}</strong>. Keep your payment receipt so the team can match it to your registration.</p>` : ''}
    <p style="text-align:center;margin:28px 0;">
      <a href="${escapeHtml(params.paymentUrl || params.resumeUrl)}" style="display:inline-block;background:#92400e;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Complete payment</a>
    </p>
  `)
  const text = `Team registered — payment required

Dear ${params.firstName},

Your team ${params.teamName} has been registered for ${params.eventName || 'the Sikh Padel Association tournament'}. Complete your entry fee payment and keep your receipt. Registration reference: ${params.registrationId || 'see your registration'}. Payment and application approval are recorded separately:

${params.paymentUrl || params.resumeUrl}

Sat Sri Akal,
Sikh Padel Association
Devanhaar`
  try {
    const result = await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Complete your Sikh Padel Association team entry', html, text })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
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
    const result = await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — registration received', html })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
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
  paymentVerified?: boolean
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = escapeHtml(params.firstName)
  const team = escapeHtml(params.teamName || 'your team')
  const html = shell(params.paymentVerified ? 'Your place is confirmed' : 'Application approved — payment verification pending', `
    <p>Dear ${name},</p>
    <p>Great news — the application for <strong>${team}</strong> has been approved for the Sikh Padel Association tournament.</p>
    <p>${params.paymentVerified ? 'Your entry fee payment has been verified.' : 'This approval does not confirm payment. If you have already paid, keep your receipt while the team verifies it; otherwise complete the payment using your registration email.'}</p>
    <p>Please refer to the Sikh Padel Association event page for the latest confirmed date, venue and event details.</p>
  `)
  try {
    const result = await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: params.paymentVerified ? 'Sikh Padel Association — your place is confirmed' : 'Sikh Padel Association — application approved, payment verification pending', html })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
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
    <p>Thank you for your interest in the Sikh Padel Association. Unfortunately we are unable to confirm your team's place on this occasion.</p>
    <p>If you have already paid, contact the team with your receipt to discuss the payment. This email does not confirm a refund or release of funds.</p>
    <p>We would love to see you at a future event.</p>
  `)
  try {
    const result = await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — registration update', html })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
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
    const result = await resend.emails.send({ from: PADEL_FROM_EMAIL, to: params.to, subject: 'Sikh Padel Association — payment received', html })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
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
    const result = await resend.emails.send({
      from: 'Devanhaar Alerts <noreply@devanhaar.com>',
      to: adminEmail,
      subject: `New padel registration — ${p.captain_first_name ?? ''} ${p.captain_last_name ?? ''}`,
      html,
    })
    if (result.error) { console.error('[Padel Email] Provider rejected email:', result.error.message); return false }
    return true
  } catch (err) {
    console.error('[Padel Email] owner notification failed:', err)
    return false
  }
}

