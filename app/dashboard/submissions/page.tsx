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
  source_table: 'form_submissions' | 'camp_applications' | 'vidyala_applications' | 'padel_registrations' | 'spn_submissions'
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  stripe_checkout_expires_at: string | null
  stripe_pi_status: string | null
  stripe_review_state: string | null
}

type OtherDashboardSubmission = {
  id: string
  source: string
  full_name: string
  email: string
  status: string
  details: string
  created_at: string
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


function buildPadelFormData(c: Record<string, unknown>): Record<string, unknown> {
  const excludedKeys = new Set([
    'id', 'initiative_id', 'created_at', 'updated_at', 'status', 'internal_notes', 'initiatives',
    'captain_phone_normalized',
  ])
  const orderedKeys = [
    'event_name',
    'captain_first_name', 'captain_last_name', 'captain_date_of_birth', 'captain_email', 'captain_phone',
    'city_country', 'playtomic_id', 'occupation', 'captain_gender', 'captain_playtomic_ranking', 'id_document_type', 'id_document_url',
    'player2_first_name', 'player2_last_name', 'player2_date_of_birth',
    'player2_phone', 'player2_playtomic_id', 'player2_occupation', 'player2_gender', 'player2_playtomic_ranking',
    'consent_email', 'consent_phone', 'consent_sms', 'consent_whatsapp',
    'entry_fee_pence', 'final_amount_pence',
    'page_url', 'source', 'medium',
  ]
  const entries = Object.entries(c).filter(([key, value]) => {
    if (excludedKeys.has(key)) return false
    if (key.startsWith('stripe_')) return false
    if (value == null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    return true
  })
  const byKey = new Map(entries)
  const ordered: [string, unknown][] = []
  for (const key of orderedKeys) {
    if (byKey.has(key)) { ordered.push([key, byKey.get(key)]); byKey.delete(key) }
  }
  for (const entry of byKey.entries()) ordered.push(entry)
  return Object.fromEntries(ordered)
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
    // Hard caps: max 10 pages (1000 PIs) and only PIs from last 18 months.
    // Prevents unbounded scans from blowing Vercel's function timeout.
    const eighteenMonthsAgoSec = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30 * 18
    for (let pageNum = 0; pageNum < 10; pageNum++) {
      const page = await stripe.paymentIntents.list({
        limit: 100,
        created: { gte: eighteenMonthsAgoSec },
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })
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
  } catch (e) {
    console.error('[submissions/fetchStripeStatusMap] Stripe lookup failed - returning empty map. Cause:', e)
    return new Map()
  }
}

async function getSubmissions() {
  const supabase = await createClient()

  // Fire all four DB queries in parallel; .limit() caps act as safety nets.
  const [initiativesRes, submissionsRes, campAppsRes, vidyalaAppsRes, padelRegsRes, spnSubsRes, interestRes, rootsRes, wolfRunFundraisersRes] = await Promise.all([
    supabase.from('initiatives').select('id, name, slug').eq('is_active', true).order('sort_order'),
    supabase.from('form_submissions').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('camp_applications').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('vidyala_applications').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('padel_registrations').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('spn_submissions').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('register_interest').select('*').order('created_at', { ascending: false }).limit(5000),
    supabase.from('roots_bookings').select('*').order('created_at', { ascending: false }).limit(5000),
    supabase.from('wolfrun_fundraisers').select('*').order('created_at', { ascending: false }).limit(5000),
  ])
  const initiatives = initiativesRes.data
  const submissions = submissionsRes.data
  const campApplications = campAppsRes.data
  const vidyalaApplications = vidyalaAppsRes.data
  const padelRegistrations = padelRegsRes.data
  const spnSubmissions = spnSubsRes.data
  const interestRegistrations = interestRes.data ?? []
  const rootsBookings = rootsRes.data ?? []
  const wolfRunFundraisers = wolfRunFundraisersRes.data ?? []

  // Only ask Stripe about apps with unknown status AND still active.
  // Approved/declined/withdrawn/archived already have final state in DB.
  const TERMINAL_STATUSES = new Set(['approved', 'withdrawn', 'declined', 'archived'])
  const appsNeedingStripe = (campApplications ?? []).filter((c: Record<string, unknown>) => {
    if ((c.stripe_pi_status as string | null) != null) return false
    if (TERMINAL_STATUSES.has(String(c.status ?? ''))) return false
    return !!(c.stripe_payment_intent_id || c.stripe_checkout_session_id || c.email)
  })
  // 5s budget. If Stripe is slow, render using DB-stored stripe_pi_status (webhook keeps it current).
  const stripeStatusMap = await Promise.race([
    fetchStripeStatusMap(
      appsNeedingStripe.map((c: Record<string, unknown>) => ({
        id: String(c.id),
        stripe_payment_intent_id: (c.stripe_payment_intent_id as string | null) ?? null,
        stripe_checkout_session_id: (c.stripe_checkout_session_id as string | null) ?? null,
        email: String(c.email ?? ''),
      }))
    ),
    new Promise<Map<string, string>>(resolve => setTimeout(() => {
      console.warn('[submissions] Stripe status lookup exceeded 5s budget - rendering with DB-only data')
      resolve(new Map())
    }, 5000)),
  ])

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

  const normalizedPadelRegs: DashboardSubmission[] = (padelRegistrations ?? []).map(
    (p: Record<string, unknown>) => {
      const fullName = [String(p.captain_first_name ?? '').trim(), String(p.captain_last_name ?? '').trim()]
        .filter(Boolean).join(' ') || 'Unknown'
      return {
        id: String(p.id),
        full_name: fullName,
        email: String(p.captain_email ?? ''),
        phone: (p.captain_phone as string | null) ?? null,
        message: `Padel registration — partner: ${[String(p.player2_first_name ?? ''), String(p.player2_last_name ?? '')].filter(Boolean).join(' ') || 'N/A'}`,
        form_data: buildPadelFormData(p),
        status: String(p.status ?? 'pending'),
        internal_notes: (p.internal_notes as string | null) ?? null,
        created_at: String(p.created_at ?? new Date().toISOString()),
        initiatives: (p.initiatives as { name: string; slug: string } | null) ?? { name: 'Sikh Padel Association', slug: 'sikh-padel-association' },
        source_table: 'padel_registrations' as const,
        stripe_payment_intent_id: (p.stripe_payment_intent_id as string | null) ?? null,
        stripe_checkout_session_id: (p.stripe_checkout_session_id as string | null) ?? null,
        stripe_checkout_expires_at: (p.stripe_checkout_expires_at as string | null) ?? null,
        stripe_pi_status: (p.stripe_pi_status as string | null) ?? null,
        stripe_review_state: (p.stripe_review_state as string | null) ?? null,
      }
    }
  )

  const webinarSignups = interestRegistrations.filter((registration: Record<string, unknown>) => registration.camp === 'vidyala-webinar')

  const normalizedSpnSubs: DashboardSubmission[] = (spnSubmissions ?? []).map(
    (s: Record<string, unknown>) => {
      const fullName = [String(s.first_name ?? '').trim(), String(s.last_name ?? '').trim()]
        .filter(Boolean).join(' ') || 'Unknown'
      const subType = String(s.submission_type ?? 'join')
      const baseFormData = (s.form_data as Record<string, unknown>) ?? {}
      return {
        id: String(s.id),
        full_name: fullName,
        email: String(s.email ?? ''),
        phone: (s.phone as string | null) ?? null,
        message: `SPN ${subType.replace(/_/g, ' ')} submission`,
        form_data: {
          submission_type: subType,
          newsletter_opt_in: s.newsletter_opt_in === true ? 'Yes' : 'No',
          ...baseFormData,
        },
        status: String(s.status ?? 'pending'),
        internal_notes: (s.internal_notes as string | null) ?? null,
        created_at: String(s.created_at ?? new Date().toISOString()),
        initiatives: (s.initiatives as { name: string; slug: string } | null) ?? { name: 'SPN', slug: 'spn' },
        source_table: 'spn_submissions' as const,
        stripe_payment_intent_id: null,
        stripe_checkout_session_id: null,
        stripe_checkout_expires_at: null,
        stripe_pi_status: null,
        stripe_review_state: null,
      }
    }
  )

  const unifiedSubmissions = [...formSubmissions, ...normalizedCampApps, ...normalizedVidyalaApps, ...normalizedSpnSubs, ...normalizedPadelRegs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const otherSubmissions: OtherDashboardSubmission[] = [
    ...interestRegistrations.filter((registration: Record<string, unknown>) => (registration.camp === 'vidyala-webinar') === false).map((registration: Record<string, unknown>) => ({
      id: String(registration.id), source: `Interest registration: ${String(registration.camp ?? 'Unknown')}`,
      full_name: String(registration.name ?? 'Unknown'), email: String(registration.email ?? ''), status: 'registered',
      details: [registration.country, registration.occupation, registration.schedule, registration.notes].filter((value) => typeof value === 'string' && value.trim() !== '').map(String).join(' | '),
      created_at: String(registration.created_at ?? new Date().toISOString()),
    })),
    ...rootsBookings.map((booking: Record<string, unknown>) => ({
      id: String(booking.id), source: 'Roots booking', full_name: `${String(booking.camper_first_name ?? '').trim()} ${String(booking.camper_last_name ?? '').trim()}`.trim() || 'Unknown',
      email: String(booking.parent_email ?? ''), status: String(booking.status ?? 'pending'),
      details: [booking.parent_relationship, booking.payment_status ? `Payment: ${String(booking.payment_status)}` : null].filter((value) => typeof value === 'string' && value.trim() !== '').map(String).join(' | '),
      created_at: String(booking.created_at ?? new Date().toISOString()),
    })),
    ...wolfRunFundraisers.map((fundraiser: Record<string, unknown>) => ({
      id: String(fundraiser.id), source: 'Wolf Run fundraiser', full_name: `${String(fundraiser.first_name ?? '').trim()} ${String(fundraiser.last_name ?? '').trim()}`.trim() || 'Unknown',
      email: String(fundraiser.email ?? ''), status: String(fundraiser.status ?? 'active'), details: `Pack: ${String(fundraiser.pack ?? 'Unknown')}`,
      created_at: String(fundraiser.created_at ?? new Date().toISOString()),
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return {
    initiatives: initiatives ?? [],
    submissions: unifiedSubmissions,
    webinarSignups: webinarSignups as Array<{
      id: string; name: string; email: string; country: string | null; notes: string | null; created_at: string
    }>,
    otherSubmissions,
  }
}

export default async function SubmissionsPage() {
  const [{ initiatives, submissions, webinarSignups, otherSubmissions }, recentActivity] = await Promise.all([
    getSubmissions(),
    getRecentCampActivity(60).catch((e) => {
      console.error('[submissions] getRecentCampActivity failed - hiding activity panel:', e)
      return [] as ActivityLogEntry[]
    }),
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
        <TabsList className="h-auto bg-transparent p-0 flex flex-wrap gap-3 mb-2">
          <TabsTrigger
            value="all"
            className="group flex-col items-start gap-0.5 h-auto px-4 py-3 min-w-[90px] rounded-xl border border-border bg-card text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:border-primary/50 hover:bg-muted/60"
          >
            <span className="text-lg font-bold leading-none">{allSubmissions.length}</span>
            <span className="text-[11px] font-medium leading-none opacity-70">All</span>
          </TabsTrigger>
          {initiatives.map((init) => {
            const count = groupedByInitiative[init.slug]?.length || 0
            return (
              <TabsTrigger
                key={init.slug}
                value={init.slug}
                className="group flex-col items-start gap-0.5 h-auto px-4 py-3 min-w-[90px] rounded-xl border border-border bg-card text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:border-primary/50 hover:bg-muted/60"
              >
                <span className="text-lg font-bold leading-none">{count}</span>
                <span className="text-[11px] font-medium leading-none opacity-70 line-clamp-1 max-w-[120px]">{init.name}</span>
              </TabsTrigger>
            )
          })}
          {generalSubmissions.length > 0 && (
            <TabsTrigger
              value="__general"
              className="group flex-col items-start gap-0.5 h-auto px-4 py-3 min-w-[90px] rounded-xl border border-border bg-card text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:border-primary/50 hover:bg-muted/60"
            >
              <span className="text-lg font-bold leading-none">{generalSubmissions.length}</span>
              <span className="text-[11px] font-medium leading-none opacity-70">General / Contact</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="__other" className="group flex-col items-start gap-0.5 h-auto px-4 py-3 min-w-[90px] rounded-xl border border-border bg-card text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:border-primary/50 hover:bg-muted/60">
            <span className="text-lg font-bold leading-none">{otherSubmissions.length}</span>
            <span className="text-[11px] font-medium leading-none opacity-70">Other Website Forms</span>
          </TabsTrigger>
          <TabsTrigger
            value="__webinar"
            className="group flex-col items-start gap-0.5 h-auto px-4 py-3 min-w-[90px] rounded-xl border border-border bg-card text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:border-primary/50 hover:bg-muted/60"
          >
            <span className="text-lg font-bold leading-none">{webinarSignups.length}</span>
            <span className="text-[11px] font-medium leading-none opacity-70">Webinar Signups</span>
          </TabsTrigger>
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

        <TabsContent value="__other" className="mt-4">
          {otherSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No other website submissions yet.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="bg-muted/50 text-left"><th className="px-4 py-3 font-semibold text-foreground">Name</th><th className="px-4 py-3 font-semibold text-foreground">Source</th><th className="px-4 py-3 font-semibold text-foreground">Email</th><th className="px-4 py-3 font-semibold text-foreground">Status</th><th className="px-4 py-3 font-semibold text-foreground">Details</th><th className="px-4 py-3 font-semibold text-foreground">Submitted</th></tr></thead>
                <tbody className="divide-y divide-border">{otherSubmissions.map((submission) => (<tr key={`${submission.source}-${submission.id}`} className="hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-medium text-foreground">{submission.full_name}</td><td className="px-4 py-3 text-muted-foreground">{submission.source}</td><td className="px-4 py-3"><a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">{submission.email}</a></td><td className="px-4 py-3 text-muted-foreground">{submission.status}</td><td className="px-4 py-3 text-muted-foreground max-w-xs break-words">{submission.details || '—'}</td><td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">{new Date(submission.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="__webinar" className="mt-4">
          {webinarSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No webinar signups yet.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Country</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Notes</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {webinarSignups.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">{s.email}</a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.country ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.notes ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">
                        {new Date(s.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
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
