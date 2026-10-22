'use server'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
const assignmentSchema = z.object({ pageId: z.string().uuid(), userId: z.string().uuid(), view: z.boolean(), edit: z.boolean(), publish: z.boolean() }).strict()
export async function saveContentAssignment(input: unknown): Promise<{ error?: string }> {
  const parsed = assignmentSchema.safeParse(input)
  if (!parsed.success) return { error: 'Select a page and a Content Manager.' }
  const value = parsed.data
  if ((value.edit && !value.view) || (value.publish && !value.edit)) return { error: 'Editing requires View access; publishing also requires Edit access.' }
  const { client, user, authError, profile, grants } = await getRequestStaff()
  if (authError || !user || profile.error || grants.error || !Array.isArray(grants.data) || !['admin','super_admin'].includes(profile.data?.role || '')) return { error: 'Administrator access is required.' }
  const { error } = await client.rpc('cms_set_page_assignment', { p_page_id: value.pageId, p_user_id: value.userId, p_can_view: value.view, p_can_edit: value.edit, p_can_publish: value.publish })
  if (error) return { error: error.code === '22023' ? 'Choose an existing Content Manager and valid permissions.' : 'The assignment could not be saved. Please refresh and retry.' }
  revalidatePath('/dashboard/website/assignments')
  revalidatePath('/dashboard/website/pages')
  return {}
}
