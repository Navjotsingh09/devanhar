import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendToClickUp } from '@/lib/clickup'
import { sendToMailchimp } from '@/lib/mailchimp'
import { sendCampApplicationOwnerNotification } from '@/lib/camp-application-notifier'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || '199')
const paymentMode = (process.env.CAMP_PAYMENT_MODE || 'stripe').trim().toLowerCase()

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
      'first_name', 'last_name', 'email', 'date_of_birth', 'phone',
      'address_line_1', 'city', 'postcode', 'country',
      'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
      'heard_about_camp', 'first_residential_camp', 'been_to_singhs_camp_before',
      'sikhi_knowledge_level', 'takeaway_from_camp',
      'id_document_url', 'id_document_type',
    ]
    const missing = required.filter((field) => {
      const value = body[field]
      if (typeof value === 'string') return value.trim().length === 0
      return !value && value !== false
    })
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const dob = new Date(body.date_of_birth)
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
    if (age < 16) {
      return NextResponse.json({ error: 'You must be at least 16 years old to apply' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: initiative } = await supabase
      .from('initiatives')
      .select('id')
      .eq('slug', body.initiative_slug || 'singhs-camp')
      .maybeSingle()

    // Duplicate phone check (scoped to same initiative)
    // Wrapped in try/catch — phone_normalized column may not exist until migration is run
    const phoneNormalized = normalizePhone(body.phone)
    if (phoneNormalized.length >= 7) {
      try {
        const dupeQuery = supabase
          .from('camp_applications')
          .select('id')
          .eq('phone_normalized', phoneNormalized)
          .not('status', 'in', '("rejected","cancelled")')
        if (initiative?.id) {
          dupeQuery.eq('initiative_id', initiative.id)
        }
        const { data: existingApp } = await dupeQuery.maybeSingle()
        if (existingApp) {
          return NextResponse.json(
            { error: 'This phone number has already been used for a Singhs Camp application. If you believe this is an error, please contact the team.' },
            { status: 409 }
          )
        }
      } catch {
        // phone_normalized column may not exist yet — skip duplicate check
      }
    }

    const payload = {
      initiative_id: initiative?.id || null,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      date_of_birth: body.date_of_birth,
      age_at_camp: body.age_at_camp ? Number(body.age_at_camp) : null,
      phone: body.phone.trim(),
      university: body.university?.trim() || null,
      occupation: body.occupation?.trim() || null,
      address_line_1: body.address_line_1.trim(),
      address_line_2: body.address_line_2?.trim() || null,
      address_line_3: body.address_line_3?.trim() || null,
      city: body.city.trim(),
      postcode: body.postcode.trim(),
      country: body.country.trim(),
      emergency_contact_name: body.emergency_contact_name.trim(),
      emergency_contact_relationship: body.emergency_contact_relationship.trim(),
      emergency_contact_phone: body.emergency_contact_phone.trim(),
      under_18_consent:
        body.under_18_consent === 'yes'
          ? true
          : body.under_18_consent === 'no'
            ? false
            : null,
      dietary_requirements: body.dietary_requirements?.trim() || null,
      medical_requirements: body.medical_requirements?.trim() || null,
      travel_method: body.travel_method || null,
      requires_payment_support: body.requires_payment_support === 'yes',
      room_preference: body.room_preference?.trim() || null,
      heard_about_camp: body.heard_about_camp,
      first_residential_camp: body.first_residential_camp === 'yes',
      previous_camps: body.previous_camps?.trim() || null,
      been_to_singhs_camp_before: body.been_to_singhs_camp_before === 'yes',
      sikhi_knowledge_level: body.sikhi_knowledge_level,
      takeaway_from_camp: body.takeaway_from_camp.trim(),
      consent_email: body.consent_email === 'yes',
      consent_phone: body.consent_phone === 'yes',
      consent_sms: body.consent_sms === 'yes',
      id_document_url: body.id_document_url || null,
      status: body.requires_payment_support === 'yes' ? 'payment_support_review' : 'payment_pending',
    }

    // Extra columns that require the camp-id-verification migration to have been run
    const migrationColumns = {
      bjj_interest: body.bjj_interest === 'yes',
      bjj_fought_professionally: body.bjj_interest === 'yes' && body.bjj_fought_professionally === 'yes',
      consent_whatsapp: body.consent_whatsapp === 'yes',
      id_document_type: body.id_document_type || null,
      phone_normalized: phoneNormalized,
      allergies: Array.isArray(body.allergies) ? body.allergies.join(', ') : (body.allergies || null),
      carries_epipen: body.carries_epipen === 'yes' ? true : body.carries_epipen === 'no' ? false : null,
      own_transport_type: body.own_transport_type || null,
      payment_support_details: body.payment_support_details?.trim() || null,
    }

    // Try with all columns; if migration hasn't run yet, retry with base columns only
    let insertResult = await supabase
      .from('camp_applications')
      .insert({ ...payload, ...migrationColumns })
      .select('id')
      .single()

    if (insertResult.error && (insertResult.error.message?.includes('column') || insertResult.error.message?.includes('schema cache') || insertResult.error.code === 'PGRST204')) {
      console.warn('[Camp Application] Migration columns not found, retrying with base columns:', insertResult.error.message)
      insertResult = await supabase
        .from('camp_applications')
        .insert(payload)
        .select('id')
        .single()
    }

    const { data, error } = insertResult

    if (error) {
      console.error('[Camp Application] Supabase insert error:', error)
      // Handle unique constraint violation on phone_normalized + initiative_id
      if (error.code === '23505' && error.message?.includes('phone')) {
        return NextResponse.json(
          { error: 'This phone number has already been used for a Singhs Camp application. If you believe this is an error, please contact the team.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 })
    }

    const fullSubmissionPayload: Record<string, unknown> = {
      ...body,
      submission_id: data.id,
      submitted_at: new Date().toISOString(),
      payment_mode: body.requires_payment_support === 'yes'
        ? 'support_review'
        : isStripePaymentModeEnabled() ? 'stripe' : 'deferred',
    }

    sendCampApplicationOwnerNotification({
      submissionId: String(data.id),
      payload: fullSubmissionPayload,
    }).catch((notifyErr) => {
      console.error('[Camp Notification] Failed to send owner email (non-blocking):', notifyErr)
    })

    await supabase.from('activity_log').insert({
      action: 'New camp application submitted',
      entity_type: 'camp_application',
      entity_id: data.id,
      metadata: {
        name: `${body.first_name} ${body.last_name}`,
        email: body.email,
        initiative: body.initiative_slug || 'singhs-camp',
      },
    })

    // Send to Mailchimp (fire-and-forget)
    sendToMailchimp({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      age_at_camp: body.age_at_camp ? Number(body.age_at_camp) : null,
      university: body.university || null,
      occupation: body.occupation || null,
      city: body.city,
      postcode: body.postcode,
      country: body.country,
      initiative_slug: body.initiative_slug || 'singhs-camp',
      status: payload.status,
    }).catch((err) => {
      console.error('[Mailchimp] Failed to upsert contact (non-blocking):', err)
    })

    // Send to ClickUp (fire-and-forget)
    const clickUpPaymentMode = body.requires_payment_support === 'yes'
      ? 'support_review'
      : isStripePaymentModeEnabled() ? 'stripe' : 'deferred'

    sendToClickUp({
      id: data.id,
      initiative_slug: body.initiative_slug || 'singhs-camp',
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      date_of_birth: body.date_of_birth,
      age_at_camp: body.age_at_camp ? Number(body.age_at_camp) : null,
      phone: body.phone,
      university: body.university || null,
      occupation: body.occupation || null,
      address_line_1: body.address_line_1,
      address_line_2: body.address_line_2 || null,
      address_line_3: body.address_line_3 || null,
      city: body.city,
      postcode: body.postcode,
      country: body.country,
      emergency_contact_name: body.emergency_contact_name,
      emergency_contact_relationship: body.emergency_contact_relationship,
      emergency_contact_phone: body.emergency_contact_phone,
      under_18_consent: body.under_18_consent || null,
      dietary_requirements: body.dietary_requirements || null,
      medical_requirements: body.medical_requirements || null,
      allergies: body.allergies || null,
      carries_epipen: body.carries_epipen || null,
      travel_method: body.travel_method || null,
      own_transport_type: body.own_transport_type || null,
      requires_payment_support: body.requires_payment_support || null,
      payment_support_details: body.payment_support_details || null,
      room_preference: body.room_preference || null,
      heard_about_camp: body.heard_about_camp,
      first_residential_camp: body.first_residential_camp,
      been_to_singhs_camp_before: body.been_to_singhs_camp_before,
      previous_camps: body.previous_camps || null,
      sikhi_knowledge_level: body.sikhi_knowledge_level,
      takeaway_from_camp: body.takeaway_from_camp,
      bjj_interest: body.bjj_interest || null,
      bjj_fought_professionally: body.bjj_fought_professionally || null,
      consent_email: body.consent_email || null,
      consent_phone: body.consent_phone || null,
      consent_sms: body.consent_sms || null,
      consent_whatsapp: body.consent_whatsapp || null,
      id_document_url: body.id_document_url || null,
      id_document_type: body.id_document_type || null,
      status: payload.status,
      payment_mode: clickUpPaymentMode,
    }).catch((err) => {
      console.error('[ClickUp] Failed to create task (non-blocking):', err)
    })

    // If payment support requested, skip Stripe
    if (body.requires_payment_support === 'yes') {
      return NextResponse.json(
        {
          success: true,
          payment_mode: 'support_review',
          title: 'Application submitted',
          message: 'Application submitted - payment support request noted. The team will contact you with next steps.',
        },
        { status: 201 }
      )
    }

    if (!isStripePaymentModeEnabled()) {
      await supabase.from('activity_log').insert({
        action: 'Camp application captured without immediate payment',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: 'CAMP_PAYMENT_MODE is not stripe',
          payment_mode: paymentMode,
        },
      })

      return NextResponse.json(
        {
          success: true,
          payment_mode: 'deferred',
          title: 'Application submitted',
          message: 'Application submitted successfully. Payment is temporarily handled offline and the team will contact you with payment instructions.',
        },
        { status: 201 }
      )
    }

    // Create Stripe Checkout session
    try {
      const stripe = getStripeClient()
      const initiativePath = `/initiatives/${body.initiative_slug || 'singhs-camp'}`
      const returnTo = encodeURIComponent(initiativePath)
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        payment_intent_data: {
          capture_method: 'manual',
        },
        customer_email: body.email.trim().toLowerCase(),
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: campFeeGbp * 100,
              product_data: {
                name: 'Singhs Camp Donation',
                description: `Camp application for ${body.first_name} ${body.last_name}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { camp_application_id: data.id },
        success_url: `${siteUrl}${initiativePath}?payment=success`,
        cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}`,
      })

      return NextResponse.json({ success: true, payment_mode: 'stripe', checkout_url: session.url }, { status: 201 })
    } catch (stripeError) {
      console.error('[Camp Application] Stripe checkout creation failed, falling back to deferred payment:', stripeError)

      await supabase.from('activity_log').insert({
        action: 'Camp application captured after Stripe checkout failure',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe checkout error',
          payment_mode: 'deferred',
        },
      })

      return NextResponse.json(
        {
          success: true,
          payment_mode: 'deferred',
          title: 'Application submitted',
          message: 'Application submitted successfully. We could not open online payment right now, so the team will contact you with payment instructions.',
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('[Camp Application] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong. Please try again later." },
      { status: 500 }
    )
  }
}
