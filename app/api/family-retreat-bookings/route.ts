import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const NOTIFICATION_EMAIL =
  process.env.FAMILY_RETREAT_NOTIFICATION_EMAIL || 'TheSikhFI@devanhaar.com'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'family-retreat-bookings', methods: ['POST'] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone',
      'city', 'postcode', 'country',
      'emergency_contact_name', 'emergency_contact_relationship',
      'emergency_contact_phone', 'heard_about_retreat',
    ]
    const missing = requiredFields.filter((f) => !body[f]?.toString().trim())
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!Array.isArray(body.children) || body.children.length === 0) {
      return NextResponse.json(
        { error: 'Please add at least one child attending' },
        { status: 400 }
      )
    }

    for (const child of body.children) {
      if (!child.first_name?.trim() || !child.last_name?.trim() || !child.date_of_birth) {
        return NextResponse.json(
          { error: 'Please complete all required fields for each child' },
          { status: 400 }
        )
      }
    }

    if (!body.consent_privacy) {
      return NextResponse.json(
        { error: 'Please accept the privacy policy to continue' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const payload = {
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      city: body.city.trim(),
      postcode: body.postcode.trim(),
      country: body.country.trim(),
      children_attending: body.children,
      accommodation_preference: body.accommodation_preference || null,
      dietary_requirements: body.dietary_requirements?.trim() || null,
      medical_requirements: body.medical_requirements?.trim() || null,
      emergency_contact_name: body.emergency_contact_name.trim(),
      emergency_contact_relationship: body.emergency_contact_relationship.trim(),
      emergency_contact_phone: body.emergency_contact_phone.trim(),
      heard_about_retreat: body.heard_about_retreat,
      additional_notes: body.additional_notes?.trim() || null,
      consent_email: body.consent_email === 'yes',
      consent_whatsapp: body.consent_whatsapp === 'yes',
      page_url: body.page_url?.slice(0, 2048) || null,
      source: body.source?.trim() || null,
      medium: body.medium?.trim() || null,
      status: 'pending',
    }

    const { data, error: dbError } = await supabase
      .from('family_retreat_bookings')
      .insert(payload)
      .select('id')
      .single()

    if (dbError) {
      console.error('[family-retreat-bookings] DB error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save booking. Please try again.' },
        { status: 500 }
      )
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const childrenLines = (body.children as Array<{ first_name: string; last_name: string; date_of_birth: string }>)
          .map((c, i) => `  Child ${i + 1}: ${c.first_name} ${c.last_name} (DOB: ${c.date_of_birth})`)
          .join('\n')
        const textBody = [
          'New Sikh Family Retreat booking request.',
          '',
          `Submission ID : ${data.id}`,
          `Submitted at  : ${new Date().toISOString()}`,
          '',
          '-- Adult contact',
          `Name     : ${payload.first_name} ${payload.last_name}`,
          `Email    : ${payload.email}`,
          `Phone    : ${payload.phone}`,
          `Location : ${payload.city}, ${payload.postcode}, ${payload.country}`,
          '',
          '-- Children attending',
          childrenLines,
          '',
          '-- Accommodation & needs',
          `Accommodation : ${payload.accommodation_preference || 'Not specified'}`,
          `Dietary       : ${payload.dietary_requirements || 'None stated'}`,
          `Medical       : ${payload.medical_requirements || 'None stated'}`,
          '',
          '-- Emergency contact',
          `Name         : ${payload.emergency_contact_name}`,
          `Relationship : ${payload.emergency_contact_relationship}`,
          `Phone        : ${payload.emergency_contact_phone}`,
          '',
          '-- Other',
          `Heard about   : ${payload.heard_about_retreat}`,
          `Notes         : ${payload.additional_notes || 'None'}`,
        ].join('\n')
        await resend.emails.send({
          from: 'Devanhaar <noreply@devanhaar.com>',
          to: NOTIFICATION_EMAIL,
          subject: `Family Retreat booking - ${payload.first_name} ${payload.last_name} (${body.children.length} child${body.children.length !== 1 ? 'ren' : ''})`,
          text: textBody,
        })
      } catch (emailErr) {
        console.warn('[family-retreat-bookings] Notification email failed:', emailErr)
      }
    }

    // Send confirmation email to the submitter
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Sikh Family Retreat <noreply@devanhaar.com>',
          to: payload.email as string,
          subject: 'Your Sikh Family Retreat booking request has been received',
          text: [
            `Dear ${payload.first_name},`,
            '',
            'Thank you for submitting your family\'s booking request for the Sikh Family Retreat.',
            '',
            'Your application is now being processed. A member of the team will be in touch with you shortly to discuss availability, costs and next steps.',
            '',
            'Should you have any questions in the meantime, please do not hesitate to get in touch:',
            '',
            'Email: TheSikhFI@devanhaar.com',
            'Phone / WhatsApp: 07780 334 940',
            '',
            'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!',
            '',
            'Sikh Family Retreat Team',
            'Devanhaar',
          ].join('\n'),
        })
      } catch (confirmEmailErr) {
        console.warn('[family-retreat-bookings] Confirmation email failed:', confirmEmailErr)
      }
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('[family-retreat-bookings] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
