const CAMP_FROM_EMAIL = 'Singhs Camp UK <singhscampuk@devanhaar.com>'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendApplicationReceivedEmail(params: {
  to: string
  firstName: string
  applicationId: string
}): Promise<boolean> {
  if (\!process.env.RESEND_API_KEY) {
    console.warn('[Camp Email] Skipping application-received email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Thank you for your application, ${escapedName}\!</h2>
      <p>We have received your Singhs Camp UK application.</p>
      <p>Your application has not yet been reviewed. Our team will be in touch with you shortly to arrange payment and confirm next steps.</p>
      <p>If you have any questions in the meantime, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh\!</p>
      <p><strong>Singhs Camp UK Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Thank you for your application, ${params.firstName}\!

We have received your Singhs Camp UK application.

Your application has not yet been reviewed. Our team will be in touch with you shortly to arrange payment and confirm next steps.

If you have any questions in the meantime, please contact us at singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh\!

Singhs Camp UK Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'We have received your Singhs Camp UK application',
      html,
      text,
    })
    console.log('[Camp Email] Application-received email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Camp Email] Failed to send application-received email:', err)
    return false
  }
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
      <p>We have received your Singhs Camp UK application and it is now <strong>under review</strong>.</p>
      <p><strong>What happens next?</strong></p>
      <ul style="line-height:1.8;">
        <li>Our team will review your application carefully.</li>
        <li>If your application is <strong>accepted</strong>, your payment will be captured and you will receive a confirmation email with further details about the camp.</li>
        <li>If your application is <strong>not accepted</strong>, your payment hold will be released in full and you will be notified by email.</li>
      </ul>
      <p>The review process may take a few weeks. If you have any questions in the meantime, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>
      <p><strong>Singhs Camp UK Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Thank you for your application, ${params.firstName}!

We have received your Singhs Camp UK application and it is now under review.

What happens next?
- Our team will review your application carefully.
- If your application is accepted, your payment will be captured and you will receive a confirmation email with further details about the camp.
- If your application is not accepted, your payment hold will be released in full and you will be notified by email.

The review process may take a few weeks. If you have any questions in the meantime, please contact us at singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Singhs Camp UK Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Your Singhs Camp UK Application is Under Review',
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
      <h2 style="margin:0 0 16px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h2>
      <p>Dear ${escapedName},</p>
      <p>We are delighted to let you know that your Singhs Camp UK application has been <strong>approved</strong>.</p>
      <p>Your donation has been confirmed and your place is now secured. You will receive further details about the camp closer to the date.</p>
      <p style="text-align:center;margin:24px 0;"><a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a> <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a></p>
      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Warm regards,<br/><strong>The Devanhaar Team</strong></p>
    </div>
  `

  const text = `Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Dear ${params.firstName},

We are delighted to let you know that your Singhs Camp UK application has been approved.

Your donation has been confirmed and your place is now secured.

View Our Projects: https://devanhaar.com/projects
Set Up a Donation: https://devanhaar.com/donate

Warm regards,
The Devanhaar Team`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Your Singhs Camp UK Application Has Been Accepted!',
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
      <h2 style="margin:0 0 16px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h2>
      <p>Dear ${escapedName},</p>
      <p>Thank you for applying to Singhs Camp UK. After careful review, we would like to let you know that you have been <strong>placed on the waiting list</strong> for this camp.</p>
      <p>Your payment hold has been <strong>fully released</strong> and no charge has been made. The refund should appear in your account within 5-10 business days.</p>
      <p>If a place becomes available, we will contact you. In the meantime, we encourage you to stay connected with Devanhaar.</p>
      <p style="text-align:center;margin:24px 0;"><a href="https://devanhaar.com/projects" style="display:inline-block;background:#059669;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">View Our Projects</a> <a href="https://devanhaar.com/donate" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:6px;">Set Up a Donation</a></p>
      <p>If you have any questions, please reply to this email or contact us at <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Warm regards,<br/><strong>The Devanhaar Team</strong></p>
    </div>
  `

  const text = `Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Dear ${params.firstName},

Thank you for applying to Singhs Camp UK. After careful review, you have been placed on the waiting list for this camp.

Your payment hold has been fully released and no charge has been made.

View Our Projects: https://devanhaar.com/projects
Set Up a Donation: https://devanhaar.com/donate

Warm regards,
The Devanhaar Team`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Update on Your Singhs Camp UK Application',
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

export async function sendApplicationPaymentReminderEmail(params: {
  to: string
  firstName: string
  resumeUrl: string
  amountGbp?: number
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Camp Email] Skipping payment-reminder email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const escapedName = escapeHtml(params.firstName)
  const escapedUrl = escapeHtml(params.resumeUrl)
  const amountLine = typeof params.amountGbp === 'number' && params.amountGbp > 0
    ? `<p style="margin:0 0 16px;">Outstanding camp fee: <strong>&pound;${params.amountGbp.toFixed(2)}</strong></p>`
    : ''

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Finish your Singhs Camp UK application, ${escapedName}</h2>
      <p>We received your application but could not see a completed payment authorisation. Your spot is not yet held.</p>
      ${amountLine}
      <p style="margin:24px 0;">
        <a href="${escapedUrl}" style="display:inline-block;background:#d29c4a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Complete payment</a>
      </p>
      <p style="font-size:13px;color:#555;">If the button does not work, paste this link into your browser:<br/>${escapedUrl}</p>
      <p>Your card will be authorised but not charged until our team reviews and accepts your application. If you are not accepted, the hold is released in full.</p>
      <p>Need help? Reply to this email or write to <a href="mailto:singhscampuk@devanhaar.com">singhscampuk@devanhaar.com</a>.</p>
      <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</p>
      <p><strong>Singhs Camp UK Team</strong><br/>Devanhaar</p>
    </div>
  `

  const text = `Finish your Singhs Camp UK application, ${params.firstName}

We received your application but could not see a completed payment authorisation. Your spot is not yet held.

${typeof params.amountGbp === 'number' && params.amountGbp > 0 ? `Outstanding camp fee: GBP ${params.amountGbp.toFixed(2)}\n\n` : ''}Complete payment: ${params.resumeUrl}

Your card will be authorised but not charged until our team reviews and accepts your application. If you are not accepted, the hold is released in full.

Need help? Reply to this email or write to singhscampuk@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!

Singhs Camp UK Team
Devanhaar`

  try {
    await resend.emails.send({
      from: CAMP_FROM_EMAIL,
      to: params.to,
      subject: 'Complete your Singhs Camp UK payment to finish your application',
      html,
      text,
    })
    console.log('[Camp Email] Payment reminder email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Camp Email] Failed to send payment reminder email:', err)
    return false
  }
}
