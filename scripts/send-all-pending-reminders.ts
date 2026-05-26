import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { buildResumeUrl } from "../lib/camp-resume-token"
import { sendApplicationPaymentReminderEmail } from "../lib/camp-applicant-emails"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const campFeeGbp = Number(process.env.STRIPE_CAMP_FEE_GBP || "199")
  const dryRun = process.env.DRY_RUN === "true"

  if (supabaseUrl == null || supabaseServiceKey == null) throw new Error("Missing Supabase env")
  if (stripeSecretKey == null) throw new Error("Missing STRIPE_SECRET_KEY")

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stripe = new Stripe(stripeSecretKey)

  const { data: apps, error } = await supabase
    .from("camp_applications")
    .select("id, email, first_name, last_name, initiative_id, stripe_checkout_amount_pence, monthly_donation_opted, monthly_donation_amount, gift_aid, created_at")
    .eq("status", "payment_pending")
    .eq("requires_payment_support", false)
    .is("payment_reminder_sent_at", null)
    .order("created_at", { ascending: false })

  if (error) throw error
  if (apps == null || apps.length === 0) {
    console.log("No payment_pending applications without a reminder. Nothing to do.")
    return
  }

  console.log("Found " + apps.length + " application(s) needing a reminder:")
  apps.forEach((a) => console.log("  - " + a.first_name + " " + a.last_name + " <" + a.email + "> (id: " + a.id + ")"))

  if (dryRun) {
    console.log("DRY_RUN=true - no emails sent and no Stripe sessions created.")
    return
  }

  let sent = 0
  let failed = 0

  for (const app of apps) {
    try {
      let initiativeSlug = "singhs-camp"
      if (app.initiative_id) {
        const { data: init } = await supabase.from("initiatives").select("slug").eq("id", app.initiative_id).maybeSingle()
        if (init?.slug) initiativeSlug = init.slug
      }

      const initiativePath = "/initiatives/" + initiativeSlug
      const returnTo = encodeURIComponent(initiativePath)
      const donationAmountPence = (app.stripe_checkout_amount_pence && app.stripe_checkout_amount_pence > 0)
        ? app.stripe_checkout_amount_pence
        : campFeeGbp * 100

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        payment_intent_data: {
          capture_method: "manual",
          ...(app.monthly_donation_opted ? { setup_future_usage: "off_session" } : {}),
          metadata: { camp_application_id: app.id },
        },
        customer_email: app.email,
        customer_creation: "always",
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: donationAmountPence,
            product_data: {
              name: "Singhs Camp UK - Camp Fee",
              description: "One-off donation for " + app.first_name + " " + app.last_name,
            },
          },
          quantity: 1,
        }],
        custom_fields: [{
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
        }],
        metadata: {
          camp_application_id: app.id,
          gift_aid: app.gift_aid ? "true" : "false",
          monthly_donation_opted: app.monthly_donation_opted ? "true" : "false",
          monthly_donation_amount: app.monthly_donation_opted ? String(app.monthly_donation_amount || "0") : "0",
          resumed: "bulk_script",
        },
        success_url: siteUrl + initiativePath + "?payment=success",
        cancel_url: siteUrl + "/payment/cancelled?returnTo=" + returnTo + "&applicationId=" + app.id,
      })

      await supabase.from("camp_applications").update({
        stripe_checkout_session_id: session.id,
        stripe_checkout_url: session.url,
        stripe_checkout_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        stripe_checkout_amount_pence: donationAmountPence,
        updated_at: new Date().toISOString(),
      }).eq("id", app.id)

      const resumeUrl = buildResumeUrl(siteUrl, String(app.id))
      const emailSent = await sendApplicationPaymentReminderEmail({
        to: app.email,
        firstName: app.first_name || "Applicant",
        resumeUrl,
        amountGbp: Math.round(donationAmountPence) / 100,
      })

      if (emailSent) {
        await supabase.from("camp_applications").update({ payment_reminder_sent_at: new Date().toISOString() }).eq("id", app.id)
        console.log("  SENT: " + app.first_name + " " + app.last_name + " <" + app.email + ">")
        sent++
      } else {
        console.warn("  WARN: email send failed for " + app.first_name + " " + app.last_name)
        failed++
      }
    } catch (err) {
      console.error("  ERROR: " + app.first_name + " " + app.last_name + " - " + err)
      failed++
    }
  }

  console.log("Done. Sent: " + sent + ", Failed: " + failed)
}

main().catch((err) => { console.error(err); process.exit(1) })
