import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import Stripe from "stripe"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export type AuditRow = {
  app_id: string
  name: string
  email: string | null
  db_status: string
  match_method: "pi_id" | "session_id" | "metadata" | "email" | "none"
  stripe_pi_id: string | null
  stripe_status: string | null
  amount_gbp: number | null
  stripe_created: string | null
}

export type AuditReport = {
  total_apps: number
  matched: number
  unmatched: number
  by_stripe_status: Record<string, { count: number; total_gbp: number }>
  total_collected_gbp: number
  on_hold_gbp: number
  rows: AuditRow[]
}

export async function GET(_request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appRole = (user.app_metadata as { role?: string })?.role
  if (appRole === "vacancies_only")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey)
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 })
  const stripe = new Stripe(stripeKey)

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey)
    return NextResponse.json(
      { error: "Missing Supabase service credentials" },
      { status: 500 }
    )
  const admin = createServiceClient(supabaseUrl, serviceKey)

  // Fetch all camp applications.
  // Only select columns guaranteed to exist – stripe_pi_status and stripe_review_state
  // require a migration that may not have run yet on the database.
  const { data: apps, error: appsErr } = await admin
    .from("camp_applications")
    .select(
      "id, first_name, last_name, email, status, stripe_payment_intent_id, stripe_checkout_session_id"
    )
    .order("created_at", { ascending: false })
  if (appsErr)
    return NextResponse.json({ error: appsErr.message }, { status: 500 })

  if (!apps || apps.length === 0) {
    const empty: AuditReport = {
      total_apps: 0,
      matched: 0,
      unmatched: 0,
      by_stripe_status: {},
      total_collected_gbp: 0,
      on_hold_gbp: 0,
      rows: [],
    }
    return NextResponse.json(empty)
  }

  // Fetch ALL Stripe payment intents (paginate through every page)
  const allPIs: Stripe.PaymentIntent[] = []
  let startingAfter: string | undefined = undefined
  while (true) {
    const page = await stripe.paymentIntents.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    allPIs.push(...page.data)
    if (page.has_more === false) break
    startingAfter = page.data[page.data.length - 1].id
  }

  // Build lookup maps
  const piById = new Map(allPIs.map((pi) => [pi.id, pi]))
  const piByAppId = new Map<string, Stripe.PaymentIntent>()
  const piByEmail = new Map<string, Stripe.PaymentIntent[]>()
  for (const pi of allPIs) {
    const appId = pi.metadata?.camp_application_id
    if (appId && piByAppId.get(appId) === undefined) piByAppId.set(appId, pi)
    const email = pi.receipt_email ?? pi.metadata?.email
    if (email) {
      const existing = piByEmail.get(email)
      if (existing) {
        existing.push(pi)
      } else {
        piByEmail.set(email, [pi])
      }
    }
  }

  // Cache for checkout session lookups (avoids repeated API calls)
  const sessionCache = new Map<string, Stripe.PaymentIntent | null>()

  const rows: AuditRow[] = []
  for (const app of apps) {
    const name =
      `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || "Unknown"
    let pi: Stripe.PaymentIntent | null = null
    let matchMethod: AuditRow["match_method"] = "none"

    // 1. Match by PI ID stored in DB
    if (app.stripe_payment_intent_id) {
      const found = piById.get(app.stripe_payment_intent_id)
      if (found) {
        pi = found
        matchMethod = "pi_id"
      }
    }

    // 2. Match via checkout session ID
    if (pi === null && app.stripe_checkout_session_id) {
      if (sessionCache.has(app.stripe_checkout_session_id)) {
        const cached = sessionCache.get(app.stripe_checkout_session_id) ?? null
        if (cached) {
          pi = cached
          matchMethod = "session_id"
        }
      } else {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            app.stripe_checkout_session_id
          )
          if (
            session.payment_intent &&
            typeof session.payment_intent === "string"
          ) {
            const fromMap = piById.get(session.payment_intent)
            const resolved =
              fromMap ??
              (await stripe.paymentIntents.retrieve(session.payment_intent))
            sessionCache.set(app.stripe_checkout_session_id, resolved)
            pi = resolved
            matchMethod = "session_id"
          } else {
            sessionCache.set(app.stripe_checkout_session_id, null)
          }
        } catch {
          sessionCache.set(app.stripe_checkout_session_id, null)
        }
      }
    }

    // 3. Match by metadata.camp_application_id
    if (pi === null) {
      const fromMeta = piByAppId.get(app.id)
      if (fromMeta) {
        pi = fromMeta
        matchMethod = "metadata"
      }
    }

    // 4. Match by email – last resort, may be inaccurate (person with multiple PIs)
    if (pi === null && app.email) {
      const emailPIs = piByEmail.get(app.email) ?? []
      if (emailPIs.length > 0) {
        const order = ["succeeded", "requires_capture"]
        const sorted = [...emailPIs].sort((a, b) => {
          const ai = order.indexOf(a.status)
          const bi = order.indexOf(b.status)
          const aScore = ai === -1 ? 99 : ai
          const bScore = bi === -1 ? 99 : bi
          if (aScore !== bScore) return aScore - bScore
          return b.created - a.created
        })
        pi = sorted[0]
        matchMethod = "email"
      }
    }

    rows.push({
      app_id: app.id,
      name,
      email: app.email ?? null,
      db_status: app.status,
      match_method: matchMethod,
      stripe_pi_id: pi ? pi.id : null,
      stripe_status: pi ? pi.status : null,
      amount_gbp: pi ? pi.amount / 100 : null,
      stripe_created: pi
        ? new Date(pi.created * 1000).toISOString()
        : null,
    })
  }

  // Build summary
  const matched = rows.filter((r) => r.match_method !== "none").length
  const by_stripe_status: Record<string, { count: number; total_gbp: number }> =
    {}
  for (const row of rows) {
    const key = row.stripe_status ?? "no_payment"
    const bucket = by_stripe_status[key]
    if (bucket) {
      bucket.count++
      if (row.amount_gbp) bucket.total_gbp += row.amount_gbp
    } else {
      by_stripe_status[key] = { count: 1, total_gbp: row.amount_gbp ?? 0 }
    }
  }

  const total_collected_gbp = rows
    .filter((r) => r.stripe_status === "succeeded")
    .reduce((sum, r) => sum + (r.amount_gbp ?? 0), 0)
  const on_hold_gbp = rows
    .filter((r) => r.stripe_status === "requires_capture")
    .reduce((sum, r) => sum + (r.amount_gbp ?? 0), 0)

  const report: AuditReport = {
    total_apps: apps.length,
    matched,
    unmatched: apps.length - matched,
    by_stripe_status,
    total_collected_gbp: Math.round(total_collected_gbp * 100) / 100,
    on_hold_gbp: Math.round(on_hold_gbp * 100) / 100,
    rows,
  }

  return NextResponse.json(report)
}
