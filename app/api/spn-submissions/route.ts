// ============================================================================
// POST /api/spn-submissions
// ----------------------------------------------------------------------------
// Public, cross-origin endpoint that receives form submissions from the SPN
// website (sikhpn.org / sikhpn.vercel.app) and stores them in the
// spn_submissions table, tagged to the existing 'spn' initiative. Mirrors the
// vidyala-applications route. Sends an applicant confirmation + internal team
// notification via Resend (non-blocking).
//
// CORS: only the SPN origins (+ localhost for testing) are allowed. No other
// Devanhaar API route is affected — CORS headers are scoped to this file.
// Inserts use the Supabase service-role key (server-only, never exposed).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSpnConfirmationEmail, sendSpnInternalNotification } from '@/lib/spn-emails'

const ALLOWED_ORIGINS = new Set<string>([
  'https://sikhpn.org',
  'https://www.sikhpn.org',
  'https://sikhpn.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
])

function corsHeaders(origin: string | null): Record<string, string> {
  // Reflect the request origin only if it's allow-listed; otherwise fall back
  // to the primary SPN domain (so a browser won't accept a disallowed origin).
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://sikhpn.org'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role credentials')
  return createClient(url, key)
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_TYPES = new Set(['join', 'advisor', 'grad_award', 'event'])

// Reject strings that contain 2+ consecutive junk characters — same rule as
// the browser-side check in forms.js so the server is the authoritative gate.
const JUNK_RE = /[!@#$%^*~|<>{}\[\]]{2,}/
function isJunk(val: unknown): boolean {
  if (typeof val !== 'string') return false
  return JUNK_RE.test(val)
}

// Keys we map to dedicated columns or that are Web3Forms plumbing — everything
// else goes into form_data so nothing the SPN forms send is ever lost.
const RESERVED = new Set([
  'submission_type', 'first_name', 'firstName', 'last_name', 'lastName',
  'full_name', 'fullName', 'name', 'email', 'phone', 'page_url', 'source', 'medium',
  'newsletter', 'newsletter_opt_in', 'nlNewsletterOptIn',
  'access_key', 'botcheck', 'from_name', 'subject', 'replyto', 'redirect',
])

function truthy(v: unknown): boolean {
  return v === true || v === 'yes' || v === 'Yes' || v === 'on' || v === 'true' || v === '1'
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get('origin'))
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers })
    }

    const submissionType = VALID_TYPES.has(String(body.submission_type))
      ? String(body.submission_type)
      : 'join'

    const email = String(body.email ?? body.nominator_email ?? body.nominee_email ?? '').trim().toLowerCase()
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400, headers })
    }

    // Resolve names from whatever the form sent (first/last, firstName/lastName,
    // or a single full_name/name field).
    let firstName = String(body.first_name ?? body.firstName ?? '').trim()
    let lastName = String(body.last_name ?? body.lastName ?? '').trim()
    const fullNameRaw = String(body.full_name ?? body.fullName ?? body.name ?? body.nominator_name ?? '').trim()
    if (!firstName && fullNameRaw) {
      const parts = fullNameRaw.split(/\s+/)
      firstName = parts[0]
      lastName = lastName || parts.slice(1).join(' ')
    }

    const phone = body.phone ? String(body.phone).trim() : null

    // Reject junk/garbage input (e.g. "!@#$%^&*") in any text field.
    const textFieldsToCheck: unknown[] = [firstName, lastName, phone,
      body.sector, body.role, body.location, body.areaSupport,
      body.shortBio, body.motivation, body.message,
    ]
    if (textFieldsToCheck.some(isJunk)) {
      return NextResponse.json(
        { error: 'Submission contains invalid characters. Please use letters and numbers only.' },
        { status: 422, headers },
      )
    }

    // Everything else -> form_data
    const formData: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(body)) {
      if (RESERVED.has(k)) continue
      if (v === null || v === undefined || v === '') continue
      formData[k] = v
    }

    const newsletterOptIn = truthy(body.newsletter) || truthy(body.newsletter_opt_in) || truthy(body.nlNewsletterOptIn)

    const supabase = getSupabaseAdmin()

    // Resolve the existing 'spn' initiative so rows group under its dashboard tab.
    const { data: initiative } = await supabase
      .from('initiatives')
      .select('id')
      .eq('slug', 'spn')
      .single()

    const insertRow = {
      initiative_id: initiative?.id ?? null,
      submission_type: submissionType,
      first_name: firstName || null,
      last_name: lastName || null,
      email,
      phone,
      form_data: formData,
      newsletter_opt_in: newsletterOptIn,
      page_url: body.page_url ? String(body.page_url) : null,
      source: body.source ? String(body.source) : 'SPN',
      medium: body.medium ? String(body.medium) : null,
      status: 'pending',
    }

    const { data, error } = await supabase
      .from('spn_submissions')
      .insert(insertRow)
      .select('id')
      .single()

    if (error) {
      console.error('[spn-submissions] insert error:', error)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500, headers })
    }

    // Activity log (best-effort, non-blocking)
    try {
      await supabase.from('activity_log').insert({
        entity_type: 'spn_submission',
        entity_id: String(data.id),
        action: `New SPN ${submissionType} submission from ${[firstName, lastName].filter(Boolean).join(' ') || fullNameRaw || email} <${email}>`,
      })
    } catch (e) {
      console.warn('[spn-submissions] activity_log insert skipped:', e)
    }

    // Emails — never block the response on delivery.
    await Promise.allSettled([
      sendSpnConfirmationEmail({ to: email, firstName: firstName || 'there', submissionType }),
      sendSpnInternalNotification({
        submissionId: data.id,
        submissionType,
        data: { ...insertRow, ...formData },
      }),
    ])

    return NextResponse.json({ success: true, id: data.id }, { status: 201, headers })
  } catch (err) {
    console.error('[spn-submissions] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers })
  }
}
