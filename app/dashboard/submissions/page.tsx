import { createClient } from '@/lib/supabase/server'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  return {
    initiatives: initiatives ?? [],
    submissions: submissions ?? [],
  }
}

export default async function SubmissionsPage() {
  const { initiatives, submissions } = await getSubmissions()

  const allSubmissions = submissions
  const groupedByInitiative = initiatives.reduce((acc, init) => {
    acc[init.slug] = submissions.filter(
      (s: Record<string, unknown>) => (s.initiatives as Record<string, string>)?.slug === init.slug
    )
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
