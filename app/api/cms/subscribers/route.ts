import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { unsubscribeToken } from '@/lib/newsletter-unsubscribe'
import { cmsService } from '@/lib/cms/service'

class SubscriberError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

async function subscriberContext() {
  const context = await getRequestStaff()
  if (context.authError || !context.user) throw new SubscriberError('Please sign in again.', 401)
  if (context.profile.error || context.grants.error || !context.profile.data || !Array.isArray(context.grants.data)) {
    throw new SubscriberError('Subscriber access could not be verified. Please retry.', 503)
  }
  const role = context.profile.data.role
  if (!['admin', 'super_admin'].includes(role) && !(role === 'staff' && context.grants.data.some(grant => grant.programme === 'newsletter'))) {
    throw new SubscriberError('This account cannot manage newsletter subscribers.', 403)
  }
  return { ...context, user: context.user }
}

const change = z.object({
  id: z.string().uuid(), status: z.enum(['active', 'unsubscribed']), expectedStatus: z.enum(['active', 'unsubscribed']),
}).strict()
const filters = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  q: z.string().trim().max(100).default(''),
  status: z.enum(['all', 'active', 'unsubscribed']).default('all'),
  consent: z.enum(['all', 'recorded', 'unknown']).default('all'),
  source: z.enum(['all', 'website', 'legacy']).default('all'),
  export: z.literal('csv').optional(),
})

function failure(error: unknown) {
  if (error instanceof SubscriberError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  console.error('[newsletter] Subscriber operation failed')
  return NextResponse.json({ error: 'Subscribers could not be updated or loaded. Please retry.' }, { status: 503 })
}

export async function GET(request: Request) {
  try {
    const { client } = await subscriberContext()
    const parsed = filters.safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if (!parsed.success) throw new SubscriberError('Choose valid subscriber filters.', 400)
    const input = parsed.data
    let query = client.from('newsletter_subscriptions')
      .select('id,email,name,source,created_at,status,subscribed_at,unsubscribed_at,consent_at,consent_statement', { count: 'exact' })
      .order('created_at', { ascending: false })
    if (input.q) query = query.ilike('email', `%${input.q.replace(/[%_]/g, '')}%`)
    if (input.status !== 'all') query = query.eq('status', input.status)
    if (input.source !== 'all') query = query.eq('source', input.source)
    if (input.consent === 'recorded') query = query.not('consent_at', 'is', null)
    if (input.consent === 'unknown') query = query.is('consent_at', null)
    query = input.export ? query.limit(10000) : query.range((input.page - 1) * 25, input.page * 25 - 1)
    const { data, error, count } = await query
    if (error) throw error
    if (input.export) {
      if (count === null) throw new SubscriberError('Export size could not be verified. Please retry.', 503)
      if (count > 10000) throw new SubscriberError('More than 10,000 subscribers match. Refine your filters before exporting.', 413)
      const cell = (value: unknown) => '"' + String(value ?? '').replace(/^[\s]*[=+@-]/, "'$&").replace(/"/g, '""') + '"'
      const rows = (data ?? []).map(row => [
        row.email, row.name, row.status, row.source, row.created_at, row.subscribed_at, row.consent_at, row.consent_statement, row.unsubscribed_at,
        `${new URL(request.url).origin}/unsubscribe?token=${unsubscribeToken(row.id, row.email)}`,
      ].map(cell).join(','))
      return new NextResponse('\ufeff' + ['Email,Name,Status,Source,Record created,Subscribed,Consent recorded,Consent statement,Unsubscribed,Unsubscribe URL', ...rows].join('\r\n'), {
        headers: { 'Content-Type': 'text/csv;charset=utf-8', 'Content-Disposition': 'attachment; filename="devanhaar-subscribers.csv"', 'Cache-Control': 'private,no-store' },
      })
    }
    return NextResponse.json({ rows: data ?? [], total: count ?? 0, page: input.page }, { headers: { 'Cache-Control': 'private,no-store' } })
  } catch (error) { return failure(error) }
}

export async function PATCH(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Use the subscriber workspace.' }, { status: 403 })
  try {
    const { client, user } = await subscriberContext()
    const raw = await request.text()
    if (raw.length > 2000) throw new SubscriberError('Request too large.', 413)
    const input = change.safeParse(JSON.parse(raw))
    if (!input.success) throw new SubscriberError('Choose a valid subscriber and status.', 400)
    const { id, status, expectedStatus } = input.data
    if (status === 'active') throw new SubscriberError('A person must subscribe again themselves to restore newsletter consent.', 409)
    const { data, error } = await client.from('newsletter_subscriptions').update({ status, unsubscribed_at: new Date().toISOString() })
      .eq('id', id).eq('status', expectedStatus).select('id').maybeSingle()
    if (error) throw error
    if (!data) throw new SubscriberError('This subscriber changed. Reload before continuing.', 409)
    let activityError: unknown
    try {
      const result = await cmsService().from('activity_log').insert({
        admin_id: user.id, action: 'Unsubscribed newsletter contact', entity_type: 'newsletter_subscription', entity_id: id,
      })
      activityError = result.error
    } catch (error) { activityError = error }
    if (activityError) {
      console.error('[newsletter] Consent withdrawn, but activity logging failed')
      return NextResponse.json({ success: true, warning: 'Consent was withdrawn, but the activity log could not be updated.' })
    }
    return NextResponse.json({ success: true })
  } catch (error) { return failure(error) }
}
