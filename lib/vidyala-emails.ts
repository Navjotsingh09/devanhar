const VIDYALA_FROM_EMAIL = 'Karnjit Kaur <Karnjit.Kaur@devanhaar.com>'
const VIDYALA_INTERNAL_EMAIL = 'Karnjit.Kaur@devanhaar.com'
const VIDYALA_SYSTEM_FROM = 'Sikhi Vidyala <vidyala@devanhaar.com>'

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

export async function sendVidyalaConfirmationEmail(params: {
  to: string
  firstName: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Vidyala Email] Skipping confirmation email - RESEND_API_KEY not configured')
    return false
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const escapedName = escapeHtml(params.firstName)

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;">
      <div style="background:#1E3461;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
        <img src="https://devanhaar.vercel.app/logos/vidyala-logo.jpg" alt="Sikhi Vidyala" width="90" height="90" style="border-radius:50%;object-fit:cover;display:block;margin:0 auto 16px;" />
        <h1 style="color:#F5A623;margin:0;font-size:20px;letter-spacing:1px;">SIKHI VIDYALA</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">by Devanhaar</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:36px;">
        <h2 style="margin:0 0 16px;color:#1E3461;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh</h2>
        <p>Dear <strong>${escapedName}</strong>,</p>
        <p>Thank you for submitting your application to the <strong>Sikhi Vidyala</strong>. We have received your application and it is now under review.</p>
        <div style="background:#fefce8;border-left:4px solid #F5A623;border-radius:4px;padding:16px;margin:24px 0;">
          <p style="margin:0;color:#78350f;font-weight:600;">What happens next?</p>
          <ul style="color:#78350f;font-size:14px;margin:8px 0 0;padding-left:20px;">
            <li>Applications close on <strong>31st July 2026</strong></li>
            <li>We will review all applications and be in touch with a decision after that date</li>
            <li>If you have any questions in the meantime, reply to this email</li>
          </ul>
        </div>
        <p>If you have any questions, please reply to this email.</p>
        <p style="margin-top:24px;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh<br/><strong>Karnjit Kaur</strong><br/>Sikhi Vidyala, Devanhaar</p>
      </div>
    </div>
  `

  const text = `Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh

Dear ${params.firstName},

Thank you for submitting your application to the Sikhi Vidyala. We have received your application and it is now under review.

Applications close on 31st July 2026. We will review all applications and be in touch with a decision after that date.

If you have any questions, please reply to this email.

Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh
Karnjit Kaur
Sikhi Vidyala, Devanhaar`

  try {
    await resend.emails.send({
      from: VIDYALA_FROM_EMAIL,
      to: params.to,
      replyTo: VIDYALA_INTERNAL_EMAIL,
      subject: 'We\'ve Received Your Sikhi Vidyala Application',
      html,
      text,
    })
    console.log('[Vidyala Email] Confirmation email sent to', params.to)
    return true
  } catch (err) {
    console.error('[Vidyala Email] Failed to send confirmation email:', err)
    return false
  }
}

export async function sendVidyalaInternalNotification(params: {
  applicationId: number
  data: Record<string, unknown>
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const d = params.data
  const esc = (v: unknown) => escapeHtml(String(v ?? '—'))
  const bool = (v: unknown) => v === true || v === 'yes' ? 'Yes' : v === false || v === 'no' ? 'No' : '—'
  const dashboardUrl = `https://devanhaar-git-staging-navjotsingh-5rvdigitals-projects.vercel.app/dashboard/submissions`

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;font-weight:600;color:#1E3461;white-space:nowrap;width:220px;">${label}</td><td style="padding:6px 12px;color:#111;">${value}</td></tr>`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:680px;margin:0 auto;">
      <div style="background:#1E3461;border-radius:12px 12px 0 0;padding:24px 32px;">
        <h1 style="color:#F5A623;margin:0;font-size:18px;letter-spacing:1px;">SIKHI VIDYALA — New Application</h1>
        <p style="color:#ffffff99;margin:8px 0 0;font-size:13px;">Application #${params.applicationId} received</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:32px;">
        <p style="margin:0 0 20px;"><a href="${dashboardUrl}" style="display:inline-block;background:#F5A623;color:#1E3461;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:14px;">View in Dashboard</a></p>
        <h3 style="color:#1E3461;border-bottom:2px solid #F5A623;padding-bottom:6px;margin-bottom:0;">Personal Details</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row('Name', esc(d.first_name) + (d.middle_name ? ' ' + esc(d.middle_name) : '') + ' ' + esc(d.last_name))}
          ${row('Date of Birth', esc(d.date_of_birth))}
          ${row('Email', esc(d.email))}
          ${row('Phone', esc(d.phone))}
          ${row('Address', esc(d.address))}
        </table>
        <h3 style="color:#1E3461;border-bottom:2px solid #F5A623;padding-bottom:6px;margin-bottom:0;">Emergency Contacts</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row('EC1 Name', esc(d.emergency_contact_1_name))}
          ${row('EC1 Relationship', esc(d.emergency_contact_1_relationship))}
          ${row('EC1 Phone', esc(d.emergency_contact_1_phone))}
          ${row('EC2 Name', esc(d.emergency_contact_2_name))}
          ${row('EC2 Relationship', esc(d.emergency_contact_2_relationship))}
          ${row('EC2 Phone', esc(d.emergency_contact_2_phone))}
        </table>
        <h3 style="color:#1E3461;border-bottom:2px solid #F5A623;padding-bottom:6px;margin-bottom:0;">Sikhi &amp; Practical</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${row('Amritdhari', bool(d.is_amritdhari))}
          ${row('Sikhi Journey', esc(d.sikhi_journey))}
          ${row('English Ability', esc(d.english_ability))}
          ${row('Panjabi Ability', esc(d.panjabi_ability))}
          ${row('Can Commit', bool(d.can_commit))}
          ${row('Funding Option', esc(d.funding_option))}
          ${row('Accommodation', esc(d.accommodation_option))}
          ${row('Requires Visa', bool(d.requires_visa))}
          ${row('Requires Visa Support', bool(d.requires_visa_support))}
        </table>
        <h3 style="color:#1E3461;border-bottom:2px solid #F5A623;padding-bottom:6px;margin-bottom:0;">Additional Questions</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${row('Motivation', esc(d.motivation))}
          ${row('Current Seva', esc(d.current_seva))}
          ${row('What to Learn', esc(d.what_to_learn))}
          ${row('Continue Parchaar', esc(d.continue_parchaar))}
          ${row('How Heard', esc(d.how_heard))}
        </table>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: VIDYALA_SYSTEM_FROM,
      to: VIDYALA_INTERNAL_EMAIL,
      subject: `New Vidyala Application — ${esc(d.first_name)} ${esc(d.last_name)} (#${params.applicationId})`,
      html,
    })
    console.log('[Vidyala Email] Internal notification sent for app #' + params.applicationId)
    return true
  } catch (err) {
    console.error('[Vidyala Email] Failed to send internal notification:', err)
    return false
  }
}
