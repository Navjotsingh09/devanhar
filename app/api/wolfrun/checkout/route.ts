import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }
  return new Stripe(stripeSecretKey)
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
      return NextResponse.json({ error: 'You must choose a pack — Singhs or Kaurs' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const ageNum = Number(age)
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      return NextResponse.json({ error: 'Age must be between 16 and 99' }, { status: 400 })
    }

    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: 4500,
            product: 'prod_UN5JNVs8PdC1bk',
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'wolfrun_entry',
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        age: String(ageNum),
        city: city.trim(),
        pack: pack,
        agree_whatsapp_group: agree_whatsapp_group ? 'true' : 'false',
      },
      success_url: `${siteUrl}/events/wolfrun?payment=success`,
      cancel_url: `${siteUrl}/events/wolfrun?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Wolf Run Checkout] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
