import { NextRequest, NextResponse } from "next/server"
import { sendApplicationApprovedEmail, sendApplicationDeclinedEmail, sendApplicationUnderReviewEmail, sendApplicationPaymentReminderEmail } from "@/lib/camp-applicant-emails"
import { sendPadelRegistrationApprovedEmail, sendPadelRegistrationDeclinedEmail, sendPadelRegistrationUnderReviewEmail } from "@/lib/padel-registration-emails"
import { buildResumeUrl } from "@/lib/camp-resume-token"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
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

function getGiftAidSelection(session: Stripe.Checkout.Session): boolean | null {
  const giftAidField = session.custom_fields?.find((field) => field.key === 'gift_aid')

  if (giftAidField?.type === 'dropdown') {
    return giftAidField.dropdown?.value === 'yes'
  }

  if (session.metadata?.gift_aid === 'true') {
    return true
  }

  if (session.metadata?.gift_aid === 'false') {
    return false
  }

  return null
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
      const giftAid = getGiftAidSelection(session)
      if (campApplicationId) {
        // Save the PI ID immediately so we can capture it below.
        const piId = typeof session.payment_intent === 'string' ? session.payment_intent : null
        await supabase.from("camp_applications").update({
          stripe_payment_intent_id: piId,
          stripe_pi_status: 'requires_capture',
          stripe_pi_synced_at: new Date().toISOString(),
          ...(giftAid === null ? {} : { gift_aid: giftAid }),
          updated_at: new Date().toISOString(),
        }).eq("id", campApplicationId)

        // Auto-capture: the admin sent this payment link after approving the
        // applicant, so capture the hold immediately. If capture succeeds,
        // payment_intent.succeeded fires next and sets status=approved + email.
        let autoCaptured = false
        if (piId) {
          try {
            const stripe = getStripeClient()
            await stripe.paymentIntents.capture(piId)
            autoCaptured = true
            await supabase.from("activity_log").insert({
              action: "Checkout completed — payment captured automatically",
              entity_type: "camp_application",
              entity_id: campApplicationId,
              metadata: { stripe_session_id: session.id, stripe_payment_intent: piId, amount_total: session.amount_total, currency: session.currency, gift_aid: giftAid },
            })
          } catch (captureErr) {
            console.error("[Webhook] Auto-capture failed — falling back to manual review:", captureErr)
          }
        }

        // Fallback if auto-capture failed or no PI ID.
        if (!autoCaptured) {
          const { data: transitioned } = await supabase
            .from("camp_applications")
            .update({ status: "payment_authorized", updated_at: new Date().toISOString() })
            .eq("id", campApplicationId)
            .eq("status", "payment_pending")
            .select("id, email, first_name")
            .maybeSingle()

          await supabase.from("activity_log").insert({
            action: "Checkout completed — payment on hold, awaiting manual capture",
            entity_type: "camp_application",
            entity_id: campApplicationId,
            metadata: { stripe_session_id: session.id, stripe_payment_intent: piId, amount_total: session.amount_total, currency: session.currency, gift_aid: giftAid, email_sent: Boolean(transitioned) },
          })

          if (transitioned?.email) {
            sendApplicationUnderReviewEmail({
              to: transitioned.email,
              firstName: transitioned.first_name || "Applicant",
              applicationId: String(transitioned.id),
            }).catch((err) => console.error("[Camp Email] Under-review email failed:", err))
          }
        }
      }

      // Padel team entry payment completed
      const padelRegistrationId = session.metadata?.padel_registration_id
      if (padelRegistrationId) {
        const padelPiId = typeof session.payment_intent === 'string' ? session.payment_intent : null
        await supabase.from("padel_registrations").update({
          stripe_payment_intent_id: padelPiId,
          stripe_pi_status: 'requires_capture',
          stripe_pi_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", padelRegistrationId)

        // True hold: card is authorised only - do NOT auto-capture.
        // The money stays uncaptured until an admin manually captures it from
        // the Stripe dashboard, which fires payment_intent.succeeded -> approved.
        // Releasing the hold there fires payment_intent.canceled -> declined.
        const { data: padelTransitioned } = await supabase
          .from("padel_registrations")
          .update({ status: "payment_authorized", updated_at: new Date().toISOString() })
          .eq("id", padelRegistrationId)
          .eq("status", "payment_pending")
          .select("id, captain_email, captain_first_name, player2_first_name")
          .maybeSingle()
        await supabase.from("activity_log").insert({
          action: "Padel checkout completed - payment on hold, awaiting manual capture",
          entity_type: "padel_registration",
          entity_id: padelRegistrationId,
          metadata: { stripe_session_id: session.id, stripe_payment_intent: padelPiId, amount_total: session.amount_total, currency: session.currency },
        }).then(undefined, () => {})
        if (padelTransitioned?.captain_email) {
          sendPadelRegistrationUnderReviewEmail({
            to: padelTransitioned.captain_email,
            firstName: padelTransitioned.captain_first_name || "Player",
            teamName: padelTransitioned.player2_first_name ? `${padelTransitioned.captain_first_name} & ${padelTransitioned.player2_first_name}` : undefined,
          }).catch((err) => console.error("[Padel Email] Under-review email failed:", err))
        }
      }

      // Wolf Run entry payment completed — store runner in wolfrun_runners
      if (session.metadata?.type === "wolfrun_entry") {
        const m = session.metadata
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : null
        const { error: runnerError } = await supabase
          .from("wolfrun_runners")
          .upsert(
            {
              first_name: m.first_name ?? "",
              last_name: m.last_name ?? "",
              email: m.email ?? "",
              phone: m.phone ?? "",
              age: m.age ? parseInt(m.age, 10) : 0,
              city: m.city ?? "",
              pack: m.pack ?? "",
              agree_whatsapp_group: m.agree_whatsapp_group === "true",
              status: "confirmed",
              stripe_session_id: session.id,
              stripe_payment_intent_id: piId,
            },
            { onConflict: "stripe_session_id", ignoreDuplicates: true }
          )

        if (runnerError) {
          console.error("[Wolf Run Webhook] Failed to save runner:", runnerError)
        }

        await supabase.from("activity_log").insert({
          action: "Wolf Run entry payment completed — runner saved",
          entity_type: "wolfrun_runner",
          metadata: {
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            email: m.email,
            pack: m.pack,
            amount_total: session.amount_total,
          },
        }).then(undefined, (err: unknown) => console.error("[Wolf Run Webhook] Activity log failed:", err))
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session
      const campApplicationId = session.metadata?.camp_application_id

      if (campApplicationId) {
        // Clear the stored checkout URL so the resume endpoint mints a fresh
        // session next time. Keep status as payment_pending - user can still pay.
        await supabase
          .from("camp_applications")
          .update({
            status: "payment_pending",
            stripe_customer_id: session.customer ? String(session.customer) : null,
            stripe_checkout_url: null,
            stripe_checkout_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campApplicationId)

        // Send a payment-reminder email (idempotent: skip if already sent or
        // application is no longer pending). Non-blocking on failure.
        const { data: app } = await supabase
          .from("camp_applications")
          .select("id, status, email, first_name, payment_reminder_sent_at, stripe_checkout_amount_pence")
          .eq("id", campApplicationId)
          .maybeSingle()

        if (app && app.status === "payment_pending" && !app.payment_reminder_sent_at && app.email) {
          const resumeUrl = buildResumeUrl(SITE_URL, String(app.id))
          const amountGbp = app.stripe_checkout_amount_pence
            ? Math.round(app.stripe_checkout_amount_pence) / 100
            : undefined
          sendApplicationPaymentReminderEmail({
            to: app.email,
            firstName: app.first_name || "Applicant",
            resumeUrl,
            amountGbp,
          })
            .then(async (sent) => {
              if (sent) {
                await supabase
                  .from("camp_applications")
                  .update({ payment_reminder_sent_at: new Date().toISOString() })
                  .eq("id", campApplicationId)
              }
            })
            .catch((err) => console.error("[Camp Email] Reminder email failed:", err))
        }
      }
    }
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent
      const cid = pi.metadata?.camp_application_id
      if (cid) {
        // Idempotent: only transition and email if not already approved
        const { data: transitioned } = await supabase
          .from("camp_applications")
          .update({ status: "approved", stripe_pi_status: "succeeded", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", cid)
          .neq("status", "approved")
          .select("email, first_name")
          .maybeSingle()
        await supabase.from("activity_log").insert({ action: "Payment captured - application approved", entity_type: "camp_application", entity_id: cid, metadata: { stripe_pi: pi.id, amount: pi.amount_received } })
        if (transitioned?.email) {
          sendApplicationApprovedEmail({ to: transitioned.email, firstName: transitioned.first_name || "Applicant" }).catch(err => console.error("[Camp Email] Approved email failed:", err))
        }
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const padelPi = event.data.object as Stripe.PaymentIntent
      const padelPid = padelPi.metadata?.padel_registration_id
      if (padelPid) {
        const { data: padelApproved } = await supabase
          .from("padel_registrations")
          .update({ status: "approved", stripe_pi_status: "succeeded", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", padelPid)
          .neq("status", "approved")
          .select("captain_email, captain_first_name, player2_first_name")
          .maybeSingle()
        await supabase.from("activity_log").insert({ action: "Padel payment captured - team approved", entity_type: "padel_registration", entity_id: padelPid, metadata: { stripe_pi: padelPi.id, amount: padelPi.amount_received } }).then(undefined, () => {})
        if (padelApproved?.captain_email) {
          sendPadelRegistrationApprovedEmail({ to: padelApproved.captain_email, firstName: padelApproved.captain_first_name || "Player", teamName: padelApproved.player2_first_name ? `${padelApproved.captain_first_name} & ${padelApproved.player2_first_name}` : undefined }).catch(err => console.error("[Padel Email] Approved email failed:", err))
        }
      }
    }

    if (event.type === "payment_intent.canceled") {
      const pi = event.data.object as Stripe.PaymentIntent
      const cid = pi.metadata?.camp_application_id
      if (cid) {
        // Idempotent: only transition and email if not already declined.
        const { data: transitioned } = await supabase
          .from("camp_applications")
          .update({ status: "declined", stripe_pi_status: "canceled", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", cid)
          .neq("status", "declined")
          .select("email, first_name")
          .maybeSingle()
        await supabase.from("activity_log").insert({ action: "Payment released - application declined", entity_type: "camp_application", entity_id: cid, metadata: { stripe_pi: pi.id } })
        if (transitioned?.email) {
          sendApplicationDeclinedEmail({ to: transitioned.email, firstName: transitioned.first_name || "Applicant" }).catch(err => console.error("[Camp Email] Declined email failed:", err))
        }
      }
    }

    if (event.type === "payment_intent.canceled") {
      const padelPiC = event.data.object as Stripe.PaymentIntent
      const padelPidC = padelPiC.metadata?.padel_registration_id
      if (padelPidC) {
        const { data: padelDeclined } = await supabase
          .from("padel_registrations")
          .update({ status: "declined", stripe_pi_status: "canceled", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", padelPidC)
          .neq("status", "declined")
          .select("captain_email, captain_first_name, player2_first_name")
          .maybeSingle()
        await supabase.from("activity_log").insert({ action: "Padel payment released - team declined", entity_type: "padel_registration", entity_id: padelPidC, metadata: { stripe_pi: padelPiC.id } }).then(undefined, () => {})
        if (padelDeclined?.captain_email) {
          sendPadelRegistrationDeclinedEmail({ to: padelDeclined.captain_email, firstName: padelDeclined.captain_first_name || "Player", teamName: padelDeclined.player2_first_name ? `${padelDeclined.captain_first_name} & ${padelDeclined.player2_first_name}` : undefined }).catch(err => console.error("[Padel Email] Declined email failed:", err))
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent
      const cid = pi.metadata?.camp_application_id
      // Only alert on camp application payments, not other PI types
      if (cid) {
        const declineReason = pi.last_payment_error?.decline_code
          || pi.last_payment_error?.code
          || pi.last_payment_error?.message
          || "unknown reason"

        const { data: app } = await supabase
          .from("camp_applications")
          .select("first_name, last_name, email, phone")
          .eq("id", cid)
          .maybeSingle()

        await supabase.from("activity_log").insert({
          action: "Camp application payment failed",
          entity_type: "camp_application",
          entity_id: cid,
          metadata: {
            stripe_pi: pi.id,
            decline_reason: declineReason,
            amount: pi.amount,
            email: app?.email,
          },
        }).then(undefined, () => {})

        // Alert the admin team
        try {
          const { Resend } = await import("resend")
          const resend = new Resend(process.env.RESEND_API_KEY)
          const adminEmail = process.env.CAMP_OWNER_NOTIFICATION_EMAIL || "singhscampuk@devanhaar.com"
          const name = app ? `${app.first_name} ${app.last_name}` : "Unknown applicant"
          await resend.emails.send({
            from: "Devanhaar Alerts <noreply@devanhaar.com>",
            to: adminEmail,
            subject: `[Action needed] Camp payment failed — ${name}`,
            html: `
              <p>A camp application payment has <strong>failed</strong> and needs attention.</p>
              <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
                <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td><strong>${name}</strong></td></tr>
                <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${app?.email ?? "—"}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${app?.phone ?? "—"}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;color:#666">Reason</td><td>${declineReason}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;color:#666">Application ID</td><td>${cid}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;color:#666">Stripe PI</td><td>${pi.id}</td></tr>
              </table>
              <p style="margin-top:16px"><a href="${SITE_URL}/dashboard/submissions" style="background:#1a1a2e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View in dashboard</a></p>
            `,
          })
        } catch (alertErr) {
          console.error("[Stripe Webhook] Failed to send payment failure alert:", alertErr)
        }
      }
    }


    if (event.type === "review.opened") {
      const review = event.data.object as Stripe.Review
      const piId = typeof review.payment_intent === "string" ? review.payment_intent : null
      if (piId) {
        await supabase.from("camp_applications").update({ stripe_review_state: review.reason === "manual" ? "new" : "new", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("stripe_payment_intent_id", piId)
        await supabase.from("activity_log").insert({ action: "Stripe review opened", entity_type: "camp_application", metadata: { stripe_pi: piId, reason: review.reason } })
      }
    }

    if (event.type === "review.closed") {
      const review = event.data.object as Stripe.Review
      const piId = typeof review.payment_intent === "string" ? review.payment_intent : null
      if (piId) {
        const reasonMap: Record<string, string> = { approved: "approved", refunded: "resolved", refunded_as_fraud: "resolved", disputed: "payment_support", redacted: "resolved" }
        const newState = reasonMap[review.reason || ""] || "resolved"
        await supabase.from("camp_applications").update({ stripe_review_state: newState, stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("stripe_payment_intent_id", piId)
        await supabase.from("activity_log").insert({ action: `Stripe review closed: ${newState}`, entity_type: "camp_application", metadata: { stripe_pi: piId, reason: review.reason } })
      }
    }

    if (event.type === "charge.dispute.created" || event.type === "charge.dispute.funds_withdrawn") {
      const dispute = event.data.object as Stripe.Dispute
      const piId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : null
      if (piId) {
        await supabase.from("camp_applications").update({ stripe_review_state: "payment_support", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("stripe_payment_intent_id", piId)
        await supabase.from("activity_log").insert({ action: `Stripe dispute ${event.type === "charge.dispute.created" ? "opened" : "funds withdrawn"}`, entity_type: "camp_application", metadata: { stripe_pi: piId, dispute_id: dispute.id, reason: dispute.reason, amount: dispute.amount } })
      }
    }

    if (event.type === "charge.dispute.closed" || event.type === "charge.dispute.funds_reinstated") {
      const dispute = event.data.object as Stripe.Dispute
      const piId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : null
      if (piId) {
        await supabase.from("camp_applications").update({ stripe_review_state: "resolved", stripe_pi_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("stripe_payment_intent_id", piId)
        await supabase.from("activity_log").insert({ action: `Stripe dispute resolved: ${dispute.status}`, entity_type: "camp_application", metadata: { stripe_pi: piId, dispute_id: dispute.id, status: dispute.status } })
      }
    }

    return NextResponse.json({ received: true, event: event.type })
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
