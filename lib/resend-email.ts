import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const FROM_EMAIL = 'Singhs Camp <singhscampuk@devanhaar.com>'

export async function sendApprovalEmail(to: string, firstName: string, requiresPaymentSupport = false) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Singhs Camp Application Has Been Approved!',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#1a1a1a;font-size:24px;margin:0;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h1>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Dear <strong>${firstName}</strong>,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">We are delighted to inform you that your application for <strong>Singhs Camp</strong> has been <span style="color:#059669;font-weight:bold;">approved</span>!</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">${requiresPaymentSupport
        ? 'Your application has been reviewed and your place is now confirmed. Our team will be in touch regarding payment arrangements.'
        : 'Your payment of <strong>£199</strong> has been captured and your place is now confirmed.'}</p>
      <div style="background:#ecfdf5;border-left:4px solid #059669;padding:16px;border-radius:4px;margin:24px 0;">
        <p style="color:#065f46;margin:0;font-size:14px;"><strong>What happens next?</strong></p>
        <ul style="color:#065f46;font-size:14px;margin:8px 0 0;padding-left:20px;">
          <li>You will receive further details about the camp closer to the date</li>
          <li>Keep an eye on your inbox for important updates</li>
          <li>If you have any questions, reply to this email</li>
        </ul>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">We look forward to seeing you at Singhs Camp!</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Warm regards,<br><strong>The Devanhaar Team</strong></p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">Devanhaar. All rights reserved.</p>
  </div>
</body>
</html>`,
    })
  } catch (e) {
    console.error('[Resend] Failed to send approval email:', e)
  }
}

export async function sendDeclineEmail(to: string, firstName: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Update on Your Singhs Camp Application',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#1a1a1a;font-size:24px;margin:0;">Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!</h1>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Dear <strong>${firstName}</strong>,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Thank you for your interest in <strong>Singhs Camp</strong>. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Any payment hold on your card has been <strong>released</strong> and you will not be charged.</p>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:24px 0;">
        <p style="color:#92400e;margin:0;font-size:14px;"><strong>Please note:</strong> This decision does not prevent you from applying to future Devanhaar initiatives. We encourage you to stay connected and apply again.</p>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">If you have any questions or would like further information, please do not hesitate to reach out.</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">Warm regards,<br><strong>The Devanhaar Team</strong></p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">Devanhaar. All rights reserved.</p>
  </div>
</body>
</html>`,
    })
  } catch (e) {
    console.error('[Resend] Failed to send decline email:', e)
  }
}
