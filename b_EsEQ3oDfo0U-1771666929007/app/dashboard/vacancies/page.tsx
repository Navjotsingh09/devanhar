import { createClient } from '@/lib/supabase/server'
import { VacanciesClient } from '@/components/dashboard/vacancies-client'

async function getVacanciesData() {
  const supabase = await createClient()

  const [{ data: vacancies }, { data: applications }, { data: initiatives }] = await Promise.all([
    supabase.from('vacancies').select('*, initiatives(name)').order('created_at', { ascending: false }),
    supabase.from('vacancy_applications').select('*, vacancies(title)').order('created_at', { ascending: false }),
    supabase.from('initiatives').select('id, name').eq('is_active', true).order('sort_order'),
  ])

  return {
    vacancies: vacancies ?? [],
    applications: applications ?? [],
    initiatives: initiatives ?? [],
  }
}

export default async function VacanciesPage() {
  const data = await getVacanciesData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Vacancies & Applications</h1>
        <p className="text-muted-foreground">Manage volunteer and job openings</p>
      </div>
      <VacanciesClient {...data} />
    </div>
  )
}
