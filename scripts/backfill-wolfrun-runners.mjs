import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase service role credentials")
}

const stripe = new Stripe(stripeSecretKey)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseAge(raw) {
  const age = Number.parseInt(String(raw ?? ""), 10)
  return Number.isFinite(age) ? age : null
}

function normalizePack(raw) {
  const pack = String(raw ?? "").trim().toLowerCase()
  return pack === "singhs" || pack === "kaurs" ? pack : null
}

function toIsoFromUnix(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString()
}

async function getExistingMaps() {
  const bySession = new Set()
  const byEmail = new Set()

  const { data, error } = await supabase
    .from("wolfrun_runners")
    .select("stripe_session_id,email")
    .limit(20000)

  if (error) {
    throw new Error(`Failed loading existing runners: ${error.message}`)
  }

  for (const row of data || []) {
    if (row.stripe_session_id) bySession.add(row.stripe_session_id)
    if (row.email) byEmail.add(String(row.email).toLowerCase())
  }

  return { bySession, byEmail }
}

async function* listAllSessions() {
  let startingAfter

  while (true) {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    for (const session of page.data) {
      yield session
    }

    if (!page.has_more || page.data.length === 0) {
      break
    }

    startingAfter = page.data[page.data.length - 1].id
  }
}

async function main() {
  const existing = await getExistingMaps()

  let scanned = 0
  let matched = 0
  let inserted = 0
  let updatedByEmail = 0
  let alreadyBySession = 0
  let skippedInvalid = 0
  let failed = 0

  for await (const session of listAllSessions()) {
    scanned += 1

    if (session.metadata?.type !== "wolfrun_entry") {
      continue
    }

    if (session.payment_status !== "paid") {
      continue
    }

    matched += 1

    const m = session.metadata || {}
    const email = String(m.email ?? "").trim().toLowerCase()
    const firstName = String(m.first_name ?? "").trim()
    const lastName = String(m.last_name ?? "").trim()
    const phone = String(m.phone ?? "").trim()
    const city = String(m.city ?? "").trim()
    const pack = normalizePack(m.pack)
    const age = parseAge(m.age)

    if (!email || !firstName || !lastName || !phone || !city || !pack || age == null || age < 16 || age > 99) {
      skippedInvalid += 1
      continue
    }

    const piId = typeof session.payment_intent === "string" ? session.payment_intent : null
    const row = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      age,
      city,
      pack,
      agree_whatsapp_group: m.agree_whatsapp_group === "true",
      status: "confirmed",
      stripe_session_id: session.id,
      stripe_payment_intent_id: piId,
      created_at: toIsoFromUnix(session.created),
    }

    try {
      if (existing.bySession.has(session.id)) {
        alreadyBySession += 1
        continue
      }

      if (existing.byEmail.has(email)) {
        const { error } = await supabase
          .from("wolfrun_runners")
          .update({
            first_name: row.first_name,
            last_name: row.last_name,
            phone: row.phone,
            age: row.age,
            city: row.city,
            pack: row.pack,
            agree_whatsapp_group: row.agree_whatsapp_group,
            status: row.status,
            stripe_session_id: row.stripe_session_id,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
          })
          .eq("email", email)

        if (error) {
          failed += 1
          console.error(`[Backfill] Update failed for ${session.id}: ${error.message}`)
          continue
        }

        updatedByEmail += 1
        existing.bySession.add(session.id)
        continue
      }

      const { error } = await supabase.from("wolfrun_runners").insert(row)

      if (error) {
        failed += 1
        console.error(`[Backfill] Insert failed for ${session.id}: ${error.message}`)
        continue
      }

      inserted += 1
      existing.bySession.add(session.id)
      existing.byEmail.add(email)
    } catch (err) {
      failed += 1
      console.error(`[Backfill] Unexpected failure for ${session.id}:`, err)
    }
  }

  const { count: finalTotal, error: finalError } = await supabase
    .from("wolfrun_runners")
    .select("id", { count: "exact", head: true })

  if (finalError) {
    console.error(`[Backfill] Final count failed: ${finalError.message}`)
  }

  console.log("\\nWolf Run backfill summary")
  console.log(JSON.stringify({
    scanned,
    matched,
    inserted,
    updatedByEmail,
    alreadyBySession,
    skippedInvalid,
    failed,
    finalTotal: finalTotal ?? null,
  }, null, 2))
}

main().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})
