import { readFileSync } from 'fs'
import { resolve } from 'path'

// Need Stripe key for this script — temporarily prompt user to add it
const envPath = resolve(process.cwd(), '.env.local')
const envRaw = readFileSync(envPath, 'utf8')
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  let val = trimmed.slice(eq + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
  process.env[trimmed.slice(0, eq).trim()] = val
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SR = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!STRIPE_KEY) { console.error('Add STRIPE_SECRET_KEY to .env.local first'); process.exit(1) }

async function dbGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_SR, Authorization: `Bearer ${SUPABASE_SR}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const rows = await dbGet('camp_applications?select=id,first_name,last_name,email,status,stripe_payment_intent_id,created_at&order=created_at.desc')
console.log(`\n=== Total camp_applications rows: ${rows.length} ===\n`)

// Check for test entries (heuristic: name contains "test", email contains "test"/"example")
const testRows = rows.filter(r =>
  /test/i.test(r.first_name || '') ||
  /test/i.test(r.last_name || '') ||
  /test|example|fake|asdf|qwer/i.test(r.email || '')
)
console.log(`-- TEST ENTRIES (${testRows.length}) --`)
for (const r of testRows) console.log(`  ${r.id}  ${r.first_name} ${r.last_name}  <${r.email}>  status=${r.status}  pi=${r.stripe_payment_intent_id ?? 'null'}`)

// Check duplicates by email
const byEmail = {}
for (const r of rows) {
  const k = (r.email || '').trim().toLowerCase()
  if (!k) continue
  byEmail[k] = byEmail[k] || []
  byEmail[k].push(r)
}
console.log(`\n-- DUPLICATES BY EMAIL --`)
let dupCount = 0
for (const [email, list] of Object.entries(byEmail)) {
  if (list.length > 1) {
    dupCount += list.length - 1
    console.log(`  ${email}  (${list.length} entries):`)
    for (const r of list) console.log(`    ${r.id}  status=${r.status}  pi=${r.stripe_payment_intent_id ?? 'null'}  created=${r.created_at}`)
  }
}
console.log(`  Total extra duplicate rows: ${dupCount}`)

// Pull Stripe PI status for each row that has a PI
console.log(`\n-- STATUS COMPARISON (DB vs Stripe) --`)
const mismatches = []
for (const r of rows) {
  if (!r.stripe_payment_intent_id) continue
  try {
    const pi = await stripeGet(`payment_intents/${r.stripe_payment_intent_id}`)
    let expectedStatus = r.status
    if (pi.status === 'succeeded') expectedStatus = 'approved'
    else if (pi.status === 'canceled') expectedStatus = 'declined'
    else if (pi.status === 'requires_capture') expectedStatus = 'payment_authorized'

    if (expectedStatus !== r.status) {
      mismatches.push({ row: r, piStatus: pi.status, expected: expectedStatus })
      console.log(`  ${r.email}  DB=${r.status}  Stripe=${pi.status}  → should be ${expectedStatus}`)
    }
  } catch (err) {
    console.log(`  ${r.email}  PI ${r.stripe_payment_intent_id} → ERROR: ${err.message.slice(0, 100)}`)
  }
}
console.log(`\nMismatches: ${mismatches.length}`)

console.log('\n=== PLAN ===')
console.log(`Would DELETE ${testRows.length} test entries`)
console.log(`Would DELETE ${dupCount} duplicate entries (keeping the most recent of each email)`)
console.log(`Would UPDATE ${mismatches.length} status mismatches`)
console.log('\nThis script only AUDITS. No changes made.')
