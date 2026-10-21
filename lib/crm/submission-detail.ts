import 'server-only'
import { isSource, sources, type SubmissionSource } from './submissions'

type DashboardSubmission = {
  id: string; full_name: string; email: string; phone: string | null; message: string | null;
  form_data: Record<string, unknown>; status: string; internal_notes: string | null; created_at: string;
  initiatives: { name: string; slug: string } | null;
  source_table: 'form_submissions' | 'camp_applications' | 'vidyala_applications' | 'padel_registrations' | 'spn_submissions';
  stripe_payment_intent_id: string | null; stripe_checkout_session_id: string | null;
  stripe_checkout_expires_at: string | null; stripe_pi_status: string | null; stripe_review_state: string | null;
}
export function validRecordId(id: string) {
  return /^([0-9]{1,20}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(id)
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



/** Caller must authorise with requireGeneralStaff before fetching a single record. */
export async function loadSubmissionDetail(client: any, source: SubmissionSource, id: string) {
  if (!isSource(source) || !validRecordId(id)) throw new Error('Invalid record')
  const columns = sources[source].editable ? '*, initiatives(name, slug)' : '*'
  const result = await client.from(source).select(columns).eq('id', id).maybeSingle()
  if (result.error) throw new Error('Unable to load record')
  if (!result.data) return null
  const row = result.data
  if (!sources[source].editable) return { row, submission: null }
  const submissions = source === 'form_submissions' ? [row] : []
  const campApplications = source === 'camp_applications' ? [row] : []
  const vidyalaApplications = source === 'vidyala_applications' ? [row] : []
  const padelRegistrations = source === 'padel_registrations' ? [row] : []
  const spnSubmissions = source === 'spn_submissions' ? [row] : []
  // Stored status is maintained by existing webhooks; do not scan Stripe on page reads.
  const stripeStatusMap = new Map<string, string>()
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


  return { row: null, submission: unifiedSubmissions[0] }
}
