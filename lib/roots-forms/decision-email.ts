import 'server-only'
import { Resend } from 'resend'

export type RootsDecision = 'accepted' | 'declined'
export const rootsFee = 50
export const rootsCheckout = 'https://www.nowdonate.com/checkout/c310lyzo928zs9su12k6'

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export async function sendRootsDecisionEmail(input: {
  reference: string
  revision: number
  to: string
  parentName: string
  childName: string
  decision: RootsDecision
  paid?: boolean
}) {
  if (!process.env.RESEND_API_KEY) throw new Error('Email is not configured.')
  if (!input.to) throw new Error('The parent or guardian email is missing.')
  const accepted = input.decision === 'accepted'
  const message = accepted
    ? `Congratulations! ${input.childName} has been accepted for Roots Residential, from 19th to 21st December 2026.`
    : `Thank you for applying for Roots Residential for ${input.childName}. We are sorry that, after reviewing the application, we are unable to offer a place on this occasion.`
  const paymentUrl = rootsCheckout
  const payment = accepted
    ? input.paid ? 'Your payment is already recorded. No further payment is required.' : `To secure the place, please pay £${rootsFee} using the link below.`
    : ''
  const link = accepted && !input.paid
    ? `<p><a href="${escapeHtml(paymentUrl)}">Pay £${rootsFee} now</a></p><p>Please use application reference ${escapeHtml(input.reference)} when paying.</p>`
    : ''
  const signature = 'Roots Residential Team\nDevanhaar\nRoots@Devanhaar.com | +44 7735 048882'
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'Roots Residential <noreply@devanhaar.com>',
    to: input.to,
    subject: accepted ? 'Congratulations - Roots application accepted' : 'Update on your Roots application',
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto"><h2>${accepted ? 'Congratulations!' : 'Roots application update'}</h2><p>Dear ${escapeHtml(input.parentName)},</p><p>${escapeHtml(message)}</p>${payment ? `<p>${escapeHtml(payment)}</p>` : ''}${link}<p>If you have any questions, please contact <a href="mailto:Roots@Devanhaar.com">Roots@Devanhaar.com</a>.</p><p>${escapeHtml(signature).replace(/\n/g, '<br/>')}</p></div>`,
    text: `Dear ${input.parentName},\n\n${message}\n\n${payment}${accepted && !input.paid ? `\n${paymentUrl}\nApplication reference: ${input.reference}` : ''}\n\n${signature}`,
  }, { idempotencyKey: `roots-decision-${input.reference}-${input.revision}-${input.decision}` })
  if (error || !data?.id) throw new Error('The email provider did not accept the notification.')
  return data.id
}
