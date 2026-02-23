import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const WEBHOOK_SECRET = process.env.DONATIONMANAGER_WEBHOOK_SECRET
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
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-dm-signature')
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await request.json()
    const eventType = payload.event || payload.type
    const supabase = getSupabaseAdmin()

    switch (eventType) {
      case 'donation.completed':
      case 'donation.received': {
        await supabase.from('activity_log').insert({
          action: 'Donation received via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || null,
        })
        break
      }
      case 'donation.recurring': {
        await supabase.from('activity_log').insert({
          action: 'Recurring donation via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || null,
        })
        break
      }
      case 'order.completed':
      case 'shop.order': {
        await supabase.from('activity_log').insert({
          action: 'Shop order completed via DonationManager',
          entity_type: 'shop_webhook',
          entity_id: payload.data?.order_id || payload.id || null,
        })
        break
      }
      case 'order.refunded':
      case 'donation.refunded': {
        await supabase.from('activity_log').insert({
          action: 'Refund processed via DonationManager',
          entity_type: 'refund_webhook',
          entity_id: payload.data?.reference || payload.id || null,
        })
        break
      }
      default: {
        await supabase.from('activity_log').insert({
          action: 'DonationManager webhook: ' + (eventType || 'unknown'),
          entity_type: 'webhook',
          entity_id: payload.id || null,
        })
      }
    }

    return NextResponse.json({ received: true, event: eventType })
  } catch (error) {
    console.error('[DonationManager Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/donationmanager',
    provider: 'donationmanager.co.uk',
    events: [
      'donation.completed',
      'donation.received',
      'donation.recurring',
      'donation.refunded',
      'order.completed',
      'shop.order',
      'order.refunded',
    ],
  })
}
