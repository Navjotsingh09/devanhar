const VIDYALA_FROM_EMAIL = 'Sikhi Vidyala <vidyala@devanhaar.com>'

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendVidyalaApprovalEmail(params: {
  to: string
  firstName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Vidyala Email] Skipping approval email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <div style="background:#0A1931;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
        <h1 style="color:#F5A623;margin:0;font-size:20px;letter-spacing:1px;">SIKHI VIDYALA</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">by Devanhaar</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:36px;">
        <h2 style="margin:0 0 16px;color:#0A1931;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh</h2>
        <p>Dear <strong>${escapedName}</strong>,</p>
        <p>We are delighted to inform you that your application for the <strong>Sikhi Vidyala</strong> has been <span style="color:#059669;font-weight:bold;">approved</span>.</p>
        <p>Our team will be in touch shortly with further details about the programme, schedule, and next steps.</p>
        <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:4px;padding:16px;margin:24px 0;">
          <p style="margin:0;color:#065f46;font-weight:600;">What happens next?</p>
          <ul style="color:#065f46;font-size:14px;margin:8px 0 0;padding-left:20px;">
            <li>You will receive further details about the Vidyala programme shortly</li>
            <li>Keep an eye on your inbox for important updates</li>
            <li>If you have any questions, reply to this email</li>
          </ul>
        </div>
        <p style="text-align:center;margin:24px 0;">
          <a href="https://devanhaar.com/initiatives/sikhi-vidyala" style="display:inline-block;background:#F5A623;color:#0A1931;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">View Vidyala Programme</a>
        </p>
        <p>If you have any questions, please reply to this email or contact us at <a href="mailto:vidyala@devanhaar.com">vidyala@devanhaar.com</a>.</p>
        <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh<br/><strong>Sikhi Vidyala Team</strong><br/>Devanhaar</p>
      </div>
    </div>
  `

  const text = `Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh

Dear ${params.firstName},

We are delighted to inform you that your application for the Sikhi Vidyala has been approved.

Our team will be in touch shortly with further details about the programme, schedule, and next steps.

If you have any questions, please reply to this email or contact us at vidyala@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh
Sikhi Vidyala Team
Devanhaar`

  try {
    await resend.emails.send({
      from: VIDYALA_FROM_EMAIL,
      to: params.to,
      subject: 'Your Sikhi Vidyala Application Has Been Approved',
      html,
      text,
    })
    console.log('[Vidyala Email] Approval email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Vidyala Email] Failed to send approval email:', err)
    return false
  }
}

export async function sendVidyalaDeclineEmail(params: {
  to: string
  firstName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Vidyala Email] Skipping decline email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <div style="background:#0A1931;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
        <h1 style="color:#F5A623;margin:0;font-size:20px;letter-spacing:1px;">SIKHI VIDYALA</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">by Devanhaar</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:36px;">
        <h2 style="margin:0 0 16px;color:#0A1931;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh</h2>
        <p>Dear <strong>${escapedName}</strong>,</p>
        <p>Thank you for applying to the <strong>Sikhi Vidyala</strong>. After careful consideration, we are sorry to inform you that on this occasion your application has not been successful.</p>
        <p>We received many applications and the decision was not an easy one. We encourage you to continue your journey of Sikhi and look out for future Vidyala cohorts.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="https://devanhaar.com/initiatives" style="display:inline-block;background:#0A1931;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">View Other Initiatives</a>
        </p>
        <p>If you have any questions, please reply to this email or contact us at <a href="mailto:vidyala@devanhaar.com">vidyala@devanhaar.com</a>.</p>
        <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh<br/><strong>Sikhi Vidyala Team</strong><br/>Devanhaar</p>
      </div>
    </div>
  `

  const text = `Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh

Dear ${params.firstName},

Thank you for applying to the Sikhi Vidyala. After careful consideration, we are sorry to inform you that on this occasion your application has not been successful.

We received many applications and the decision was not an easy one. We encourage you to continue your journey of Sikhi and look out for future Vidyala cohorts.

If you have any questions, please reply to this email or contact us at vidyala@devanhaar.com.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh
Sikhi Vidyala Team
Devanhaar`

  try {
    await resend.emails.send({
      from: VIDYALA_FROM_EMAIL,
      to: params.to,
      subject: 'Update on Your Sikhi Vidyala Application',
      html,
      text,
    })
    console.log('[Vidyala Email] Decline email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Vidyala Email] Failed to send decline email:', err)
    return false
  }
}
