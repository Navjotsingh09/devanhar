import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { buildResumeUrl } from "@/lib/camp-resume-token"
import { sendApplicationPaymentReminderEmail } from "@/lib/camp-applicant-emails"

export const dynamic = "force-dynamic"

const CRON_SECRET = process.env.CRON_SECRET
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || "199")

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase credentials")
  return createClient(url, key)
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY")
  return new Stripe(key)
}

// Called by Vercel Cron (GET with Authorization: Bearer <CRON_SECRET>)
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return runReminders()
}

async function runReminders() {
  const supabase = getSupabaseAdmin()
  const stripe = getStripe()

  // Find payment_pending applications that need a reminder:
  // - Created more than 2 hours ago (gave them time to pay initially)
  // - Either never reminded, or last reminder was more than 24 hours ago
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: apps, error } = await supabase
    .from("camp_applications")
    .select(
      "id, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid, payment_reminder_sent_at",
    )
    .eq("status", "payment_pending")
    .eq("requires_payment_support", false)
    .lt("created_at", twoHoursAgo)
    .or(`payment_reminder_sent_at.is.null,payment_reminder_sent_at.lt.${oneDayAgo}`)

  if (error) {
    console.error("[Payment Reminders] DB query failed:", error)
    return NextResponse.json({ error: "DB query failed" }, { status: 500 })
  }

  if (!apps || apps.length === 0) {
    console.log("[Payment Reminders] No applications need reminders right now")
    return NextResponse.json({ sent: 0, skipped: 0, results: [] })
  }

  const results: Array<{ id: string; name: string; email: string; sent: boolean; error?: string }> = []

  for (const app of apps) {
    try {
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

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        payment_intent_data: {
          capture_method: "manual",
          // Only force 3DS setup when the applicant opted into a monthly donation.
          // Setting this unconditionally causes 3DS/SCA hang on UK cards.
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
          monthly_donation_amount: app.monthly_donation_opted
            ? String(app.monthly_donation_amount || "0")
            : "0",
          resumed: "auto_reminder",
        },
        success_url: `${siteUrl}${initiativePath}?payment=success`,
        cancel_url: `${siteUrl}/payment/cancelled?returnTo=${returnTo}&applicationId=${app.id}`,
      })

      // Persist fresh session so resume-payment link redirects straight to it
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

      const resumeUrl = buildResumeUrl(siteUrl, String(app.id))
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

      results.push({ id: app.id, name: `${app.first_name} ${app.last_name}`, email: app.email, sent })
    } catch (err) {
      console.error(`[Payment Reminders] Failed for application ${app.id}:`, err)
      results.push({
        id: app.id,
        name: `${app.first_name} ${app.last_name}`,
        email: app.email,
        sent: false,
        error: String(err),
      })
    }
  }

  const sentCount = results.filter((r) => r.sent).length
  console.log(
    `[Payment Reminders] Processed ${results.length} applications, sent ${sentCount} reminder emails`,
  )

  return NextResponse.json({ sent: sentCount, skipped: results.length - sentCount, results })
}
