import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }
  return new Stripe(stripeSecretKey)
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeWebhookSecret) {
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 })
    }

    const signature = request.headers.get("stripe-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
    }

    const stripe = getStripeClient()
    const rawBody = await request.text()
    const event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret)
    const supabase = getSupabaseAdmin()

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const campApplicationId = session.metadata?.camp_application_id
      const wolfrunDonationId = session.metadata?.wolfrun_donation_id
      const wolfrunFundraiserId = session.metadata?.wolfrun_fundraiser_id
      if (campApplicationId) {
        await supabase
          .from("camp_applications")
          .update({
            status: "payment_authorized",
            stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campApplicationId)

        await supabase.from("activity_log").insert({
          action: "Camp application payment authorized (on hold) via Stripe",
          entity_type: "camp_application",
          entity_id: campApplicationId,
          metadata: {
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        })
      }
      // Wolf Run donation completed
      if (wolfrunDonationId && wolfrunFundraiserId) {
        const donationAmount = session.amount_total || 0

        await supabase
          .from("wolfrun_donations")
          .update({
            status: "completed",
            stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          })
          .eq("id", wolfrunDonationId)

        const { data: currentFundraiser } = await supabase
          .from("wolfrun_fundraisers")
          .select("total_raised")
          .eq("id", wolfrunFundraiserId)
          .single()

        if (currentFundraiser) {
          await supabase
            .from("wolfrun_fundraisers")
            .update({
              total_raised: (currentFundraiser.total_raised || 0) + donationAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", wolfrunFundraiserId)
        }

        await supabase.from("activity_log").insert({
          action: "Wolf Run donation completed",
          entity_type: "wolfrun_donation",
          entity_id: wolfrunDonationId,
          metadata: {
            fundraiser_id: wolfrunFundraiserId,
            stripe_session_id: session.id,
            amount: donationAmount,
            gift_aid: session.metadata?.gift_aid,
            donor_name: session.metadata?.donor_name,
          },
        })
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session
      const campApplicationId = session.metadata?.camp_application_id
      const wolfrunDonationId = session.metadata?.wolfrun_donation_id

      if (campApplicationId) {
        await supabase
          .from("camp_applications")
          .update({
            status: "payment_pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", campApplicationId)
      }

      if (wolfrunDonationId) {
        await supabase
          .from("wolfrun_donations")
          .update({ status: "failed" })
          .eq("id", wolfrunDonationId)
      }
    }
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent
      const cid = pi.metadata?.camp_application_id
      if (cid) {
        await supabase.from("camp_applications").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", cid)
        await supabase.from("activity_log").insert({ action: "Payment captured - application approved", entity_type: "camp_application", entity_id: cid, metadata: { stripe_pi: pi.id, amount: pi.amount_received } })
      }
    }

    if (event.type === "payment_intent.canceled") {
      const pi = event.data.object as Stripe.PaymentIntent
      const cid = pi.metadata?.camp_application_id
      if (cid) {
        await supabase.from("camp_applications").update({ status: "declined", updated_at: new Date().toISOString() }).eq("id", cid)
        await supabase.from("activity_log").insert({ action: "Payment released - application declined", entity_type: "camp_application", entity_id: cid, metadata: { stripe_pi: pi.id } })
      }
    }

    return NextResponse.json({ received: true, event: event.type })
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
