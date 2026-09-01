import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { createInterface } from 'node:readline'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeExport = process.argv[2] || `${process.env.HOME}/Downloads/unified_payments.csv`
const donationManagerExport = process.argv[3] || `${process.env.HOME}/Downloads/donations-01092026101253-8vv3d9uza915x0j0e61e.csv`

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set the replacement NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running this script.')
}

if (!supabaseUrl.includes('kawjcikusbqqxyczibul.supabase.co')) {
  throw new Error('Refusing to import recovery data into a project other than DEVANHAAR1.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += char
    }
  }
  values.push(value)
  return values
}

async function readCsv(path) {
  await access(path)
  const rows = []
  const lines = createInterface({ input: createReadStream(path, { encoding: 'utf8' }), crlfDelay: Infinity })
  let headers = null

  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvLine(line).map((header) => header.replace(/^\uFEFF/, ''))
      continue
    }
    if (!line.trim()) continue
    const values = parseCsvLine(line)
    rows.push(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
  }
  return rows
}

function emptyToNull(value) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function linkedStripeRecord(row) {
  const columns = [
    ['day_pass_booking', row['day_pass_booking_id (metadata)']],
    ['family_retreat_booking', row['family_retreat_booking_id (metadata)']],
    ['padel_registration', row['padel_registration_id (metadata)']],
    ['camp_application', row['camp_application_id (metadata)']],
  ]
  return columns.find(([, id]) => emptyToNull(id)) || [null, null]
}

function parseDonationManagerDate(value) {
  if (!value) return null
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!match) return null
  const [, day, month, year, hour, minute] = match
  return `${year}-${month}-${day}T${hour}:${minute}:00Z`
}

function cleanMetadata(metadata) {
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => emptyToNull(value)))
}

async function upsertInBatches(records) {
  for (let offset = 0; offset < records.length; offset += 100) {
    const { error } = await supabase
      .from('recovery_payment_ledger')
      .upsert(records.slice(offset, offset + 100), { onConflict: 'source,source_record_id' })
    if (error) throw error
  }
}

const stripeRows = await readCsv(stripeExport)
const donationManagerRows = await readCsv(donationManagerExport)

const stripeRecords = stripeRows
  .filter((row) => emptyToNull(row.id))
  .map((row) => {
    const [linkedRecordType, linkedRecordId] = linkedStripeRecord(row)
    return {
      source: 'stripe',
      source_record_id: row.id,
      occurred_at: emptyToNull(row['Created date (UTC)'])?.replace(' ', 'T') + 'Z',
      amount: Number(row.Amount || 0),
      currency: emptyToNull(row.Currency)?.toUpperCase(),
      payment_status: emptyToNull(row.Status),
      description: emptyToNull(row.Description) || emptyToNull(row['Checkout Line Item Summary']),
      customer_name: emptyToNull(row['Card Name']) || emptyToNull(row['Shipping Name']),
      customer_email: emptyToNull(row['Customer Email']),
      customer_phone: emptyToNull(row['Customer Phone']),
      payment_reference: emptyToNull(row['PaymentIntent ID']) || emptyToNull(row.id),
      checkout_session_id: emptyToNull(row['Checkout Session ID']),
      payment_intent_id: emptyToNull(row['PaymentIntent ID']),
      linked_record_type: linkedRecordType,
      linked_record_id: emptyToNull(linkedRecordId) || emptyToNull(row['Client Reference ID']),
      metadata: cleanMetadata({ payment_link_id: row['Payment Link ID'] }),
    }
  })

const donationManagerRecords = donationManagerRows
  .filter((row) => emptyToNull(row['Donation Ref']))
  .map((row) => ({
    source: 'donation_manager',
    source_record_id: row['Donation Ref'],
    occurred_at: parseDonationManagerDate(row['Donation Date']),
    amount: Number(row['Donation Amount Original'] || 0),
    currency: emptyToNull(row['Donation Currency']),
    payment_status: 'recorded',
    description: emptyToNull(row['Donation Item Name']) || emptyToNull(row['Appeal Name']),
    customer_name: [row['Donor Forename'], row['Donor Surname']].map(emptyToNull).filter(Boolean).join(' ') || null,
    customer_email: emptyToNull(row['Donor Email']),
    customer_phone: emptyToNull(row['Donor Telephone']) || emptyToNull(row['Donor Mobile']),
    payment_reference: emptyToNull(row['Charity Donation Ref']) || row['Donation Ref'],
    linked_record_type: 'donation',
    linked_record_id: row['Donation Ref'],
    metadata: cleanMetadata({
      donation_source: row['Donation Source'],
      payment_provider: row['Payment Provider'],
      appeal_name: row['Appeal Name'],
      checkout_key: row['NowDonate Checkout Key'],
      checkout_name: row['NowDonate Checkout Name'],
      gift_aid_amount: row['Gift Aid Amount (?)'],
      repeat_donation: row['Repeat Donation'],
    }),
  }))

await upsertInBatches([...stripeRecords, ...donationManagerRecords])
console.log(`Imported ${stripeRecords.length} Stripe and ${donationManagerRecords.length} Donation Manager records into recovery_payment_ledger.`)
