import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Admin-only one-shot reconciliation.
// For every camp_application missing stripe_payment_intent_id or stripe_pi_status,
// look up Stripe and backfill stripe_payment_intent_id, stripe_pi_status, stripe_review_state.
// Runs on Vercel with production env so no local secrets needed.
export const dynamic = "force-dynamic"
export const maxDuration = 300

type RowResult = { id: string; email: string | null; action: string; pi?: string; pi_status?: string; review_state?: string | null }
type Result = { total: number; scanned: number; linked: number; updated: number; skipped: number; notFound: number; errors: Array<{ id: string; email: string | null; error: string }>; rows: RowResult[] }

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Role check: vacancies_only users can't run this
  const appRole = (user.app_metadata as { role?: string })?.role
  if (appRole === "vacancies_only") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 })
  const stripe = new Stripe(stripeKey)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Missing Supabase service credentials" }, { status: 500 })
  const admin = createServiceClient(supabaseUrl, serviceKey)

  const body = await request.json().catch(() => ({}))
  const onlyMissing = body.onlyMissing !== false
  const limit = Math.min(Number(body.limit ?? 200), 500)

  let query = admin
    .from("camp_applications")
    .select("id, email, first_name, last_name, status, stripe_payment_intent_id, stripe_checkout_session_id, stripe_pi_status, stripe_review_state")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (onlyMissing) {
    query = query.or("stripe_payment_intent_id.is.null,stripe_pi_status.is.null")
  }
  const { data: apps, error: fetchErr } = await query
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const result: Result = { total: apps?.length ?? 0, scanned: 0, linked: 0, updated: 0, skipped: 0, notFound: 0, errors: [], rows: [] }
  if (!apps || apps.length === 0) return NextResponse.json(result)

  for (const app of apps) {
    result.scanned++
    try {
      let pi: Stripe.PaymentIntent | null = null

      if (app.stripe_payment_intent_id) {
        pi = await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id, { expand: ["review"] })
      } else if (app.stripe_checkout_session_id) {
        const session = await stripe.checkout.sessions.retrieve(app.stripe_checkout_session_id)
        if (session.payment_intent && typeof session.payment_intent === "string") {
          pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ["review"] })
        }
      } else if (app.email) {
        const intents = await stripe.paymentIntents.list({ limit: 100 })
        const filtered = intents.data.filter((p) => p.metadata?.camp_application_id === app.id || p.receipt_email === app.email)
        if (filtered.length > 0) pi = filtered.sort((a, b) => b.created - a.created)[0]
      }

      if (!pi) {
        result.notFound++
        result.rows.push({ id: app.id, email: app.email, action: "no_pi_found" })
        continue
      }

      let reviewState: string | null = app.stripe_review_state ?? null
      const reviewObj = (pi as Stripe.PaymentIntent & { review?: Stripe.Review | string | null }).review
      if (reviewObj && typeof reviewObj === "object") {
        if (reviewObj.open) {
          reviewState = "new"
        } else {
          const reasonMap: Record<string, string> = { approved: "approved", refunded: "resolved", refunded_as_fraud: "resolved", disputed: "payment_support", redacted: "resolved" }
          reviewState = reasonMap[reviewObj.reason || ""] || "resolved"
        }
      }

      if (pi.latest_charge && typeof pi.latest_charge === "string") {
        try {
          const ch = await stripe.charges.retrieve(pi.latest_charge)
          if (ch.disputed) reviewState = "payment_support"
        } catch { /* ignore */ }
      }

      const update: Record<string, unknown> = {
        stripe_payment_intent_id: pi.id,
        stripe_pi_status: pi.status,
        stripe_review_state: reviewState,
        stripe_pi_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const linked = !app.stripe_payment_intent_id
      if (linked) result.linked++

      const changed = pi.id !== app.stripe_payment_intent_id || pi.status !== app.stripe_pi_status || reviewState !== app.stripe_review_state
      if (!changed) {
        result.skipped++
        result.rows.push({ id: app.id, email: app.email, action: "unchanged", pi: pi.id, pi_status: pi.status, review_state: reviewState })
        continue
      }

      const { error: updErr } = await admin.from("camp_applications").update(update).eq("id", app.id)
      if (updErr) throw new Error(updErr.message)
      result.updated++

      await admin.from("activity_log").insert({
        admin_id: user.id,
        action: linked ? `Reconcile: linked PI ${pi.id} (${pi.status})` : `Reconcile: refreshed PI ${pi.id} -> ${pi.status} / review ${reviewState ?? "-"}`,
        entity_type: "camp_application",
        entity_id: app.id,
        metadata: { pi_id: pi.id, pi_status: pi.status, review_state: reviewState },
      })

      result.rows.push({ id: app.id, email: app.email, action: linked ? "linked" : "refreshed", pi: pi.id, pi_status: pi.status, review_state: reviewState })
    } catch (err) {
      result.errors.push({ id: app.id, email: app.email, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json(result)
}
