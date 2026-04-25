import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { verifyResumeToken, signResumeToken } from "@/lib/camp-resume-token"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || "199")

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
  return NextResponse.redirect(`${siteUrl}/?camp_resume_error=${encodeURIComponent(reason)}`)
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const applicationId = url.searchParams.get("application_id")
    const token = url.searchParams.get("token")

    if (!applicationId || !token) {
      return errorRedirect("missing_params")
    }
    if (!verifyResumeToken(applicationId, token)) {
      return errorRedirect("invalid_token")
    }

    const supabase = getSupabaseAdmin()
    const { data: app, error } = await supabase
      .from("camp_applications")
      .select(
        "id, status, email, first_name, last_name, initiative_id, stripe_checkout_url, stripe_checkout_expires_at, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid",
      )
      .eq("id", applicationId)
      .maybeSingle()

    if (error || !app) {
      return errorRedirect("not_found")
    }

    // Look up initiative slug for redirect URLs
    let initiativeSlug = "singhs-camp"
    if (app.initiative_id) {
      const { data: init } = await supabase
        .from("initiatives")
        .select("slug")
        .eq("id", app.initiative_id)
        .maybeSingle()
      if (init?.slug) initiativeSlug = init.slug
    }
    const initiativePath = `/initiatives/${initiativeSlug}`

    // Already past payment step - send them back to the initiative page.
    if (app.status !== "payment_pending") {
      return NextResponse.redirect(`${siteUrl}${initiativePath}?payment=already_processed`)
    }

    // Reuse the original Stripe Checkout session if it has not expired yet.
    if (
      app.stripe_checkout_url &&
      app.stripe_checkout_expires_at &&
      new Date(app.stripe_checkout_expires_at).getTime() > Date.now() + 60_000
    ) {
      return NextResponse.redirect(app.stripe_checkout_url)
    }

    // Mint a fresh Checkout session preserving the original camp_application_id.
    const stripe = getStripe()
    const donationAmountPence =
      app.stripe_checkout_amount_pence && app.stripe_checkout_amount_pence > 0
        ? app.stripe_checkout_amount_pence
        : campFeeGbp * 100
    const returnTo = encodeURIComponent(initiativePath)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
        setup_future_usage: "off_session",
        metadata: {
          camp_application_id: app.id,
        },
      },
      customer_email: app.email,
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: donationAmountPence,
            product_data: {
              name: "Singhs Camp UK – Camp Fee",
              description: `One-off donation for ${app.first_name} ${app.last_name}`,
            },
          },
          quantity: 1,
        },
        ...(app.monthly_donation_opted && Number(app.monthly_donation_amount) > 0
          ? [
              {
                price_data: {
                  currency: "gbp",
                  unit_amount: 0,
                  product_data: {
                    name: `Monthly Donation – \u00a3${app.monthly_donation_amount}/month`,
                    description: "Recurring subscription starts after approval (not charged today)",
                  },
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      custom_fields: [
        {
          key: "gift_aid",
          label: { type: "custom", custom: "Gift Aid declaration" },
          type: "dropdown",
          optional: false,
          dropdown: {
            options: [
              { label: "Yes - I am a UK taxpayer and want Devanhaar to claim Gift Aid", value: "yes" },
              { label: "No - do not claim Gift Aid on this payment", value: "no" },
            ],
          },
        },
      ],
      metadata: {
        camp_application_id: app.id,
        gift_aid: app.gift_aid ? "true" : "false",
        monthly_donation_opted: app.monthly_donation_opted ? "true" : "false",
        monthly_donation_amount: app.monthly_donation_opted ? String(app.monthly_donation_amount || "0") : "0",
        resumed: "true",
      },
      success_url: `${siteUrl}${initiativePath}?payment=success`,
      cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}&resumeToken=${encodeURIComponent(signResumeToken(String(app.id)))}`,
    })

    await supabase
      .from("camp_applications")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_checkout_url: session.url,
        stripe_checkout_expires_at: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
        stripe_checkout_amount_pence: donationAmountPence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.id)

    if (!session.url) {
      return errorRedirect("stripe_no_url")
    }
    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error("[Camp Resume] Error:", err)
    return errorRedirect("server_error")
  }
}
