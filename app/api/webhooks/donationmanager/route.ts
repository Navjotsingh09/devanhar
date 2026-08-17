import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPadelRegistrationApprovedEmail } from '@/lib/padel-registration-emails'

const WEBHOOK_SECRET = process.env.DONATIONMANAGER_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function getReference(payload: any): string {
  const raw =
    payload?.reference ??
    payload?.custom ??
    payload?.data?.reference ??
    payload?.data?.custom ??
    payload?.donation?.reference ??
    payload?.donation?.custom ??
    ''
  return typeof raw === 'string' ? raw.trim() : ''
}

function getDonationEventType(payload: any): string {
  return normalize(payload?.event || payload?.type)
}

function getDonationObject(payload: any): string {
  return normalize(payload?.object)
}

function isCancelledDonation(payload: any): boolean {
  const donationCancelled = payload?.donation?.cancelled
  if (typeof donationCancelled === 'boolean') return donationCancelled
  const eventType = getDonationEventType(payload)
  return eventType === 'donation.refunded' || eventType === 'order.refunded'
}

function isCompletedDonation(payload: any): boolean {
  const eventType = getDonationEventType(payload)
  if (eventType === 'donation.completed' || eventType === 'donation.received' || eventType === 'donation.recurring') {
    return true
  }

  if (getDonationObject(payload) === 'donation') {
    return !isCancelledDonation(payload)
  }

  return false
}

function extractIdFromReference(reference: string, prefix: string): string | null {
  if (!reference.startsWith(prefix)) return null
  const id = reference.slice(prefix.length).trim()
  return id || null
}

async function recalcFundraiserTotalRaised(supabase: ReturnType<typeof getSupabaseAdmin>, fundraiserId: string) {
  const { data: completedRows, error: sumError } = await supabase
    .from('wolfrun_donations')
    .select('amount')
    .eq('fundraiser_id', fundraiserId)
    .eq('status', 'completed')

  if (sumError) {
    console.error('[DonationManager Webhook] Failed to recalc fundraiser total:', sumError)
    return
  }

  const totalRaised = (completedRows || []).reduce((sum, row) => sum + (row.amount || 0), 0)

  const { error: updateError } = await supabase
    .from('wolfrun_fundraisers')
    .update({ total_raised: totalRaised })
    .eq('id', fundraiserId)

  if (updateError) {
    console.error('[DonationManager Webhook] Failed to update fundraiser total:', updateError)
  }
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
    const reference = getReference(payload)

    // Wolf Run entry payment reconciliation
    const runnerId = extractIdFromReference(reference, 'wolfrun_runner:')
    if (runnerId) {
      const runnerStatus = isCompletedDonation(payload) ? 'confirmed' : isCancelledDonation(payload) ? 'failed' : null
      if (runnerStatus) {
        await supabase
          .from('wolfrun_runners')
          .update({
            status: runnerStatus,
            stripe_session_id: payload?.donation?.id || payload?.donation_id || payload?.id || reference,
          })
          .eq('id', runnerId)
      }
    }

    // Sikh Padel Association: auto-confirm a team once their entry fee donation completes
    const padelRegistrationId = extractIdFromReference(reference, 'padel_registration:')
    if (padelRegistrationId && isCompletedDonation(payload)) {
      const { data: reg, error: regFetchError } = await supabase
        .from('padel_registrations')
        .select('id, status, captain_email, captain_first_name, player2_first_name')
        .eq('id', padelRegistrationId)
        .maybeSingle()

      if (regFetchError) {
        console.error('[DonationManager Webhook] Failed to fetch padel registration:', regFetchError)
      } else if (reg && reg.status !== 'approved') {
        const { error: regUpdateError } = await supabase
          .from('padel_registrations')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', padelRegistrationId)

        if (regUpdateError) {
          console.error('[DonationManager Webhook] Failed to approve padel registration:', regUpdateError)
        } else {
          await supabase.from('activity_log').insert({
            action: 'Padel entry fee received via DonationManager — team auto-confirmed',
            entity_type: 'padel_registration',
            entity_id: padelRegistrationId,
          }).then(undefined, () => {})

          if (reg.captain_email) {
            sendPadelRegistrationApprovedEmail({
              to: reg.captain_email,
              firstName: reg.captain_first_name || 'Player',
              teamName: reg.player2_first_name ? `${reg.captain_first_name || 'Player'} & ${reg.player2_first_name}` : undefined,
            }).catch((err: unknown) => console.error('[DonationManager Webhook] Padel approved email failed (non-blocking):', err))
          }
        }
      }
    }

    // Wolf Run sponsorship donation reconciliation
    const wolfrunDonationId = extractIdFromReference(reference, 'wolfrun_donation:')
    if (wolfrunDonationId) {
      let fundraiserId: string | null = null

      if (isCompletedDonation(payload) || isCancelledDonation(payload)) {
        const nextStatus = isCompletedDonation(payload) ? 'completed' : 'failed'
        const { data: updatedDonation, error: donationUpdateError } = await supabase
          .from('wolfrun_donations')
          .update({ status: nextStatus })
          .eq('id', wolfrunDonationId)
          .select('fundraiser_id')
          .maybeSingle()

        if (donationUpdateError) {
          console.error('[DonationManager Webhook] Failed to update Wolf Run donation status:', donationUpdateError)
        } else {
          fundraiserId = updatedDonation?.fundraiser_id || null
        }
      }

      if (fundraiserId) {
        await recalcFundraiserTotalRaised(supabase, fundraiserId)
      }
    }

    switch (eventType) {
      case 'donation.completed':
      case 'donation.received': {
        await supabase.from('activity_log').insert({
          action: 'Donation received via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || reference || null,
        })
        break
      }
      case 'donation.recurring': {
        await supabase.from('activity_log').insert({
          action: 'Recurring donation via DonationManager',
          entity_type: 'donation_webhook',
          entity_id: payload.data?.reference || payload.id || reference || null,
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
          entity_id: payload.data?.reference || payload.id || reference || null,
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
