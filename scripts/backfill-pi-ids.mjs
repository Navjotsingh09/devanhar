/**
 * Backfill script: patches stripe_payment_intent_id for all camp_applications
 * rows where a checkout session completed but the PI ID was never saved to the DB.
 *
 * Usage:
 *   1. Add STRIPE_SECRET_KEY to .env.local temporarily
 *   2. node scripts/backfill-pi-ids.mjs
 *   3. Remove STRIPE_SECRET_KEY from .env.local
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// --- Load .env.local manually ---
const envPath = resolve(process.cwd(), '.env.local')
const envRaw = readFileSync(envPath, 'utf8')
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  let val = trimmed.slice(eqIdx + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!STRIPE_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY not found in .env.local — add it then re-run.')
  process.exit(1)
}

// --- Stripe: list all completed checkout sessions ---
async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  })
  if (!res.ok) throw new Error(`Stripe API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function fetchAllCheckoutSessions() {
  const sessions = []
  let url = 'checkout/sessions?limit=100&status=complete&expand[]=data.line_items'
  // We don't need line items actually, just the payment_intent + metadata
  url = 'checkout/sessions?limit=100&status=complete'
  let hasMore = true
  let startingAfter = null
  while (hasMore) {
    const endpoint = startingAfter ? `${url}&starting_after=${startingAfter}` : url
    const page = await stripeGet(endpoint)
    sessions.push(...page.data)
    hasMore = page.has_more
    if (hasMore) startingAfter = page.data[page.data.length - 1].id
  }
  return sessions
}

// --- Supabase: update a row ---
async function patchDb(applicationId, piId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/camp_applications?id=eq.${applicationId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        stripe_payment_intent_id: piId,
        updated_at: new Date().toISOString(),
      }),
    }
  )
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`)
  return res.json()
}

// --- Also fetch the current DB row so we know what needs patching ---
async function fetchDbRows() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/camp_applications?select=id,email,stripe_payment_intent_id,status`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
      },
    }
  )
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`)
  return res.json()
}

// --- Main ---
async function main() {
  console.log('Fetching Stripe checkout sessions...')
  const sessions = await fetchAllCheckoutSessions()
  console.log(`Found ${sessions.length} completed sessions in Stripe.`)

  console.log('Fetching DB rows...')
  const rows = await fetchDbRows()
  const rowById = Object.fromEntries(rows.map(r => [r.id, r]))
  console.log(`Found ${rows.length} camp_applications rows in DB.`)

  let patched = 0
  let alreadyOk = 0
  let noAppId = 0
  let noMatch = 0

  for (const session of sessions) {
    const appId = session.metadata?.camp_application_id
    if (!appId) { noAppId++; continue }

    const piId = typeof session.payment_intent === 'string' ? session.payment_intent : null
    if (!piId) continue

    const row = rowById[appId]
    if (!row) { noMatch++; console.warn(`  No DB row for camp_application_id=${appId} (session ${session.id})`); continue }

    if (row.stripe_payment_intent_id === piId) { alreadyOk++; continue }

    console.log(`  Patching ${row.email} (id=${appId}): ${row.stripe_payment_intent_id ?? 'null'} → ${piId}`)
    await patchDb(appId, piId)
    patched++
  }

  console.log('\n=== Done ===')
  console.log(`Patched:    ${patched}`)
  console.log(`Already OK: ${alreadyOk}`)
  console.log(`No appId:   ${noAppId}`)
  console.log(`No DB row:  ${noMatch}`)
}

main().catch(err => { console.error(err); process.exit(1) })
