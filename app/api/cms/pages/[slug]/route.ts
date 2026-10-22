import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { pageContentSchema, cmsSlugSchema, pagePath } from '@/lib/cms/page-content'
import { sfiHeadSchema } from '@/lib/cms/sfi-content'
import { CmsError, changePageContent, restorePageRevision, getPageEditorState } from '@/lib/cms/page-server'
const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.enum(['save', 'publish']), content: pageContentSchema, expected: sfiHeadSchema }).strict(),
  z.object({ action: z.literal('restore'), revisionId: z.string().uuid(), expected: sfiHeadSchema }).strict(),
])
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    if (!cmsSlugSchema.safeParse(slug).success) return NextResponse.json({ error: 'Unknown page.' }, { status: 404 })
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Use the website editor to make this change.' }, { status: 403 })
    if (Number(request.headers.get('content-length')) > 500000) return NextResponse.json({ error: 'Content is too large.' }, { status: 413 })
    const raw = await request.text()
    if (raw.length > 500000) return NextResponse.json({ error: 'Content is too large.' }, { status: 413 })
    const result = requestSchema.safeParse(JSON.parse(raw))
    if (!result.success) return NextResponse.json({ error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 })
    const data = result.data
    if (data.action === 'restore') await restorePageRevision(slug, data.revisionId, data.expected)
    else await changePageContent(slug, data.action, data.content, data.expected)
    if (data.action === 'publish') revalidatePath(pagePath(slug))
    return NextResponse.json(await getPageEditorState(slug), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const status = error instanceof CmsError ? error.status : error instanceof SyntaxError ? 400 : 503
    return NextResponse.json({ error: error instanceof CmsError ? error.message : status === 400 ? 'Invalid request.' : 'The page could not be updated. Please retry.' }, { status })
  }
}
