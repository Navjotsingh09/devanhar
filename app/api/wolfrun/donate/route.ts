import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

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

    // Create Stripe Checkout session
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Sponsor ${fundraiser.first_name} ${fundraiser.last_name} — Wolf Run for Devanhaar`,
              description: `Sponsoring ${fundraiser.first_name} in the Wolf Run to raise funds for Devanhaar`,
            },
            unit_amount: Math.round(donationAmount * 100), // Stripe expects pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        wolfrun_donation_id: donation.id,
        wolfrun_fundraiser_id: fundraiser.id,
        gift_aid: String(!!gift_aid),
        donor_name: donor_name.trim(),
      },
      success_url: `${siteUrl}/events/wolfrun/fundraiser/${fundraiser.slug}?donated=true`,
      cancel_url: `${siteUrl}/events/wolfrun/fundraiser/${fundraiser.slug}?cancelled=true`,
    })

    // Update donation with stripe session id
    await supabase
      .from('wolfrun_donations')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', donation.id)

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
    })
  } catch (error) {
    console.error('[Wolf Run Donate] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
