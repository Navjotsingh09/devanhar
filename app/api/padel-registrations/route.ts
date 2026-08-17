import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPadelRegistrationOwnerNotification } from '@/lib/padel-registration-emails'
import { sendPadelPaymentPendingEmail, sendPadelRegistrationReceivedEmail } from '@/lib/padel-registration-emails'
import { signPadelResumeToken } from '@/lib/padel-resume-token'
import { PADEL_EVENT } from '@/components/padel/padel-event'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
// Entry fee is per player; a team has two players. Override per-player amount via STRIPE_PADEL_FEE_PER_PERSON_GBP.
const padelFeePerPersonGbp = Number(process.env.STRIPE_PADEL_FEE_PER_PERSON_GBP || '50')
const PADEL_PLAYERS_PER_TEAM = 2
const eventName = process.env.PADEL_EVENT_NAME || PADEL_EVENT.name

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const required = [
      'captain_first_name', 'captain_last_name', 'captain_date_of_birth', 'captain_email', 'captain_phone',
      'city_country', 'playtomic_id', 'occupation', 'captain_gender',
      'player2_first_name', 'player2_last_name', 'player2_date_of_birth',
      'player2_phone', 'player2_playtomic_id', 'player2_occupation', 'player2_gender',
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
        // Only an already-confirmed (approved) registration blocks a resubmission --
        // a pending/awaiting-payment entry should not permanently lock out the phone number.
        const dupeQuery = supabase
          .from('padel_registrations')
          .select('id')
          .eq('captain_phone_normalized', phoneNormalized)
          .eq('status', 'approved')
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
      captain_gender: body.captain_gender?.trim() || null,
      captain_playtomic_ranking: body.captain_playtomic_ranking?.trim() || null,
      id_document_type: body.id_document_type?.trim() || null,
      id_document_url: body.id_document_url?.trim() || null,
      player2_first_name: body.player2_first_name.trim(),
      player2_last_name: body.player2_last_name.trim(),
      player2_date_of_birth: body.player2_date_of_birth || null,
      player2_phone: body.player2_phone?.trim() || null,
      player2_playtomic_id: body.player2_playtomic_id?.trim() || null,
      player2_occupation: body.player2_occupation?.trim() || null,
      player2_gender: body.player2_gender?.trim() || null,
      player2_playtomic_ranking: body.player2_playtomic_ranking?.trim() || null,
      player2_id_document_type: body.player2_id_document_type?.trim() || null,
      player2_id_document_url: body.player2_id_document_url?.trim() || null,
      consent_email: body.consent_email === true || body.consent_email === 'yes',
      consent_phone: body.consent_phone === true || body.consent_phone === 'yes',
      consent_sms: body.consent_sms === true || body.consent_sms === 'yes',
      consent_whatsapp: body.consent_whatsapp === true || body.consent_whatsapp === 'yes',
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

    // Redirect to NowDonate for payment processing
    const nowDonateUrl = "https://www.nowdonate.com/checkout/63hzpepp0m54p65i54d0"
    
    try {
      await sendPadelPaymentPendingEmail({
        to: payload.captain_email as string,
        firstName: body.captain_first_name.trim(),
        teamName: teamLabel,
        paymentUrl: nowDonateUrl,
      })
    } catch (emailErr) {
      console.error('[Padel Email] Payment-pending email failed (non-blocking):', emailErr)
    }

    return NextResponse.json(
      { 
        success: true, 
        payment_mode: 'donation_manager',
        title: 'Registration received — payment required',
        message: 'Your team registration is complete. Please proceed to complete your entry fee payment.',
        payment_url: nowDonateUrl,
        redirect_url: nowDonateUrl,
      }, 
      { status: 201 }
    )
  } catch (err) {
    console.error('[Padel Registration] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
