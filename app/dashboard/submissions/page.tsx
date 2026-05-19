import { createClient } from '@/lib/supabase/server'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  source_table: 'form_submissions' | 'camp_applications'
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
    'consent_email',
    'consent_phone',
    'consent_sms',
    'consent_whatsapp',
    'gift_aid',
    'donation_amount',
    'monthly_donation_opted',
    'monthly_donation_amount',
    'phone_normalized',
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
      }
    }
  )

  const unifiedSubmissions = [...formSubmissions, ...normalizedCampApps].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return {
    initiatives: initiatives ?? [],
    submissions: unifiedSubmissions,
  }
}

export default async function SubmissionsPage() {
  const { initiatives, submissions } = await getSubmissions()

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
    </div>
  )
}
