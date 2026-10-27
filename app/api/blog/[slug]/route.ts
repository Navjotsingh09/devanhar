import { NextResponse } from 'next/server'
import { revalidatePath,revalidateTag } from 'next/cache'
import { getBlogStaff } from '@/lib/blog-staff-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Blog is unavailable')
  return createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
async function change(request: Request, params: Promise<{slug: string}>, restore: boolean) {
  try {
    const {slug}=await params
    const { user, allowed } = await getBlogStaff(slug,'archive')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Use the blog manager.' }, { status: 403 })
    const body = await request.json()
    if (typeof body.expectedUpdated !== 'string') return NextResponse.json({ error: 'Reload the article list before continuing.' }, { status: 409 })
    const db = adminClient()
    const { data, error } = await db.from('blog_posts').update({ status: 'draft', archived_at: restore ? null : new Date().toISOString(), updated_at: new Date().toISOString() }).eq('slug', slug).eq('updated_at', body.expectedUpdated).select('id, updated_at').maybeSingle()
    if (error) return NextResponse.json({ error: 'The article could not be updated.' }, { status: 503 })
    if (!data) return NextResponse.json({ error: 'Someone changed this article. Reload before continuing.' }, { status: 409 })
    await db.from('activity_log').insert({ admin_id: user.id, action: restore ? 'Restored article to drafts' : 'Archived article', entity_type: 'blog_post', entity_id: data.id })
    revalidateTag('cms-insights',{expire:0});revalidatePath('/'); revalidatePath('/insights'); revalidatePath(`/insights/${slug}`); revalidatePath('/dashboard/blog')
    return NextResponse.json({ success: true, updatedAt: data.updated_at }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return NextResponse.json({ error: 'The article could not be updated.' }, { status: 503 }) }
}
export async function DELETE(request: Request, { params }: {params: Promise<{slug:string}>}) { return change(request, params, false) }
export async function PATCH(request: Request, { params }: {params: Promise<{slug:string}>}) { return change(request, params, true) }
