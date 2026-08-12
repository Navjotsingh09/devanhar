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

    // Keep a runner row ready, then mark as confirmed when webhook notifies payment completion.
    const normalizedEmail = email.trim().toLowerCase()
    const { data: existingRunner, error: existingRunnerError } = await supabase
      .from('wolfrun_runners')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingRunnerError) {
      console.error('[Wolf Run Checkout] Supabase lookup error:', existingRunnerError)
      return NextResponse.json({ error: 'Unable to create checkout right now. Please try again.' }, { status: 500 })
    }

    if (existingRunner?.status === 'confirmed') {
      return NextResponse.json({ error: 'This email is already registered for Wolf Run.' }, { status: 409 })
    }

    let runnerId = existingRunner?.id as string | undefined

    if (runnerId) {
      const { error: updateError } = await supabase
        .from('wolfrun_runners')
        .update({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone: phone.trim(),
          age: ageNum,
          city: city.trim(),
          pack,
          agree_whatsapp_group: Boolean(agree_whatsapp_group),
          status: 'failed',
          stripe_session_id: null,
          stripe_payment_intent_id: null,
        })
        .eq('id', runnerId)

      if (updateError) {
        console.error('[Wolf Run Checkout] Supabase update error:', updateError)
        return NextResponse.json({ error: 'Unable to create checkout right now. Please try again.' }, { status: 500 })
      }
    } else {
      const { data: insertedRunner, error: insertError } = await supabase
        .from('wolfrun_runners')
        .insert({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          age: ageNum,
          city: city.trim(),
          pack,
          agree_whatsapp_group: Boolean(agree_whatsapp_group),
          status: 'failed',
        })
        .select('id')
        .single()

      if (insertError || !insertedRunner) {
        console.error('[Wolf Run Checkout] Supabase insert error:', insertError)
        return NextResponse.json({ error: 'Unable to create checkout right now. Please try again.' }, { status: 500 })
      }

      runnerId = insertedRunner.id
    }

    const customReference = `wolfrun_runner:${runnerId}`
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
