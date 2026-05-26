/**
 * Recovery utility: given a camp_applications.id, generate a fresh Stripe
 * Checkout session, persist it on the row, and email the applicant a
 * "resume payment" link.
 *
 * Usage:
 *   pnpm dlx tsx scripts/resend-payment-link.ts <application_id>
 *   # or:
 *   npx tsx scripts/resend-payment-link.ts <application_id>
 *
 * Required env (load from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY
 *   RESEND_API_KEY
 *   RESUME_TOKEN_SECRET (or falls back to STRIPE_WEBHOOK_SECRET)
 *   NEXT_PUBLIC_SITE_URL (e.g. https://devanhaar.com)
 *   STRIPE_CAMP_FEE_GBP (default 199)
 */

import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { buildResumeUrl } from "../lib/camp-resume-token"
import { sendApplicationPaymentReminderEmail } from "../lib/camp-applicant-emails"

async function main() {
  const applicationId = process.argv[2]
  if (!applicationId) {
    console.error("Usage: tsx scripts/resend-payment-link.ts <application_id>")
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || "199")

  if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase env")
  if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY")

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stripe = new Stripe(stripeSecretKey)

  const { data: app, error } = await supabase
    .from("camp_applications")
    .select(
      "id, status, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid",
    )
    .eq("id", applicationId)
    .maybeSingle()

  if (error) throw error
  if (!app) {
    console.error("Application not found:", applicationId)
    process.exit(2)
  }
  if (app.status !== "payment_pending") {
    console.error(`Application status is "${app.status}", not "payment_pending". Aborting to avoid double-charging.`)
    process.exit(3)
  }

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
  const returnTo = encodeURIComponent(initiativePath)

  const donationAmountPence =
    app.stripe_checkout_amount_pence && app.stripe_checkout_amount_pence > 0
      ? app.stripe_checkout_amount_pence
      : campFeeGbp * 100

  const resumeUrl = buildResumeUrl(siteUrl, String(app.id))

  // Mint a fresh checkout session right away so the applicant clicks straight
  // through to Stripe without a redirect roundtrip.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    payment_intent_data: {
      capture_method: "manual",
      // Only set setup_future_usage when the applicant opted into a monthly
      // donation. Setting it unconditionally forces 3DS/SCA on every UK card.
      ...(app.monthly_donation_opted ? { setup_future_usage: "off_session" } : {}),
      metadata: { camp_application_id: app.id },
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
    ],
    metadata: {
      camp_application_id: app.id,
      gift_aid: app.gift_aid ? "true" : "false",
      monthly_donation_opted: app.monthly_donation_opted ? "true" : "false",
      monthly_donation_amount: app.monthly_donation_opted
        ? String(app.monthly_donation_amount || "0")
        : "0",
      resumed: "manual_script",
    },
    success_url: `${siteUrl}${initiativePath}?payment=success`,
    cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}`,
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

  if (!app.email) {
    console.warn("No email on row; printing resume link to console only.")
    console.log("Resume URL:", resumeUrl)
    console.log("Direct Stripe URL:", session.url)
    return
  }

  const sent = await sendApplicationPaymentReminderEmail({
    to: app.email,
    firstName: app.first_name || "Applicant",
    resumeUrl,
    amountGbp: Math.round(donationAmountPence) / 100,
  })

  if (sent) {
    await supabase
      .from("camp_applications")
      .update({ payment_reminder_sent_at: new Date().toISOString() })
      .eq("id", app.id)
  }

  console.log(JSON.stringify(
    {
      applicationId: app.id,
      email: app.email,
      sent,
      resumeUrl,
      stripeUrl: session.url,
      amountGbp: Math.round(donationAmountPence) / 100,
    },
    null,
    2,
  ))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
