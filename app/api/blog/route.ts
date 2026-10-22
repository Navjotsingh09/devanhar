import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getBlogStaff } from '@/lib/blog-staff-server'
import { blogInputSchema, blogRevisionBody } from '@/lib/blog-draft-content'
export async function POST(request: NextRequest) {
  try {
    const { user, allowed, client } = await getBlogStaff()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Use the blog editor to save this article.' }, { status: 403 })
    if (Number(request.headers.get('content-length')) > 500000) return NextResponse.json({ error: 'Article is too large.' }, { status: 413 })
    const raw = await request.text()
    if (raw.length > 500000) return NextResponse.json({ error: 'Article is too large.' }, { status: 413 })
    const parsed = blogInputSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 })
    const body = parsed.data
    if (body.originalSlug && body.originalSlug !== body.slug) return NextResponse.json({ error: 'An existing article keeps its URL. Create a new article for a different address.' }, { status: 400 })
    if (body.status === 'published' && !body.content.trim()) return NextResponse.json({ error: 'Article content is required.' }, { status: 400 })
    const { data, error } = await client.rpc('blog_write_revision', { p_slug: body.slug, p_body: blogRevisionBody(body), p_expected_draft: body.expectedDraft, p_expected_updated: body.expectedUpdated, p_publish: body.status === 'published' })
    if (error) return NextResponse.json({ error: error.code === '40001' ? error.message : error.code === '42501' ? 'Blog access is no longer available.' : 'The article could not be saved. Reload and retry.' }, { status: error.code === '40001' || error.code === '23505' ? 409 : error.code === '42501' ? 403 : 503 })
    revalidatePath('/dashboard/blog')
    if (body.status === 'published') { revalidatePath('/'); revalidatePath('/insights'); revalidatePath(`/insights/${body.slug}`) }
    return NextResponse.json({ post: { id: data, slug: body.slug } }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid request.' : 'The article could not be saved.' }, { status: error instanceof SyntaxError ? 400 : 503 }) }
}
