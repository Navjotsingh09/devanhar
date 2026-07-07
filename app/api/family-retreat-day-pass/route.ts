import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devanhaar.com'
const DAY_PASS_STRIPE_PRODUCT = process.env.DAY_PASS_STRIPE_PRODUCT || 'prod_Uoi2MLmdfXuV4i'
const ADULT_PRICE_PENCE = 3500   // £35
const CHILD_PRICE_PENCE = 1500   // £15
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DAY_PASS_DATES = ['2026-07-24', '2026-07-25']

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'family-retreat-day-pass' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = ['first_name','last_name','email','phone','city','postcode','country',
      'selected_date','emergency_contact_name','emergency_contact_relationship','emergency_contact_phone']
    const missing = required.filter((f) => !body[f]?.toString().trim())
    if (missing.length > 0)
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })

    if (!EMAIL_REGEX.test(body.email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })

    if (!DAY_PASS_DATES.includes(body.selected_date))
      return NextResponse.json({ error: 'Invalid date selected' }, { status: 400 })

    const numAdults = parseInt(body.num_adults) || 0
    if (numAdults < 1)
      return NextResponse.json({ error: 'At least 1 adult is required' }, { status: 400 })

    const children: Array<{ first_name: string; last_name: string; date_of_birth: string }> = Array.isArray(body.children) ? body.children : []
    for (const c of children) {
      if (!c.first_name?.trim() || !c.last_name?.trim() || !c.date_of_birth)
        return NextResponse.json({ error: 'Please complete all fields for each child' }, { status: 400 })
    }

    if (!body.consent_privacy)
      return NextResponse.json({ error: 'Please accept the privacy policy to continue' }, { status: 400 })

    const amountPence = numAdults * ADULT_PRICE_PENCE + children.length * CHILD_PRICE_PENCE
    const supabase = getSupabaseAdmin()

    // Insert booking (unpaid initially)
    const payload = {
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      city: body.city.trim(),
      postcode: body.postcode.trim(),
      country: body.country.trim(),
      selected_date: body.selected_date,
      num_adults: numAdults,
      children_attending: children,
      dietary_requirements: body.dietary_requirements?.trim() || null,
      medical_requirements: body.medical_requirements?.trim() || null,
      emergency_contact_name: body.emergency_contact_name.trim(),
      emergency_contact_relationship: body.emergency_contact_relationship.trim(),
      emergency_contact_phone: body.emergency_contact_phone.trim(),
      heard_about_retreat: body.heard_about_retreat || null,
      additional_notes: body.additional_notes?.trim() || null,
      consent_email: body.consent_email === 'yes',
      consent_whatsapp: body.consent_whatsapp === 'yes',
      page_url: body.page_url?.slice(0, 2048) || null,
      source: body.source?.trim() || null,
      medium: body.medium?.trim() || null,
      amount_due: amountPence,
      payment_status: 'unpaid',
    }

    const { data, error: dbError } = await supabase
      .from('family_retreat_day_pass_bookings')
      .insert(payload)
      .select('id')
      .single()

    if (dbError) {
      console.error('[day-pass] DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save booking. Please try again.' }, { status: 500 })
    }

    const bookingId = data.id

    // Create Stripe payment link
    let stripeUrl: string | null = null
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const price = await stripe.prices.create({
          currency: 'gbp',
          unit_amount: amountPence,
          product: DAY_PASS_STRIPE_PRODUCT,
        })
        const link = await stripe.paymentLinks.create({
          line_items: [{ price: price.id, quantity: 1 }],
          metadata: { day_pass_booking_id: bookingId },
          payment_intent_data: { metadata: { day_pass_booking_id: bookingId } },
          after_completion: {
            type: 'redirect',
            redirect: { url: `${SITE_URL}/initiatives/sikh-family-retreat/day-pass?paid=1&session_id={CHECKOUT_SESSION_ID}` },
          },
          restrictions: { completed_sessions: { limit: 1 } },
        })
        stripeUrl = `${link.url}?client_reference_id=${bookingId}&prefilled_email=${encodeURIComponent(body.email.trim().toLowerCase())}`
        // Persist link info
        await supabase.from('family_retreat_day_pass_bookings').update({
          stripe_payment_link: stripeUrl,
          stripe_payment_link_id: link.id,
        }).eq('id', bookingId)
      } catch (stripeErr) {
        console.warn('[day-pass] Stripe link creation failed:', stripeErr)
      }
    }

    return NextResponse.json({ ok: true, bookingId, stripeUrl, amount: amountPence })
  } catch (err) {
    console.error('[day-pass] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
