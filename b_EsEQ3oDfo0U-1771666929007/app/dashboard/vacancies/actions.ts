'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVacancy(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const vacancyType = formData.get('vacancy_type') as string
  const location = formData.get('location') as string
  const isRemote = formData.get('is_remote') === 'true'
  const requirements = formData.get('requirements') as string
  const initiativeId = formData.get('initiative_id') as string

  const { error } = await supabase.from('vacancies').insert({
    title,
    description,
    vacancy_type: vacancyType,
    location: location || null,
    is_remote: isRemote,
    requirements: requirements || null,
    initiative_id: initiativeId || null,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Created vacancy: ${title}`,
    entity_type: 'vacancy',
  })

  revalidatePath('/dashboard/vacancies')
}

export async function toggleVacancy(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('vacancies')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/vacancies')
}

export async function updateApplicationStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('vacancy_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Updated application status to ${status}`,
    entity_type: 'vacancy_application',
    entity_id: id,
  })

  revalidatePath('/dashboard/vacancies')
}
