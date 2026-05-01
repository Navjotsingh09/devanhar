import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const expected = process.env.DM_EXPORT_TOKEN
  if (!expected) {
    return NextResponse.json(
      { error: 'DM_EXPORT_TOKEN not configured on server' },
      { status: 500 }
    )
  }

  const url = new URL(request.url)
  const headerToken = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    .trim()
  const queryToken = url.searchParams.get('token')?.trim()
  const provided = headerToken || queryToken

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase env vars missing' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  let query = supabase
    .from('camp_applications')
    .select(
      'id, first_name, last_name, email, phone, address_line_1, address_line_2, address_line_3, city, postcode, country, gift_aid, stripe_payment_intent_id, stripe_checkout_session_id, stripe_checkout_amount_pence, stripe_subscription_id, status, created_at, updated_at, initiatives(name)'
    )
    .in('status', ['approved', 'paid'])
    .not('stripe_payment_intent_id', 'is', null)
    .order('updated_at', { ascending: false })

  const since = url.searchParams.get('since')
  if (since) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
      return NextResponse.json(
        { error: 'since must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }
    query = query.gte('updated_at', `${since}T00:00:00Z`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []

  const headers = [
    'Date',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Amount',
    'Currency',
    'Reference',
    'Description',
    'Gift Aid',
    'Address Line 1',
    'Address Line 2',
    'City',
    'Postcode',
    'Country',
    'Stripe Payment Intent',
    'Stripe Checkout Session',
    'Application Status',
  ]

  const escape = (val: unknown): string => {
    if (val == null) return ''
    const s = String(val)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const csvRows = rows.map((r) => {
    const initiative = (r.initiatives as { name?: string } | null)?.name ?? ''
    const amountGbp =
      typeof r.stripe_checkout_amount_pence === 'number'
        ? (r.stripe_checkout_amount_pence / 100).toFixed(2)
        : ''
    const dateIso = (r.updated_at || r.created_at || '').slice(0, 10)
    const fields = [
      dateIso,
      r.first_name ?? '',
      r.last_name ?? '',
      r.email ?? '',
      r.phone ?? '',
      amountGbp,
      'GBP',
      r.id,
      initiative ? `${initiative} application` : 'Camp application',
      r.gift_aid ? 'Yes' : 'No',
      r.address_line_1 ?? '',
      [r.address_line_2, r.address_line_3].filter(Boolean).join(', '),
      r.city ?? '',
      r.postcode ?? '',
      r.country ?? '',
      r.stripe_payment_intent_id ?? '',
      r.stripe_checkout_session_id ?? '',
      r.status ?? '',
    ]
    return fields.map(escape).join(',')
  })

  const csv = '\ufeff' + [headers.join(','), ...csvRows].join('\n')
  const filename = `devanhaar-donations-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Row-Count': String(rows.length),
    },
  })
}
