import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendPadelRegistrationOwnerNotification } from '@/lib/padel-registration-emails'
import { sendPadelPaymentPendingEmail, sendPadelRegistrationReceivedEmail } from '@/lib/padel-registration-emails'
import { signPadelResumeToken } from '@/lib/padel-resume-token'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
// Entry fee is per player; a team has two players. Override per-player amount via STRIPE_PADEL_FEE_PER_PERSON_GBP.
const padelFeePerPersonGbp = Number(process.env.STRIPE_PADEL_FEE_PER_PERSON_GBP || '50')
const PADEL_PLAYERS_PER_TEAM = 2
const paymentMode = (process.env.PADEL_PAYMENT_MODE || process.env.CAMP_PAYMENT_MODE || 'stripe').trim().toLowerCase()
const eventName = process.env.PADEL_EVENT_NAME || 'Sikh Padel Association — 4th July'

function isStripePaymentModeEnabled() {
  return paymentMode === 'stripe'
}

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }
  return new Stripe(stripeSecretKey)
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const required = [
      'captain_first_name', 'captain_last_name', 'captain_date_of_birth', 'captain_email', 'captain_phone',
      'city_country', 'playtomic_id', 'occupation', 'id_document_type', 'id_document_url',
      'player2_first_name', 'player2_last_name', 'player2_date_of_birth',
    ]
    const missing = required.filter((field) => {
      const value = body[field]
      if (typeof value === 'string') return value.trim().length === 0
      return !value
    })
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.captain_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: initiative } = await supabase
      .from('initiatives')
      .select('id')
      .eq('slug', body.initiative_slug || 'sikh-padel-association')
      .maybeSingle()

    const phoneNormalized = normalizePhone(body.captain_phone)
    if (phoneNormalized.length >= 7) {
      try {
        const dupeQuery = supabase
          .from('padel_registrations')
          .select('id')
          .eq('captain_phone_normalized', phoneNormalized)
          .not('status', 'in', '("rejected","cancelled","declined")')
        if (initiative?.id) {
          dupeQuery.eq('initiative_id', initiative.id)
        }
        const { data: existing } = await dupeQuery.maybeSingle()
        if (existing) {
          return NextResponse.json(
            { error: 'This mobile number has already been used to register. If you believe this is an error, please contact the team.' },
            { status: 409 }
          )
        }
      } catch {
        // column may not exist yet — skip duplicate check
      }
    }

    const entryFeePence = padelFeePerPersonGbp * PADEL_PLAYERS_PER_TEAM * 100
    const teamLabel = `${String(body.captain_first_name).trim()} & ${String(body.player2_first_name).trim()}`

    const payload: Record<string, unknown> = {
      initiative_id: initiative?.id || null,
      event_name: eventName,
      captain_first_name: body.captain_first_name.trim(),
      captain_last_name: body.captain_last_name.trim(),
      captain_date_of_birth: body.captain_date_of_birth || null,
      captain_email: body.captain_email.trim().toLowerCase(),
      captain_phone: body.captain_phone.trim(),
      captain_phone_normalized: phoneNormalized,
      city_country: body.city_country?.trim() || null,
      playtomic_id: body.playtomic_id?.trim() || null,
      occupation: body.occupation?.trim() || null,
      id_document_type: body.id_document_type?.trim() || null,
      id_document_url: body.id_document_url?.trim() || null,
      player2_first_name: body.player2_first_name.trim(),
      player2_last_name: body.player2_last_name.trim(),
      player2_date_of_birth: body.player2_date_of_birth || null,
      consent_email: body.consent_email === 'yes',
      consent_phone: body.consent_phone === 'yes',
      consent_sms: body.consent_sms === 'yes',
      consent_whatsapp: body.consent_whatsapp === 'yes',
      entry_fee_pence: entryFeePence,
      page_url: typeof body.page_url === 'string' && body.page_url.trim() ? body.page_url.trim().slice(0, 2048) : null,
      source: typeof body.source === 'string' && body.source.trim() ? body.source.trim().slice(0, 255) : null,
      medium: typeof body.medium === 'string' && body.medium.trim() ? body.medium.trim().slice(0, 255) : null,
      status: 'payment_pending',
    }

    const { data, error } = await supabase
      .from('padel_registrations')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[Padel Registration] Supabase insert error:', error)
      if (error.code === '23505' && error.message?.includes('phone')) {
        return NextResponse.json(
          { error: 'This mobile number has already been used to register. If you believe this is an error, please contact the team.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to submit registration. Please try again.' }, { status: 500 })
    }

    sendPadelRegistrationOwnerNotification({
      registrationId: String(data.id),
      payload: { ...body, registration_id: data.id, submitted_at: new Date().toISOString() },
    }).catch((notifyErr) => {
      console.error('[Padel Notification] Failed to send owner email (non-blocking):', notifyErr)
    })

    await supabase.from('activity_log').insert({
      action: 'New padel registration submitted',
      entity_type: 'padel_registration',
      entity_id: data.id,
      metadata: {
        captain: `${body.captain_first_name} ${body.captain_last_name}`,
        partner: `${body.player2_first_name} ${body.player2_last_name}`,
        email: body.captain_email,
      },
    }).then(undefined, () => {})

    if (!isStripePaymentModeEnabled()) {
      sendPadelRegistrationReceivedEmail({
        to: payload.captain_email as string,
        firstName: body.captain_first_name.trim(),
        teamName: teamLabel,
      }).catch(() => {})
      return NextResponse.json(
        {
          success: true,
          payment_mode: 'deferred',
          title: 'Registration received',
          message: 'Your registration has been received. The team will contact you with payment instructions.',
        },
        { status: 201 }
      )
    }

    try {
      const stripe = getStripeClient()
      const initiativePath = `/initiatives/${body.initiative_slug || 'sikh-padel-association'}`
      const returnTo = encodeURIComponent(initiativePath)
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        payment_intent_data: {
          capture_method: 'manual',
          metadata: {
            padel_registration_id: data.id,
          },
        },
        customer_email: payload.captain_email as string,
        customer_creation: 'always',
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: padelFeePerPersonGbp * 100,
              product_data: {
                name: `${eventName} — Entry`,
                description: `Entry fee per player (${PADEL_PLAYERS_PER_TEAM} players)`,
              },
            },
            quantity: PADEL_PLAYERS_PER_TEAM,
          },
        ],
        metadata: {
          padel_registration_id: data.id,
        },
        allow_promotion_codes: true,
        success_url: `${siteUrl}${initiativePath}?payment=success`,
        cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&registrationId=${data.id}&resumeToken=${encodeURIComponent(signPadelResumeToken(String(data.id)))}`,
      })

      try {
        await supabase
          .from('padel_registrations')
          .update({
            stripe_checkout_session_id: session.id,
            stripe_checkout_url: session.url,
            stripe_checkout_expires_at: session.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : null,
            stripe_checkout_amount_pence: entryFeePence,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)
      } catch (persistErr) {
        console.warn('[Padel Registration] Failed to persist Stripe checkout session:', persistErr)
      }

      try {
        await sendPadelPaymentPendingEmail({
          to: payload.captain_email as string,
          firstName: body.captain_first_name.trim(),
          teamName: teamLabel,
          resumeUrl: `${siteUrl}/api/padel-registrations/resume-payment?registration_id=${data.id}&token=${encodeURIComponent(signPadelResumeToken(String(data.id)))}`,
        })
      } catch (emailErr) {
        console.error('[Padel Email] Payment-pending email failed (non-blocking):', emailErr)
      }

      return NextResponse.json({ success: true, payment_mode: 'stripe', checkout_url: session.url }, { status: 201 })
    } catch (stripeError) {
      console.error('[Padel Registration] Stripe checkout creation failed, falling back to deferred:', stripeError)
      sendPadelRegistrationReceivedEmail({
        to: payload.captain_email as string,
        firstName: body.captain_first_name.trim(),
        teamName: teamLabel,
      }).catch(() => {})
      return NextResponse.json(
        {
          success: true,
          payment_mode: 'deferred',
          title: 'Registration received',
          message: 'Your registration has been received. The team will contact you with payment instructions.',
        },
        { status: 201 }
      )
    }
  } catch (err) {
    console.error('[Padel Registration] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
