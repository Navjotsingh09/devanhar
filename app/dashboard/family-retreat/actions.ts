'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createServiceClient(url, key)
}

const FAMILY_RETREAT_PAYMENT_LINK =
  process.env.FAMILY_RETREAT_PAYMENT_LINK || 'https://buy.stripe.com/7sY14pddk8qWdyB1EVbEA02'

const FAMILY_RETREAT_STRIPE_PRODUCT =
  process.env.FAMILY_RETREAT_STRIPE_PRODUCT || 'prod_UliRJAIaHaHO9e'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devanhaar.com'

const SIGNATURE_HTML = ''

async function createExactAmountPaymentLink(
  amountPence: number,
  bookingId: string,
  email: string,
): Promise<{ url: string; id: string } | null> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  try {
    const stripe = new Stripe(key)
    const price = await stripe.prices.create({
      currency: 'gbp',
      unit_amount: amountPence,
      product: FAMILY_RETREAT_STRIPE_PRODUCT,
    })
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { family_retreat_booking_id: bookingId },
      payment_intent_data: { metadata: { family_retreat_booking_id: bookingId } },
      after_completion: {
        type: 'redirect',
        redirect: { url: `${SITE_URL}/initiatives/sikh-family-retreat?paid=1&session_id={CHECKOUT_SESSION_ID}` },
      },
      restrictions: { completed_sessions: { limit: 1 } },
    })
    return {
      url: `${link.url}?client_reference_id=${bookingId}&prefilled_email=${encodeURIComponent(email)}`,
      id: link.id,
    }
  } catch (e) {
    console.warn('[family-retreat] Stripe payment link creation failed:', e)
    return null
  }
}

const TEAM_SIGNATURE = ''

function formatAccommodation(value: string | null | undefined): string {
  if (!value) return 'To be confirmed'
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function updateFamilyRetreatStatus(
  id: string,
  status: string,
  details?: { adults?: string; amount?: string }
) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('family_retreat_bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  if ((status === 'confirmed' || status === 'declined') && process.env.RESEND_API_KEY) {
    try {
      const { data: booking } = await supabase
        .from('family_retreat_bookings')
        .select('first_name, last_name, email, children_attending, accommodation_preference')
        .eq('id', id).single()
      if (booking?.email) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        if (status === 'confirmed') {
          const familyName = `${booking.first_name} ${booking.last_name}`.trim()
          const childrenCount = Array.isArray(booking.children_attending) ? booking.children_attending.length : 0
          const accommodation = formatAccommodation(booking.accommodation_preference as string | null)
          const adults = details?.adults?.trim() || 'To be confirmed'
          const amountRaw = (details?.amount || '').toString().trim().replace(/^\u00a3/, '')
          const amountNumber = parseFloat(amountRaw)
          const hasAmount = !Number.isNaN(amountNumber) && amountNumber > 0
          const amount = hasAmount ? amountRaw : 'To be confirmed'

          let payUrl = `${FAMILY_RETREAT_PAYMENT_LINK}?client_reference_id=${id}&prefilled_email=${encodeURIComponent(booking.email)}`
          let paymentLinkId: string | null = null
          if (hasAmount) {
            const created = await createExactAmountPaymentLink(Math.round(amountNumber * 100), id, booking.email)
            if (created) {
              payUrl = created.url
              paymentLinkId = created.id
            }
          }

          const { error: payErr } = await supabase
            .from('family_retreat_bookings')
            .update({
              amount_due: hasAmount ? amountNumber : null,
              payment_status: 'unpaid',
              stripe_payment_link: payUrl,
              stripe_payment_link_id: paymentLinkId,
            })
            .eq('id', id)
          if (payErr) console.warn('[family-retreat] payment columns update failed (run supabase-family-retreat-payment.sql?):', payErr.message)

          const payButtonLabel = hasAmount ? `Pay \u00a3${amount} now` : 'Pay now'
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Your Sikh Family Retreat booking is confirmed',
            text: [
              `Dear ${booking.first_name},`,
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              'Thank you for your time and for taking our call today. We are pleased to confirm that your family booking has been accepted, subject to the agreed payment being made and received.',
              '',
              'Booking details:',
              '',
              `Family name: ${familyName}`,
              `Number of adults: ${adults}`,
              `Number of children/young people: ${childrenCount}`,
              `Accommodation type: ${accommodation}`,
              `Total amount agreed: \u00a3${amount}`,
              '',
              'To secure your family\'s place, please complete your payment using the secure link below:',
              payUrl,
              '',
              'Please note that your place is only fully secured once payment has been received. If payment has already been made, please accept this email as confirmation of your family\'s place at the retreat.',
              '',
              'Further information, including arrival times, what to bring, accommodation guidance and the retreat programme, will be shared closer to the event.',
              '',
              'We are really looking forward to welcoming your family to the Sikh Family Retreat.',
              '',
              'Warm regards,',
              'The Sikh Family Initiative Team',
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              TEAM_SIGNATURE,
            ].join('\n'),
            html: [
              `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">`,
              `<p>Dear ${booking.first_name},</p>`,
              `<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>`,
              `<p>Thank you for your time and for taking our call today. We are pleased to confirm that your family booking has been accepted, subject to the agreed payment being made and received.</p>`,
              `<p><strong>Booking details</strong><br>Family name: ${familyName}<br>Number of adults: ${adults}<br>Number of children/young people: ${childrenCount}<br>Accommodation type: ${accommodation}<br>Total amount agreed: \u00a3${amount}</p>`,
              `<p>To secure your family&rsquo;s place, please complete your payment using the button below:</p>`,
              `<p style="text-align:center;margin:28px 0"><a href="${payUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px">${payButtonLabel}</a></p>`,
              `<p style="font-size:13px;color:#6b7280">If the button does not work, copy and paste this link into your browser:<br><a href="${payUrl}">${payUrl}</a></p>`,
              `<p>Please note that your place is only fully secured once payment has been received. If payment has already been made, please accept this email as confirmation of your family&rsquo;s place at the retreat.</p>`,
              `<p>Further information, including arrival times, what to bring, accommodation guidance and the retreat programme, will be shared closer to the event.</p>`,
              `<p>We are really looking forward to welcoming your family to the Sikh Family Retreat.</p>`,
              `<p>Warm regards,<br>The Sikh Family Initiative Team</p>`,
              `<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>`,
              SIGNATURE_HTML,
              `</div>`,
            ].join(''),
          })
        } else {
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Update on your Sikh Family Retreat booking request',
            text: [
              `Dear ${booking.first_name},`,
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              'Thank you for your interest in The Sikh Family Initiative: Sikh Family Retreat, and for taking the time to complete the booking form for your family.',
              '',
              'Unfortunately, we are sorry to let you know that we have not been able to secure a place for your family at this retreat. Due to limited accommodation and high interest, we have had to carefully allocate the available spaces, and we are very sorry that we could not accommodate everyone this time.',
              '',
              'We are truly grateful for your interest and would very much like your family to stay connected with The Sikh Family Initiative. We are keen to welcome you to future retreats, family events and programmes as the initiative continues to grow.',
              '',
              'Please do follow The Sikh Family Initiative for updates, future event announcements and further opportunities for families to connect, learn and spend time in sangat:',
              'https://www.instagram.com/thesikhfamilyinitiative',
              '',
              'Thank you again for your understanding and support.',
              '',
              'Warm regards,',
              'The Sikh Family Initiative Team',
              '',
              TEAM_SIGNATURE,
            ].join('\n'),
          })
        }
      }
    } catch (emailErr) {
      console.warn('[family-retreat] Email send failed:', emailErr)
    }
  }

  revalidatePath('/dashboard/family-retreat')
}

export async function updateFamilyRetreatNotes(id: string, notes: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('family_retreat_bookings').update({ internal_notes: notes }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/family-retreat')
}

async function sendFamilyRetreatPaymentReceivedEmail(email: string, firstName: string, amountPaid: number) {
  if (!process.env.RESEND_API_KEY) return
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Sikh Family Retreat <noreply@devanhaar.com>',
    to: email,
    subject: 'Payment received \u2014 your Sikh Family Retreat place is secured',
    text: [
      `Dear ${firstName},`,
      '',
      'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
      '',
      `Thank you \u2014 we are pleased to confirm that we have received your payment of \u00a3${amountPaid.toFixed(2)} for the Sikh Family Retreat. Your family\'s place is now fully secured.`,
      '',
      'We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.',
      '',
      'We are really looking forward to welcoming your family.',
      '',
      'Warm regards,',
      'The Sikh Family Initiative Team',
      '',
      'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
      '',
      TEAM_SIGNATURE,
    ].join('\n'),
    html: [
      `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.6">`,
      `<p>Dear ${firstName},</p>`,
      `<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>`,
      `<p>Thank you &mdash; we are pleased to confirm that we have received your payment of <strong>\u00a3${amountPaid.toFixed(2)}</strong> for the Sikh Family Retreat. Your family&rsquo;s place is now fully secured.</p>`,
      `<p>We will be in touch closer to the event with further information, including arrival times, what to bring, accommodation guidance and the retreat programme.</p>`,
      `<p>We are really looking forward to welcoming your family.</p>`,
      `<p>Warm regards,<br>The Sikh Family Initiative Team</p>`,
      `<p>Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.</p>`,
      SIGNATURE_HTML,
      `</div>`,
    ].join(''),
  })
}

export async function syncFamilyRetreatPayment(id: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { data: booking } = await supabase
    .from('family_retreat_bookings')
    .select('id, email, first_name, payment_status, stripe_payment_link_id')
    .eq('id', id)
    .single()
  if (!booking) throw new Error('Booking not found')
  if (booking.payment_status === 'paid') return { status: 'already_paid' as const }
  if (!booking.stripe_payment_link_id) return { status: 'no_link' as const }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe is not configured')
  const stripe = new Stripe(key)
  const sessions = await stripe.checkout.sessions.list({
    payment_link: booking.stripe_payment_link_id as string,
    limit: 20,
  })
  const paidSession = sessions.data.find(
    (sn) => sn.payment_status === 'paid' || sn.status === 'complete',
  )
  if (!paidSession) return { status: 'not_paid_yet' as const }

  const amountPaid = (paidSession.amount_total ?? 0) / 100
  await supabase
    .from('family_retreat_bookings')
    .update({ payment_status: 'paid', amount_paid: amountPaid, paid_at: new Date().toISOString() })
    .eq('id', booking.id)

  if (booking.email) {
    try {
      await sendFamilyRetreatPaymentReceivedEmail(booking.email as string, (booking.first_name as string) || 'there', amountPaid)
    } catch (e) {
      console.error('[family-retreat] payment-received email failed:', e)
    }
  }

  revalidatePath('/dashboard/family-retreat')
  return { status: 'paid' as const, amount: amountPaid }
}
