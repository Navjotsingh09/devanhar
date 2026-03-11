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
        form_data: {
          date_of_birth: c.date_of_birth,
          age_at_camp: c.age_at_camp,
          university: c.university,
          occupation: c.occupation,
          city: c.city,
          postcode: c.postcode,
          country: c.country,
          travel_method: c.travel_method,
          requires_payment_support: c.requires_payment_support,
          heard_about_camp: c.heard_about_camp,
          sikhi_knowledge_level: c.sikhi_knowledge_level,
        },
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submissions</h1>
        <p className="text-muted-foreground">Manage form submissions from all initiatives</p>
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
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <SubmissionsTable submissions={allSubmissions} />
        </TabsContent>

        {initiatives.map((init) => (
          <TabsContent key={init.slug} value={init.slug} className="mt-4">
            <SubmissionsTable submissions={groupedByInitiative[init.slug] || []} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
