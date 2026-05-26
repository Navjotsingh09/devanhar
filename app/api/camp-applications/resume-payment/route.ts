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

    // Step 1: query base columns only (these always exist in the schema).
    // We deliberately avoid migration-added columns here because supabase-js
    // .maybeSingle() can silently return { data: null, error: null } when
    // PostgREST rejects the request with a 400 (column not found), which would
    // make it look like the row is missing when it actually exists.
    const { data: app, error } = await supabase
      .from("camp_applications")
      .select("id, status, email, first_name, last_name, initiative_id, gift_aid")
      .eq("id", applicationId)
      .maybeSingle()

    if (error || !app) {
      const hint = error ? "db_error" : "row_missing"
      const idPrefix = applicationId ? applicationId.substring(0, 8) : "none"
      console.error("[Camp Resume] not_found:", hint, "id_prefix:", idPrefix, "err:", error?.message)
      return NextResponse.redirect(
        `${siteUrl}/?camp_resume_error=not_found&hint=${hint}&id=${idPrefix}`
      )
    }

    // Step 2: optionally fetch Stripe/donation columns added via migration.
    // Non-fatal — if these columns don't exist yet we skip Stripe session reuse
    // and create a fresh checkout session below.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stripeData: any = {}
    try {
      const { data: sd } = await supabase
        .from("camp_applications")
        .select("stripe_checkout_url, stripe_checkout_expires_at, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount")
        .eq("id", applicationId)
        .maybeSingle()
      if (sd) stripeData = sd
    } catch {
      // Columns not yet migrated — proceed without Stripe session reuse
    }

    // Merge base + stripe data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullApp: any = { ...app, ...stripeData }

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
      fullApp.stripe_checkout_url &&
      fullApp.stripe_checkout_expires_at &&
      new Date(fullApp.stripe_checkout_expires_at).getTime() > Date.now() + 60_000
    ) {
      return NextResponse.redirect(fullApp.stripe_checkout_url)
    }

    // Mint a fresh Checkout session preserving the original camp_application_id.
    const stripe = getStripe()
    const donationAmountPence =
      fullApp.stripe_checkout_amount_pence && fullApp.stripe_checkout_amount_pence > 0
        ? fullApp.stripe_checkout_amount_pence
        : campFeeGbp * 100
    const returnTo = encodeURIComponent(initiativePath)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
        // Only set up the card for future off-session use when the applicant
        // has opted into a monthly donation. Setting this unconditionally
        // forces mandatory 3DS/SCA on every UK card, causing the checkout
        // to hang on "Processing..." if the bank auth notification is missed.
        ...(fullApp.monthly_donation_opted ? { setup_future_usage: "off_session" } : {}),
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
              name: "Singhs Camp UK \u2013 Camp Fee",
              description: `One-off donation for ${app.first_name} ${app.last_name}`,
            },
          },
          quantity: 1,
        },
        ...(fullApp.monthly_donation_opted && Number(fullApp.monthly_donation_amount) > 0
          ? [
              {
                price_data: {
                  currency: "gbp",
                  unit_amount: 0,
                  product_data: {
                    name: `Monthly Donation \u2013 \u00a3${fullApp.monthly_donation_amount}/month`,
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
        monthly_donation_opted: fullApp.monthly_donation_opted ? "true" : "false",
        monthly_donation_amount: fullApp.monthly_donation_opted ? String(fullApp.monthly_donation_amount || "0") : "0",
        resumed: "true",
      },
      success_url: `${siteUrl}${initiativePath}?payment=success`,
      cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}&resumeToken=${encodeURIComponent(signResumeToken(String(app.id)))}`,
    })

    try {
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
    } catch (updateErr) {
      // Non-fatal: migration columns may not exist yet. Session URL is still valid.
      console.warn("[Camp Resume] Could not persist new session to DB (non-fatal):", updateErr)
    }

    if (!session.url) {
      return errorRedirect("stripe_no_url")
    }
    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error("[Camp Resume] Error:", err)
    return errorRedirect("server_error")
  }
}
