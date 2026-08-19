import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const nowDonateApiKey = process.env.NOWDONATE_API_KEY || ''
const WOLFRUN_CHECKOUT_ID = '16919'
const WOLFRUN_APPEAL_ID = '12903'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, phone, age, city, pack, agree_whatsapp_group, agree_terms } = body

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !phone?.trim() || !age || !city?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!agree_terms) {
      return NextResponse.json({ error: 'You must agree to the Terms & Conditions' }, { status: 400 })
    }

    if (!pack || !['singhs', 'kaurs'].includes(pack)) {
      return NextResponse.json({ error: 'You must choose a pack - Singhs or Kaurs' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const ageNum = Number(age)
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      return NextResponse.json({ error: 'Age must be between 16 and 99' }, { status: 400 })
    }

    if (nowDonateApiKey === '') {
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 })
    }

    const supabase = getSupabaseAdmin()
    const normalizedEmail = email.trim().toLowerCase()

    // Block already-confirmed runners at the form step for immediate feedback
    const { data: confirmed, error: lookupError } = await supabase
      .from('wolfrun_runners')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('status', 'confirmed')
      .maybeSingle()

    if (lookupError) {
      console.error('[Wolf Run Checkout] Supabase lookup error:', lookupError)
      return NextResponse.json({ error: 'Unable to create checkout right now. Please try again.' }, { status: 500 })
    }

    if (confirmed) {
      return NextResponse.json({ error: 'This email is already registered for Wolf Run.' }, { status: 409 })
    }

    // No DB write before payment — form data travels with the checkout reference
    // and the webhook creates the confirmed row only after DonationManager succeeds
    const entryPayload = Buffer.from(JSON.stringify({
      f: first_name.trim(),
      l: last_name.trim(),
      e: normalizedEmail,
      p: phone.trim(),
      a: ageNum,
      c: city.trim(),
      k: pack,
      w: Boolean(agree_whatsapp_group),
    })).toString('base64url')

    const customReference = `wolfrun_entry:${entryPayload}`
    const dmParams = new URLSearchParams({
      key: nowDonateApiKey,
      currency: 'GBP',
      amount: '45',
      repeat: 'o',
      checkout: WOLFRUN_CHECKOUT_ID,
      appeal: WOLFRUN_APPEAL_ID,
      custom: customReference,
      prefilled_email: normalizedEmail,
      comment: `Wolf Run entry fee - ${first_name.trim()} ${last_name.trim()} (${pack})`,
    })
    const dmUrl = 'https://www.donationmanager.co.uk/services/api/checkout/?' + dmParams.toString()
    const dmRes = await fetch(dmUrl)
    const dmData = await dmRes.json()

    if (dmData.status !== 'success' || !dmData.url) {
      return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 502 })
    }

    return NextResponse.json({ url: dmData.url })
  } catch (err) {
    console.error('[Wolf Run Checkout] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
