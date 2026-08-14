import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { verifyPadelResumeToken } from "@/lib/padel-resume-token"
import { PADEL_EVENT } from "@/components/padel/padel-event"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
const padelFeePerPersonGbp = Number(process.env.STRIPE_PADEL_FEE_PER_PERSON_GBP || "50")
const PADEL_PLAYERS_PER_TEAM = 2
const eventName = process.env.PADEL_EVENT_NAME || PADEL_EVENT.name

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

function getStripe() {
  if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY")
  return new Stripe(stripeSecretKey)
}

function errorRedirect(reason: string) {
  return NextResponse.redirect(`${siteUrl}/?padel_resume_error=${encodeURIComponent(reason)}`)
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const registrationId = url.searchParams.get("registration_id")
    const token = url.searchParams.get("token")

    if (!registrationId || !token) {
      return errorRedirect("missing_params")
    }
    if (!verifyPadelResumeToken(registrationId, token)) {
      return errorRedirect("invalid_token")
    }

    const supabase = getSupabaseAdmin()
    const { data: reg, error } = await supabase
      .from("padel_registrations")
      .select("id, status, captain_email, stripe_checkout_url, stripe_checkout_expires_at, stripe_checkout_amount_pence")
      .eq("id", registrationId)
      .maybeSingle()

    if (error || !reg) {
      return errorRedirect("not_found")
    }

    const initiativePath = "/initiatives/sikh-padel-association"

    if (reg.status !== "payment_pending") {
      return NextResponse.redirect(`${siteUrl}${initiativePath}?payment=already_processed`)
    }

    // Reuse the original Stripe session if it has not expired.
    if (
      reg.stripe_checkout_url &&
      reg.stripe_checkout_expires_at &&
      new Date(reg.stripe_checkout_expires_at).getTime() > Date.now() + 60_000
    ) {
      return NextResponse.redirect(reg.stripe_checkout_url)
    }

    const stripe = getStripe()
    const entryFeePence =
      reg.stripe_checkout_amount_pence && reg.stripe_checkout_amount_pence > 0
        ? reg.stripe_checkout_amount_pence
        : padelFeePerPersonGbp * PADEL_PLAYERS_PER_TEAM * 100
    const returnTo = encodeURIComponent(initiativePath)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
        metadata: { padel_registration_id: reg.id },
      },
      customer_email: reg.captain_email || undefined,
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: entryFeePence,
            product_data: {
              name: `${eventName} — Entry`,
              description: `Entry fee for ${PADEL_PLAYERS_PER_TEAM} players`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { padel_registration_id: reg.id },
      allow_promotion_codes: true,
      success_url: `${siteUrl}${initiativePath}?payment=success`,
      cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&registrationId=${reg.id}&token=${token}`,
    })

    try {
      await supabase
        .from("padel_registrations")
        .update({
          stripe_checkout_session_id: session.id,
          stripe_checkout_url: session.url,
          stripe_checkout_expires_at: session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : null,
          stripe_checkout_amount_pence: entryFeePence,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reg.id)
    } catch {
      // non-fatal
    }

    if (!session.url) {
      return errorRedirect("session_failed")
    }
    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error("[Padel Resume] error:", err)
    return errorRedirect("server_error")
  }
}
