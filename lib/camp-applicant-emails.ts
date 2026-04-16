const CAMP_FROM_EMAIL = 'Singhs Camp <singhscampuk@devanhaar.com>'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendApplicationUnderReviewEmail(params: {
  to: string
  firstName: string
  applicationId: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Camp Email] Skipping under-review email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Thank you for your application, ${escapedName}!</h2>
      <p>We have received your Singhs Camp application and it is now <strong>under review</strong>.</p>
      <p><strong>What happens next?</strong></p>
      <ul style="line-height:1.8;">
        <li>Our team will review your application carefully.</li>
        <li>If your application is <strong>accepted</strong>, your payment will be captured and you will receive a confirmation email with further details about the camp.</li>
        <li>If your application is <strong>not accepted</strong>, your payment hold will be released in full and you will be notified by email.</li>
      </ul>
      <p>The review process may take a few days. If you have any questions in the meantime, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>
      <p><strong>Singhs Camp Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Thank you for your application, ${params.firstName}!

We have received your Singhs Camp application and it is now under review.

What happens next?
- Our team will review your application carefully.
- If your application is accepted, your payment will be captured and you will receive a confirmation email with further details about the camp.
- If your application is not accepted, your payment hold will be released in full and you will be notified by email.

The review process may take a few days. If you have any questions in the meantime, please contact us at singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Singhs Camp Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Your Singhs Camp Application is Under Review',
      html,
      text,
    })
    console.log('[Camp Email] Under-review email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Camp Email] Failed to send under-review email:', err)
    return false
  }
}

export async function sendApplicationApprovedEmail(params: {
  to: string
  firstName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Camp Email] Skipping approved email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Congratulations, ${escapedName}!</h2>
      <p>We are pleased to let you know that your Singhs Camp application has been <strong>accepted</strong>.</p>
      <p>Your payment has now been captured. You will receive further details about the camp closer to the date, including location, schedule, and what to bring.</p>
      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>
      <p><strong>Singhs Camp Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Congratulations, ${params.firstName}!

We are pleased to let you know that your Singhs Camp application has been accepted.

Your payment has now been captured. You will receive further details about the camp closer to the date, including location, schedule, and what to bring.

If you have any questions, please contact us at singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Singhs Camp Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Your Singhs Camp Application Has Been Accepted!',
      html,
      text,
    })
    console.log('[Camp Email] Approved email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Camp Email] Failed to send approved email:', err)
    return false
  }
}

export async function sendApplicationDeclinedEmail(params: {
  to: string
  firstName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Camp Email] Skipping declined email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Update on your Singhs Camp Application</h2>
      <p>Dear ${escapedName},</p>
      <p>Thank you for applying to Singhs Camp. After careful review, we regret to inform you that your application has <strong>not been accepted</strong> on this occasion.</p>
      <p>Your payment hold has been <strong>fully released</strong> and no charge has been made. The refund should appear in your account within 5-10 business days.</p>
      <p>We encourage you to apply again in the future. If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>
      <p><strong>Singhs Camp Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Update on your Singhs Camp Application

Dear ${params.firstName},

Thank you for applying to Singhs Camp. After careful review, we regret to inform you that your application has not been accepted on this occasion.

Your payment hold has been fully released and no charge has been made. The refund should appear in your account within 5-10 business days.

We encourage you to apply again in the future. If you have any questions, please contact us at singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Singhs Camp Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Update on Your Singhs Camp Application',
      html,
      text,
    })
    console.log('[Camp Email] Declined email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Camp Email] Failed to send declined email:', err)
    return false
  }
}
