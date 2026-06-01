import { createClient } from '@/lib/supabase/server'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Stripe from 'stripe'
import { getRecentCampActivity } from '@/app/dashboard/submissions/actions'
import type { ActivityLogEntry } from '@/app/dashboard/submissions/actions'

type Initiative = {
  id: string
  name: string
  slug: string
}

type DashboardSubmission = {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string | null
  form_data: Record<string, unknown>
  status: string
  internal_notes: string | null
  created_at: string
  initiatives: { name: string; slug: string } | null
  source_table: 'form_submissions' | 'camp_applications' | 'vidyala_applications'
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  stripe_checkout_expires_at: string | null
  stripe_pi_status: string | null
  stripe_review_state: string | null
}

function buildCampFormData(c: Record<string, unknown>): Record<string, unknown> {
  const excludedKeys = new Set([
    'id',
    'initiative_id',
    'created_at',
    'updated_at',
    'status',
    'internal_notes',
    'initiatives',
  ])

  const orderedKeys = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'date_of_birth',
    'age_at_camp',
    'university',
    'occupation',
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'city',
    'postcode',
    'country',
    'emergency_contact_name',
    'emergency_contact_relationship',
    'emergency_contact_phone',
    'under_18_consent',
    'dietary_requirements',
    'medical_requirements',
    'allergies',
    'other_allergy',
    'carries_epipen',
    'id_document_type',
    'id_document_url',
    'travel_method',
    'own_transport_type',
    'requires_payment_support',
    'payment_support_details',
    'room_preference',
    'heard_about_camp',
    'first_residential_camp',
    'been_to_singhs_camp_before',
    'previous_camps',
    'sikhi_knowledge_level',
    'takeaway_from_camp',
    'bjj_interest',
    'bjj_fought_professionally',
    'bjj_sport_preference',
    'is_sevadaar',
    'sevadaar_verified',
    'consent_email',
    'consent_phone',
    'consent_sms',
    'consent_whatsapp',
    'gift_aid',
    'donation_amount',
    'monthly_donation_opted',
    'monthly_donation_amount',
    'phone_normalized',
    'page_url',
    'source',
    'medium',
  ]

  const normalizedEntries = Object.entries(c).filter(([key, value]) => {
    if (excludedKeys.has(key)) return false
    if (value == null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    return true
  })

  const byKey = new Map(normalizedEntries)
  const ordered: [string, unknown][] = []

  for (const key of orderedKeys) {
    if (byKey.has(key)) {
      ordered.push([key, byKey.get(key)])
      byKey.delete(key)
    }
  }

  for (const entry of byKey.entries()) {
    ordered.push(entry)
  }

  return Object.fromEntries(ordered)
}

function buildVidyalaFormData(c: Record<string, unknown>): Record<string, unknown> {
  const excludedKeys = new Set([
    'id', 'initiative_id', 'created_at', 'updated_at', 'status', 'internal_notes', 'initiatives',
  ])
  return Object.fromEntries(
    Object.entries(c).filter(([key, value]) => {
      if (excludedKeys.has(key)) return false
      if (value == null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    })
  )
}


async function fetchStripeStatusMap(
  apps: Array<{ id: string; stripe_payment_intent_id: string | null; stripe_checkout_session_id: string | null; email: string }>
): Promise<Map<string, string>> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || apps.length === 0) return new Map()
  try {
    const stripe = new Stripe(stripeKey)
    const allPIs: Stripe.PaymentIntent[] = []
    let startingAfter: string | undefined
    while (true) {
      const page = await stripe.paymentIntents.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      allPIs.push(...page.data)
      if (!page.has_more) break
      startingAfter = page.data[page.data.length - 1].id
    }
    const piById = new Map(allPIs.map(pi => [pi.id, pi]))
    const piByAppId = new Map<string, Stripe.PaymentIntent>()
    const piByEmail = new Map<string, Stripe.PaymentIntent[]>()
    for (const pi of allPIs) {
      const appId = pi.metadata?.camp_application_id
      if (appId && !piByAppId.has(appId)) piByAppId.set(appId, pi)
      const email = pi.receipt_email ?? pi.metadata?.email
      if (email) {
        const existing = piByEmail.get(email)
        existing ? existing.push(pi) : piByEmail.set(email, [pi])
      }
    }
    const result = new Map<string, string>()
    const sessionCache = new Map<string, Stripe.PaymentIntent | null>()
    for (const app of apps) {
      let pi: Stripe.PaymentIntent | null = null
      if (app.stripe_payment_intent_id) pi = piById.get(app.stripe_payment_intent_id) ?? null
      if (pi === null && app.stripe_checkout_session_id) {
        if (sessionCache.has(app.stripe_checkout_session_id)) {
          pi = sessionCache.get(app.stripe_checkout_session_id) ?? null
        } else {
          try {
            const session = await stripe.checkout.sessions.retrieve(app.stripe_checkout_session_id)
            if (session.payment_intent && typeof session.payment_intent === 'string') {
              pi = piById.get(session.payment_intent) ?? await stripe.paymentIntents.retrieve(session.payment_intent)
              sessionCache.set(app.stripe_checkout_session_id, pi as Stripe.PaymentIntent)
            } else { sessionCache.set(app.stripe_checkout_session_id, null) }
          } catch { sessionCache.set(app.stripe_checkout_session_id, null) }
        }
      }
      if (pi === null) pi = piByAppId.get(app.id) ?? null
      if (pi === null && app.email) {
        const emailPIs = piByEmail.get(app.email) ?? []
        if (emailPIs.length > 0) {
          const order = ['succeeded', 'requires_capture']
          pi = [...emailPIs].sort((a, b) => {
            const ai = order.indexOf(a.status) === -1 ? 99 : order.indexOf(a.status)
            const bi = order.indexOf(b.status) === -1 ? 99 : order.indexOf(b.status)
            return ai !== bi ? ai - bi : b.created - a.created
          })[0]
        }
      }
      if (pi) result.set(app.id, pi.status)
    }
    return result
  } catch {
    return new Map()
  }
}

async function getSubmissions() {
  const supabase = await createClient()

  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')

  const { data: submissions } = await supabase
    .from('form_submissions')
    .select('*, initiatives(name, slug)')
    .order('created_at', { ascending: false })

  const { data: campApplications } = await supabase
    .from('camp_applications')
    .select('*, initiatives(name, slug)')
    .order('created_at', { ascending: false })

  const { data: vidyalaApplications } = await supabase
    .from('vidyala_applications')
    .select('*, initiatives(name, slug)')
    .order('created_at', { ascending: false })

  const stripeStatusMap = await fetchStripeStatusMap(
    (campApplications ?? []).map(c => ({
      id: String(c.id),
      stripe_payment_intent_id: (c.stripe_payment_intent_id as string | null) ?? null,
      stripe_checkout_session_id: (c.stripe_checkout_session_id as string | null) ?? null,
      email: String(c.email ?? ''),
    }))
  )

  const formSubmissions: DashboardSubmission[] = (submissions ?? []).map(
    (s: Record<string, unknown>) => ({
      id: String(s.id),
      full_name: String(s.full_name ?? 'Unknown'),
      email: String(s.email ?? ''),
      phone: (s.phone as string | null) ?? null,
      message: (s.message as string | null) ?? null,
      form_data: (s.form_data as Record<string, unknown>) ?? {},
      status: String(s.status ?? 'new'),
      internal_notes: (s.internal_notes as string | null) ?? null,
      created_at: String(s.created_at ?? new Date().toISOString()),
      initiatives: (s.initiatives as { name: string; slug: string } | null) ?? null,
      source_table: 'form_submissions',
      stripe_payment_intent_id: null,
      stripe_checkout_session_id: null,
      stripe_checkout_expires_at: null,
      stripe_pi_status: null,
      stripe_review_state: null,
    })
  )

  const normalizedCampApps: DashboardSubmission[] = (campApplications ?? []).map(
    (c: Record<string, unknown>) => {
      const fullName = `${String(c.first_name ?? '').trim()} ${String(c.last_name ?? '').trim()}`
        .trim() || 'Unknown'

      return {
        id: String(c.id),
        full_name: fullName,
        email: String(c.email ?? ''),
        phone: (c.phone as string | null) ?? null,
        message: `Camp application submitted${c.takeaway_from_camp ? `: ${String(c.takeaway_from_camp)}` : ''}`,
        form_data: buildCampFormData(c),
        status: String(c.status ?? 'pending'),
        internal_notes: (c.internal_notes as string | null) ?? null,
        created_at: String(c.created_at ?? new Date().toISOString()),
        initiatives: (c.initiatives as { name: string; slug: string } | null) ?? null,
        source_table: 'camp_applications',
        stripe_payment_intent_id: (c.stripe_payment_intent_id as string | null) ?? null,
        stripe_checkout_session_id: (c.stripe_checkout_session_id as string | null) ?? null,
        stripe_checkout_expires_at: (c.stripe_checkout_expires_at as string | null) ?? null,
        stripe_pi_status: stripeStatusMap.get(String(c.id)) ?? (c.stripe_pi_status as string | null) ?? null,
        stripe_review_state: (c.stripe_review_state as string | null) ?? null,
      }
    }
  )


  const normalizedVidyalaApps: DashboardSubmission[] = (vidyalaApplications ?? []).map(
    (v: Record<string, unknown>) => {
      const fullName = [String(v.first_name ?? '').trim(), String(v.last_name ?? '').trim()]
        .filter(Boolean).join(' ') || 'Unknown'
      return {
        id: String(v.id),
        full_name: fullName,
        email: String(v.email ?? ''),
        phone: (v.phone as string | null) ?? null,
        message: 'Vidyala application submitted',
        form_data: buildVidyalaFormData(v),
        status: String(v.status ?? 'pending'),
        internal_notes: (v.internal_notes as string | null) ?? null,
        created_at: String(v.created_at ?? new Date().toISOString()),
        initiatives: (v.initiatives as { name: string; slug: string } | null) ?? { name: 'Sikhi Vidyala', slug: 'sikhi-vidyala' },
        source_table: 'vidyala_applications' as const,
        stripe_payment_intent_id: null,
        stripe_checkout_session_id: null,
        stripe_checkout_expires_at: null,
        stripe_pi_status: null,
        stripe_review_state: null,
      }
    }
  )

  const unifiedSubmissions = [...formSubmissions, ...normalizedCampApps, ...normalizedVidyalaApps].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return {
    initiatives: initiatives ?? [],
    submissions: unifiedSubmissions,
  }
}

export default async function SubmissionsPage() {
  const [{ initiatives, submissions }, recentActivity] = await Promise.all([
    getSubmissions(),
    getRecentCampActivity(60).catch(() => [] as ActivityLogEntry[]),
  ])

  const allSubmissions = submissions
  const groupedByInitiative = (initiatives as Initiative[]).reduce((acc, init) => {
    acc[init.slug] = submissions.filter((s: DashboardSubmission) => s.initiatives?.slug === init.slug)
    return acc
  }, {} as Record<string, typeof submissions>)
  const generalSubmissions = submissions.filter((s: DashboardSubmission) => !s.initiatives?.slug)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submissions</h1>
        <p className="text-muted-foreground">Manage form submissions from all projects</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">
            All ({allSubmissions.length})
          </TabsTrigger>
          {initiatives.map((init) => {
            const count = groupedByInitiative[init.slug]?.length || 0
            return (
              <TabsTrigger key={init.slug} value={init.slug} className="text-xs">
                {init.name} ({count})
              </TabsTrigger>
            )
          })}
          {generalSubmissions.length > 0 && (
            <TabsTrigger value="__general" className="text-xs">
              General / Contact ({generalSubmissions.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <SubmissionsTable submissions={allSubmissions} />
        </TabsContent>

        {initiatives.map((init) => (
          <TabsContent key={init.slug} value={init.slug} className="mt-4">
            <SubmissionsTable submissions={groupedByInitiative[init.slug] || []} />
          </TabsContent>
        ))}

        {generalSubmissions.length > 0 && (
          <TabsContent value="__general" className="mt-4">
            <SubmissionsTable submissions={generalSubmissions} />
          </TabsContent>
        )}
      </Tabs>

      {recentActivity.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3 text-foreground">Recent activity</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border text-sm max-h-[420px] overflow-y-auto">
            {recentActivity.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 mt-0.5 w-32">
                  {new Date(entry.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-foreground flex-1 break-words">{entry.action}</span>
                {entry.entity_id && (
                  <span className="text-xs text-muted-foreground shrink-0">#{entry.entity_id}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
