import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const nowDonateApiKey = process.env.NOWDONATE_API_KEY || ''
const wolfrunCheckoutId = process.env.WOLFRUN_NOWDONATE_CHECKOUT_ID || process.env.NOWDONATE_CHECKOUT_ID || ''
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function extractNowDonateCheckoutId(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    const checkoutIndex = parts.findIndex((segment) => segment === 'checkout')
    if (checkoutIndex >= 0 && parts[checkoutIndex + 1]) {
      return parts[checkoutIndex + 1]
    }
  } catch {
    return ''
  }

  return ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fundraiser_slug, amount, donor_name, donor_email, gift_aid, message } = body

    if (!fundraiser_slug || !amount || !donor_name?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: fundraiser_slug, amount, donor_name' },
        { status: 400 }
      )
    }

    const donationAmount = Number(amount)
    if (isNaN(donationAmount) || donationAmount < 5 || donationAmount > 10000) {
      return NextResponse.json(
        { error: 'Donation amount must be between £5 and £10,000' },
        { status: 400 }
      )
    }

    const checkoutId = extractNowDonateCheckoutId(wolfrunCheckoutId)
    if (!nowDonateApiKey && !checkoutId) {
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Look up the fundraiser
    const { data: fundraiser, error: fundraiserError } = await supabase
      .from('wolfrun_fundraisers')
      .select('id, first_name, last_name, slug')
      .eq('slug', fundraiser_slug)
      .eq('status', 'active')
      .maybeSingle()

    if (fundraiserError || !fundraiser) {
      return NextResponse.json({ error: 'Fundraiser not found' }, { status: 404 })
    }

    // Insert pending donation record
    const { data: donation, error: donationError } = await supabase
      .from('wolfrun_donations')
      .insert({
        fundraiser_id: fundraiser.id,
        donor_name: donor_name.trim(),
        donor_email: donor_email?.trim().toLowerCase() || null,
        amount: Math.round(donationAmount * 100), // Store in pence
        gift_aid: !!gift_aid,
        message: message?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (donationError || !donation) {
      console.error('[Wolf Run Donate] Supabase error:', donationError)
      return NextResponse.json({ error: 'Failed to create donation. Please try again.' }, { status: 500 })
    }

    // Create DonationManager checkout URL
    const donationRef = `wolfrun_donation:${donation.id}`
    const fundraiserPage = `${siteUrl}/events/wolfrun/fundraiser/${fundraiser.slug}`

    if (checkoutId) {
      const checkoutUrl = new URL(`https://www.nowdonate.com/checkout/${checkoutId}`)
      checkoutUrl.searchParams.set('amount', String(donationAmount))
      checkoutUrl.searchParams.set('repeat', 'o')
      checkoutUrl.searchParams.set('giftaid', gift_aid ? 'true' : 'false')
      checkoutUrl.searchParams.set('reference', donationRef)
      checkoutUrl.searchParams.set('custom', donationRef)
      if (donor_email?.trim()) {
        checkoutUrl.searchParams.set('prefilled_email', donor_email.trim().toLowerCase())
      }
      checkoutUrl.searchParams.set('success_url', `${fundraiserPage}?donated=true`)
      checkoutUrl.searchParams.set('cancel_url', `${fundraiserPage}?donated=false`)

      await supabase
        .from('wolfrun_donations')
        .update({ status: 'redirected' })
        .eq('id', donation.id)

      await supabase.from('activity_log').insert({
        action: 'Wolf Run donation redirected to DonationManager',
        entity_type: 'wolfrun_donation',
        entity_id: donation.id,
        metadata: {
          fundraiser_id: fundraiser.id,
          fundraiser_name: `${fundraiser.first_name} ${fundraiser.last_name}`,
          donor_name: donor_name.trim(),
          amount: donationAmount,
          gift_aid: !!gift_aid,
          mode: 'direct_checkout_id',
        },
      })

      return NextResponse.json({
        success: true,
        checkout_url: checkoutUrl.toString(),
      })
    }

    const params = new URLSearchParams({
      key: nowDonateApiKey,
      currency: 'GBP',
      amount: String(donationAmount),
      repeat: 'o',
      giftaid: gift_aid ? 'true' : 'false',
      reference: donationRef,
      custom: donationRef,
      prefilled_email: donor_email?.trim().toLowerCase() || '',
      success_url: `${fundraiserPage}?donated=true`,
      cancel_url: `${fundraiserPage}?donated=false`,
      comment: `Wolf Run 5K - Sponsoring ${fundraiser.first_name} ${fundraiser.last_name} - from ${donor_name.trim()}`,
    })

    const dmUrl = 'https://www.donationmanager.co.uk/services/api/checkout/?' + params.toString()
    const dmRes = await fetch(dmUrl)
    const dmData = await dmRes.json()

    if (dmData.status !== 'success' || !dmData.url) {
      // Mark donation as failed if DonationManager rejects
      await supabase
        .from('wolfrun_donations')
        .update({ status: 'failed' })
        .eq('id', donation.id)
      return NextResponse.json(
        { error: 'Unable to create checkout session' },
        { status: 502 }
      )
    }

    // Update donation with DonationManager reference
    await supabase
      .from('wolfrun_donations')
      .update({ status: 'redirected' })
      .eq('id', donation.id)

    // Log activity
    await supabase.from('activity_log').insert({
      action: 'Wolf Run donation redirected to DonationManager',
      entity_type: 'wolfrun_donation',
      entity_id: donation.id,
      metadata: {
        fundraiser_id: fundraiser.id,
        fundraiser_name: `${fundraiser.first_name} ${fundraiser.last_name}`,
        donor_name: donor_name.trim(),
        amount: donationAmount,
        gift_aid: !!gift_aid,
      },
    })

    return NextResponse.json({
      success: true,
      checkout_url: dmData.url,
    })
  } catch (error) {
    console.error('[Wolf Run Donate] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
