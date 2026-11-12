import { familyRetreatSignatureLines } from '@/lib/family-retreat-email-signature'
import { isRetreatBookingEvent, isRetreatBookingOpen, RETREAT_BOOKING_EVENTS, RETREAT_ACCOMMODATION, retreatAccommodationLabel, retreatChildAge, retreatChildCounts, retreatReference, retreatSubmittedAt } from '@/lib/family-retreat-booking-details'
import { detectBookingDevice } from '@/lib/booking-device'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const NOTIFICATION_EMAILS = [
  process.env.FAMILY_RETREAT_NOTIFICATION_EMAIL || 'TheSikhFI@devanhaar.com',
  'SikhFI@devanhaar.com',
]

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
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid booking request' }, { status: 400 })
    }
    if (!isRetreatBookingEvent(body.event) || !isRetreatBookingOpen(body.event)) {
      return NextResponse.json({ error: 'Bookings are not open for this retreat.' }, { status: 400 })
    }
    const retreat = RETREAT_BOOKING_EVENTS[body.event]
    const age = typeof body.age === 'string' && /^\d{1,3}$/.test(body.age) ? Number(body.age) : NaN
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      return NextResponse.json({ error: 'Enter the lead adult’s age.' }, { status: 400 })
    }
    if (!['yes', 'no'].includes(body.transport_required)) {
      return NextResponse.json({ error: 'Please tell us whether you require transport.' }, { status: 400 })
    }
    if (!RETREAT_ACCOMMODATION.some((option) => option.value === body.accommodation_preference)) {
      return NextResponse.json({ error: 'Please choose an accommodation option.' }, { status: 400 })
    }

    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone',
      'address', 'city', 'postcode', 'country',
      'emergency_contact_name', 'emergency_contact_relationship',
      'emergency_contact_phone', 'heard_about_retreat',
    ]
    const missing = requiredFields.filter((f) => typeof body[f] !== 'string' || !body[f].trim())
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (body.additional_adults !== undefined && !Array.isArray(body.additional_adults)) {
      return NextResponse.json({ error: 'Please provide the details of additional adults.' }, { status: 400 })
    }
    for (const adult of body.additional_adults ?? []) {
      const adultAge = typeof adult?.age === 'string' && /^\d{1,3}$/.test(adult.age) ? Number(adult.age) : NaN
      if (typeof adult?.first_name !== 'string' || !adult.first_name.trim() ||
        typeof adult?.last_name !== 'string' || !adult.last_name.trim() ||
        !Number.isInteger(adultAge) || adultAge < 18 || adultAge > 120) {
        return NextResponse.json({ error: 'Please provide the name and age of every additional adult.' }, { status: 400 })
      }
    }

    if (!Array.isArray(body.children) || body.children.length > 10) {
      return NextResponse.json(
        { error: 'Please add no more than 10 children or infants.' },
        { status: 400 }
      )
    }

    for (const child of body.children) {
      const childAge = typeof child?.date_of_birth === 'string' ? retreatChildAge(child.date_of_birth) : null
      if (!child || typeof child.first_name !== 'string' || !child.first_name.trim() ||
        typeof child.last_name !== 'string' || !child.last_name.trim() ||
        childAge === null || childAge >= 18) {
        return NextResponse.json(
          { error: 'Please provide the name and valid date of birth of each child or infant under 18.' },
          { status: 400 }
        )
      }
    }

    if (body.children.length > 0 && (!['yes', 'no'].includes(body.guardian) || body.parent_consent !== true)) {
      return NextResponse.json({ error: 'Please answer the guardian question and confirm parent or guardian consent.' }, { status: 400 })
    }

    if (body.consent_privacy !== true) {
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
      children_attending: body.children.map((child: { first_name: string; last_name: string; date_of_birth: string }) => ({
        first_name: child.first_name.trim(),
        last_name: child.last_name.trim(),
        date_of_birth: child.date_of_birth,
      })),
      ...(body.additional_adults === undefined ? {} : {
        adults_attending: [
          { first_name: body.first_name.trim(), last_name: body.last_name.trim(), age },
          ...body.additional_adults.map((adult: { first_name: string; last_name: string; age: string }) => ({
            first_name: adult.first_name.trim(), last_name: adult.last_name.trim(), age: Number(adult.age),
          })),
        ],
      }),
      booking_details: {
        event: body.event,
        title: typeof body.title === 'string' ? body.title.trim().slice(0, 30) : '',
        age,
        address: body.address.trim(),
        guardian_of_all: body.children.length ? body.guardian === 'yes' : null,
        parent_consent: body.children.length ? true : null,
        transport_required: body.transport_required === 'yes',
      },
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
      consent_privacy: true,
      page_url: body.page_url?.slice(0, 2048) || null,
      source: body.source?.trim() || null,
      medium: body.medium?.trim() || null,
      booking_device: detectBookingDevice(request.headers),
      status: 'pending',
    }

    const { data, error: dbError } = await supabase
      .from('family_retreat_bookings')
      .insert(payload)
      .select('id, booking_number, created_at')
      .single()

    if (dbError) {
      console.error('[family-retreat-bookings] DB error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save booking. Please try again.' },
        { status: 500 }
      )
    }

    const reference = retreatReference(data.booking_number)
    const submittedAt = retreatSubmittedAt(data.created_at)
    const yesNo = (value: boolean) => value ? 'Yes' : 'No'

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const childrenLines = payload.children_attending.map((child: { first_name: string; last_name: string; date_of_birth: string }, i: number) =>
          `Child or infant ${i + 1}: ${child.first_name} ${child.last_name} · Age at booking: ${retreatChildAge(child.date_of_birth, new Date(data.created_at))} · Date of birth: ${child.date_of_birth}`
        )
        const counts = retreatChildCounts(payload.children_attending, new Date(data.created_at))
        const adultLines = payload.adults_attending?.slice(1).map((adult: { first_name: string; last_name: string; age: number }, i: number) =>
          `Additional adult ${i + 1}: ${adult.first_name} ${adult.last_name} · Age: ${adult.age}`
        ) ?? []
        const textBody = [
          'New Sikh Family Retreat booking request.',
          `Retreat: ${retreat.title} · ${retreat.date}`,
          `Booking reference: ${reference}`,
          `Submitted at: ${submittedAt} (UK time)`,
          '',
          '-- Adult contact',
          `Title: ${payload.booking_details.title || 'Not provided'}`,
          `Name: ${payload.first_name} ${payload.last_name}`,
          `Email: ${payload.email}`,
          `Age: ${payload.booking_details.age}`,
          `Phone: ${payload.phone}`,
          `Address: ${payload.booking_details.address}, ${payload.city}, ${payload.postcode}, ${payload.country}`,
          `Adults: ${payload.adults_attending?.length ?? 'At least 1; additional adults not recorded'}`,
          ...adultLines,
          '',
          `-- Children aged 2–17: ${counts.children}; infants under 2: ${counts.infants} (at booking)`,
          ...childrenLines,
          ...(payload.children_attending.length ? [
            `Parent or guardian of all children: ${yesNo(payload.booking_details.guardian_of_all === true)}`,
            'Parent or guardian consent declaration: Confirmed',
            ...(payload.booking_details.guardian_of_all ? [] : ['Written permission required before confirming the booking.']),
          ] : []),
          '',
          '-- Accommodation and needs',
          `Accommodation preference: ${retreatAccommodationLabel(payload.accommodation_preference)}`,
          `Dietary needs: ${payload.dietary_requirements || 'None stated'}`,
          `Medical and accessibility needs: ${payload.medical_requirements || 'None stated'}`,
          '',
          '-- Emergency contact',
          `Name: ${payload.emergency_contact_name}`,
          `Relationship: ${payload.emergency_contact_relationship}`,
          `Phone: ${payload.emergency_contact_phone}`,
          '',
          '-- Other',
          `Heard about: ${payload.heard_about_retreat}`,
          `Sikhi journey or seva notes: ${payload.additional_notes || 'None stated'}`,
          `Requires transport: ${yesNo(payload.booking_details.transport_required)}`,
        ].join('\n')
        await resend.emails.send({
          from: 'Devanhaar <noreply@devanhaar.com>',
          to: NOTIFICATION_EMAILS,
          subject: `${reference} · ${retreat.title} booking request`,
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
            'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
            '',
            'Thank you for submitting your booking request for The Sikh Family Initiative: Sikh Family Retreat.',
            '',
            `Retreat: ${retreat.title} · ${retreat.date}`,
            `Booking reference: ${reference}`,
            '',
            'We have received your family\'s details and a sevadaar from the team will now review your form. They will contact you directly to confirm availability, discuss the cost for your family, explain how to make payment and answer any questions you may have.',
            '',
            'Please remember that submitting the booking form does not automatically confirm your family\'s place. Your place will only be confirmed once The Sikh Family Initiative team has contacted you and the next steps have been agreed.',
            '',
            ...(payload.children_attending.length && !payload.booking_details.guardian_of_all ? ['If you are not the parent or guardian of all children listed, the team will need written permission before confirming your booking.', ''] : []),
            'Thank you for your application. We look forward to meeting you.',
            '',
            ...familyRetreatSignatureLines,
          ].join('\n'),
        })
      } catch (confirmEmailErr) {
        console.warn('[family-retreat-bookings] Confirmation email failed:', confirmEmailErr)
      }
    }

    return NextResponse.json({ success: true, reference })
  } catch (err) {
    console.error('[family-retreat-bookings] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
