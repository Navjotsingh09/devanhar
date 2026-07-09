import { createClient } from '@/lib/supabase/server'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Stripe from 'stripe'
import { getRecentCampActivity } from '@/app/dashboard/submissions/actions'
import type { ActivityLogEntry } from '@/app/dashboard/submissions/actions'
import Link from 'next/link'

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

type DepartmentKey = 'all' | 'camps' | 'courses' | 'events' | 'projects' | 'general'

type SubmissionCatalogEntry = {
  value: string
  title: string
  description: string
  department: DepartmentKey
  category: string
  subcategory: string
  submissions: DashboardSubmission[]
  sourceSummary: string[]
}

const DEPARTMENT_META: Record<Exclude<DepartmentKey, 'all'>, { label: string; description: string }> = {
  camps: {
    label: 'Camps',
    description: 'Residential and flagship camp application queues.',
  },
  courses: {
    label: 'Courses & Learning',
    description: 'Education, webinars, and structured learning programmes.',
  },
  events: {
    label: 'Events',
    description: 'Time-bound events, bookings, and event-led registrations.',
  },
  projects: {
    label: 'Projects & Networks',
    description: 'Professional, community, and initiative-led submissions.',
  },
  general: {
    label: 'General',
    description: 'General enquiries and contact forms not tied to an initiative.',
  },
}

function getSourceLabel(sourceTable: DashboardSubmission['source_table'] | 'register_interest'): string {
  switch (sourceTable) {
    case 'form_submissions':
      return 'General forms'
    case 'camp_applications':
      return 'Camp applications'
    case 'vidyala_applications':
      return 'Course applications'
    case 'padel_registrations':
      return 'Event registrations'
    case 'spn_submissions':
      return 'Network submissions'
    case 'register_interest':
      return 'Register interest'
    default:
      return 'Other'
  }
}

function getInitiativeCatalogMeta(slug: string, name: string): Pick<SubmissionCatalogEntry, 'department' | 'category' | 'subcategory' | 'description'> {
  const directMap: Record<string, Pick<SubmissionCatalogEntry, 'department' | 'category' | 'subcategory' | 'description'>> = {
    'singhs-camp': {
      department: 'camps',
      category: 'Camp applications',
      subcategory: 'Singhs Camp',
      description: 'Applications, reviews, and payment follow-up for Singhs Camp.',
    },
    'kaurs-camp': {
      department: 'camps',
      category: 'Camp applications',
      subcategory: 'Kaurs Camp',
      description: 'Applications and intake triage for Kaurs Camp.',
    },
    'kids-camps': {
      department: 'camps',
      category: 'Camp applications',
      subcategory: 'Kids Camps',
      description: 'Youth camp application activity and parent-facing form submissions.',
    },
    'sikhi-vidyala': {
      department: 'courses',
      category: 'Courses',
      subcategory: 'Sikhi Vidyala',
      description: 'Applications and learning-related submissions for Sikhi Vidyala.',
    },
    'gurmat-academy': {
      department: 'courses',
      category: 'Courses',
      subcategory: 'Gurmat Academy',
      description: 'Course enquiries and learner-facing programme submissions.',
    },
    'self-defence-academy': {
      department: 'courses',
      category: 'Courses',
      subcategory: 'Self Defence Academy',
      description: 'Training and course-related submissions for the academy.',
    },
    'roots-residential': {
      department: 'events',
      category: 'Events',
      subcategory: 'Roots Residential',
      description: 'Bookings and event-led submissions for Roots Residential.',
    },
    roots: {
      department: 'events',
      category: 'Events',
      subcategory: 'Roots Residential',
      description: 'Bookings and event-led submissions for Roots Residential.',
    },
    'sikh-family-retreat': {
      department: 'events',
      category: 'Events',
      subcategory: 'Sikh Family Retreat',
      description: 'Family retreat bookings and related application flow.',
    },
    wolfrun: {
      department: 'events',
      category: 'Events',
      subcategory: 'Wolf Run',
      description: 'Fundraiser and runner registrations for Wolf Run.',
    },
    spn: {
      department: 'projects',
      category: 'Networks',
      subcategory: 'SPN',
      description: 'Professional-network submissions, onboarding, and member workflows.',
    },
    'sikh-professional-network': {
      department: 'projects',
      category: 'Networks',
      subcategory: 'Sikh Professional Network',
      description: 'Professional-network submissions and registrations.',
    },
    'sikh-padel-association': {
      department: 'projects',
      category: 'Projects',
      subcategory: 'Sikh Padel Association',
      description: 'Padel registrations and initiative-specific submissions.',
    },
    forums: {
      department: 'projects',
      category: 'Projects',
      subcategory: 'Forums',
      description: 'Community forum registrations and project-led submissions.',
    },
    sweb3: {
      department: 'projects',
      category: 'Projects',
      subcategory: 'SWEB3',
      description: 'Project and innovation submissions related to SWEB3.',
    },
    'university-projects': {
      department: 'projects',
      category: 'Projects',
      subcategory: 'University Projects',
      description: 'Student and university programme submissions.',
    },
    'khalsa-catalyst': {
      department: 'projects',
      category: 'Projects',
      subcategory: 'Khalsa Catalyst',
      description: 'Programme and initiative-led submissions for Khalsa Catalyst.',
    },
  }

  const mapped = directMap[slug]
  if (mapped) return mapped

  if (slug.includes('camp')) {
    return {
      department: 'camps',
      category: 'Camp applications',
      subcategory: name,
      description: `Application and review flow for ${name}.`,
    }
  }

  return {
    department: 'projects',
    category: 'Projects',
    subcategory: name,
    description: `Project and initiative submissions for ${name}.`,
  }
}

function buildSubmissionCatalog(
  initiatives: Initiative[],
  submissions: DashboardSubmission[],
  webinarSignups: Array<{ id: string }>
): {
  entries: SubmissionCatalogEntry[]
  groupedEntries: Array<{ key: Exclude<DepartmentKey, 'all'>; label: string; description: string; departmentEntry: SubmissionCatalogEntry | null; children: SubmissionCatalogEntry[] }>
} {
  const allEntry: SubmissionCatalogEntry = {
    value: 'all',
    title: 'All submissions',
    description: 'A single operational queue across all live initiatives, courses, camps, and general contact forms.',
    department: 'all',
    category: 'All departments',
    subcategory: 'Master queue',
    submissions,
    sourceSummary: Array.from(new Set(submissions.map((item) => getSourceLabel(item.source_table)))),
  }

  const entries: SubmissionCatalogEntry[] = [allEntry]
  const departmentChildren: Record<Exclude<DepartmentKey, 'all'>, SubmissionCatalogEntry[]> = {
    camps: [],
    courses: [],
    events: [],
    projects: [],
    general: [],
  }

  for (const init of initiatives) {
    const matching = submissions.filter((submission) => submission.initiatives?.slug === init.slug)
    if (matching.length === 0) continue

    const meta = getInitiativeCatalogMeta(init.slug, init.name)
    const entry: SubmissionCatalogEntry = {
      value: init.slug,
      title: init.name,
      description: meta.description,
      department: meta.department,
      category: meta.category,
      subcategory: meta.subcategory,
      submissions: matching,
      sourceSummary: Array.from(new Set(matching.map((item) => getSourceLabel(item.source_table)))),
    }

    entries.push(entry)
    departmentChildren[meta.department].push(entry)
  }

  const generalSubmissions = submissions.filter((submission) => !submission.initiatives?.slug)
  if (generalSubmissions.length > 0) {
    const entry: SubmissionCatalogEntry = {
      value: '__general',
      title: 'General / Contact',
      description: 'Contact forms and general enquiries that are not mapped to a specific initiative.',
      department: 'general',
      category: 'General enquiries',
      subcategory: 'Contact forms',
      submissions: generalSubmissions,
      sourceSummary: Array.from(new Set(generalSubmissions.map((item) => getSourceLabel(item.source_table)))),
    }
    entries.push(entry)
    departmentChildren.general.push(entry)
  }

  if (webinarSignups.length > 0) {
    const entry: SubmissionCatalogEntry = {
      value: '__webinar',
      title: 'Webinar signups',
      description: 'Register-interest signups collected for webinar intake before they enter the main course application flow.',
      department: 'courses',
      category: 'Courses',
      subcategory: 'Webinars',
      submissions: [],
      sourceSummary: [getSourceLabel('register_interest')],
    }
    entries.push(entry)
    departmentChildren.courses.push(entry)
  }

  const groupedEntries = (Object.keys(DEPARTMENT_META) as Array<Exclude<DepartmentKey, 'all'>>).map((key) => {
    const children = departmentChildren[key]
    const departmentSubmissions = children
      .flatMap((entry) => entry.submissions)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const departmentEntry = children.length > 0
      ? {
          value: `__department_${key}`,
          title: DEPARTMENT_META[key].label,
          description: DEPARTMENT_META[key].description,
          department: key,
          category: DEPARTMENT_META[key].label,
          subcategory: 'Department queue',
          submissions: departmentSubmissions,
          sourceSummary: Array.from(new Set(children.flatMap((entry) => entry.sourceSummary))),
        } as SubmissionCatalogEntry
      : null

    if (departmentEntry) {
      entries.push(departmentEntry)
    }

    return {
      key,
      label: DEPARTMENT_META[key].label,
      description: DEPARTMENT_META[key].description,
      departmentEntry,
      children,
    }
  })

  return { entries, groupedEntries }
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

  const [initiativesRes, submissionsRes, campAppsRes, vidyalaAppsRes, padelRegsRes, spnSubsRes] = await Promise.all([
    supabase.from('initiatives').select('id, name, slug').eq('is_active', true).order('sort_order'),
    supabase.from('form_submissions').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('camp_applications').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('vidyala_applications').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('padel_registrations').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
    supabase.from('spn_submissions').select('*, initiatives(name, slug)').order('created_at', { ascending: false }).limit(2000),
  ])
  const initiatives = initiativesRes.data
  const submissions = submissionsRes.data
  const campApplications = campAppsRes.data
  const vidyalaApplications = vidyalaAppsRes.data
  const padelRegistrations = padelRegsRes.data
  const spnSubmissions = spnSubsRes.data

  const TERMINAL_STATUSES = new Set(['approved', 'withdrawn', 'declined', 'archived'])
  const appsNeedingStripe = (campApplications ?? []).filter((c: Record<string, unknown>) => {
    if ((c.stripe_pi_status as string | null) != null) return false
    if (TERMINAL_STATUSES.has(String(c.status ?? ''))) return false
    return !!(c.stripe_payment_intent_id || c.stripe_checkout_session_id || c.email)
  })
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

  const { data: webinarSignups } = await supabase
    .from('register_interest')
    .select('*')
    .eq('camp', 'vidyala-webinar')
    .order('created_at', { ascending: false })
    .limit(5000)

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

  return {
    initiatives: initiatives ?? [],
    submissions: unifiedSubmissions,
    webinarSignups: (webinarSignups ?? []) as Array<{
      id: string; name: string; email: string; country: string | null; notes: string | null; created_at: string
    }>,
  }
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const [{ initiatives, submissions, webinarSignups }, recentActivity] = await Promise.all([
    getSubmissions(),
    getRecentCampActivity(60).catch((e) => {
      console.error('[submissions] getRecentCampActivity failed - hiding activity panel: Cause:', e)
      return [] as ActivityLogEntry[]
    }),
  ])

  const { entries, groupedEntries } = buildSubmissionCatalog(initiatives as Initiative[], submissions, webinarSignups)
  const requestedView = resolvedSearchParams?.view
  const validViews = new Set(entries.map((entry) => entry.value))
  const defaultView = requestedView && validViews.has(requestedView) ? requestedView : 'all'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submissions</h1>
        <p className="text-muted-foreground">Manage submissions by department, then drill into initiative-level queues and sub-categories.</p>
      </div>

      <Tabs defaultValue={defaultView} className="w-full">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-20 h-fit">
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground">Department navigator</p>
                <p className="text-xs text-muted-foreground mt-1">Left side = categorisation. Right side = live queue description.</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Department → category → sub-category</p>
              </div>

              <TabsList className="flex h-auto w-full flex-col items-stretch gap-4 bg-transparent p-0">
                <div className="space-y-2">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Master queue</p>
                  <TabsTrigger
                    value="all"
                    className="flex h-auto w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span>
                      <span className="block text-sm font-semibold leading-none">All submissions</span>
                      <span className="mt-1 block text-[11px] opacity-70">Every live queue</span>
                    </span>
                    <span className="text-lg font-bold leading-none">{submissions.length}</span>
                  </TabsTrigger>
                </div>

                {groupedEntries.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="px-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                    </div>

                    {group.departmentEntry && (
                      <TabsTrigger
                        value={group.departmentEntry.value}
                        className="flex h-auto w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <span>
                          <span className="block text-sm font-semibold leading-none">All {group.label}</span>
                          <span className="mt-1 block text-[11px] opacity-70">Department queue</span>
                        </span>
                        <span className="text-lg font-bold leading-none">{group.departmentEntry.submissions.length || (group.key === 'courses' ? webinarSignups.length : 0)}</span>
                      </TabsTrigger>
                    )}

                    <div className="space-y-2 border-l border-border/70 pl-3">
                      {group.children.map((entry) => {
                        const count = entry.value === '__webinar' ? webinarSignups.length : entry.submissions.length
                        return (
                          <TabsTrigger
                            key={entry.value}
                            value={entry.value}
                            className="flex h-auto w-full items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 text-left transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-foreground"
                          >
                            <span>
                              <span className="block text-sm font-medium leading-none">{entry.subcategory}</span>
                              <span className="mt-1 block text-[11px] opacity-70">{entry.category}</span>
                            </span>
                            <span className="text-sm font-semibold leading-none">{count}</span>
                          </TabsTrigger>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Separate queue</p>
                  <Link
                    href="/dashboard/vacancies"
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-foreground">Vacancies</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">Handled in its own hiring workflow</span>
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Open</span>
                  </Link>
                </div>
              </TabsList>
            </div>
          </aside>

          <div className="min-w-0">
            {entries.map((entry) => {
              const count = entry.value === '__webinar' ? webinarSignups.length : entry.submissions.length

              return (
                <TabsContent key={entry.value} value={entry.value} className="mt-0">
                  <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-6">
                      <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader className="gap-3">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <CardTitle className="text-2xl tracking-tight">{entry.title}</CardTitle>
                              <CardDescription className="max-w-2xl text-sm">{entry.description}</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{entry.category}</Badge>
                              <Badge variant="outline">{entry.subcategory}</Badge>
                              <Badge variant="outline">{count} in queue</Badge>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {entry.value === '__webinar' ? (
                        webinarSignups.length === 0 ? (
                          <p className="rounded-xl border border-border bg-card py-8 text-center text-sm text-muted-foreground">No webinar signups yet.</p>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-border">
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
                                {webinarSignups.map((signup) => (
                                  <tr key={signup.id} className="transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium text-foreground">{signup.name}</td>
                                    <td className="px-4 py-3">
                                      <a href={`mailto:${signup.email}`} className="text-blue-600 hover:underline">{signup.email}</a>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{signup.country ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{signup.notes ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                                      {new Date(signup.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      ) : (
                        <SubmissionsTable submissions={entry.submissions} />
                      )}
                    </div>

                    <aside className="2xl:sticky 2xl:top-20 h-fit">
                      <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">Queue description</CardTitle>
                          <CardDescription>This panel explains how the active queue is classified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                              <span className="text-muted-foreground">Department</span>
                              <span className="font-medium text-foreground">{entry.department === 'all' ? 'All departments' : DEPARTMENT_META[entry.department].label}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                              <span className="text-muted-foreground">Category</span>
                              <span className="font-medium text-foreground">{entry.category}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                              <span className="text-muted-foreground">Sub-category</span>
                              <span className="font-medium text-foreground">{entry.subcategory}</span>
                            </div>
                            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-2">
                              <span className="text-muted-foreground">Sources</span>
                              <span className="max-w-[180px] text-right font-medium text-foreground">{entry.sourceSummary.join(', ')}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Queue size</span>
                              <span className="font-medium text-foreground">{count}</span>
                            </div>
                          </div>

                          <div className="rounded-xl bg-secondary/50 p-3 text-muted-foreground">
                            Vacancy applications stay in <span className="font-medium text-foreground">/dashboard/vacancies</span> because hiring has its own dedicated review flow and should not be mixed into the initiative submissions queue.
                          </div>

                          <div className="rounded-xl border border-border/70 bg-background p-3 text-xs text-muted-foreground">
                            Example structure: <span className="font-medium text-foreground">Camps</span> → <span className="font-medium text-foreground">Camp applications</span> → <span className="font-medium text-foreground">Singhs Camp</span>. The same pattern applies across courses, events, projects, and general contact queues.
                          </div>
                        </CardContent>
                      </Card>
                    </aside>
                  </div>
                </TabsContent>
              )
            })}
          </div>
        </div>
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
