import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { CmsError, changeSfiContent, getSfiEditorState } from '@/lib/cms/sfi-server'
import { sfiHeadSchema, sfiSchema } from '@/lib/cms/sfi-content'
import { z } from 'zod'

const requestSchema = z.object({ action: z.enum(['save', 'publish']), content: sfiSchema, expected: sfiHeadSchema }).strict()
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: 'This request must come from the website editor.' }, { status: 403 })
    if (Number(request.headers.get('content-length')) > 500000) return NextResponse.json({ error: 'Page content is too large.' }, { status: 413 })
    const raw = await request.text()
    if (raw.length > 500000) return NextResponse.json({ error: 'Page content is too large.' }, { status: 413 })
    const parsed = requestSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') }, { status: 400 })
    await changeSfiContent(parsed.data.action, parsed.data.content, parsed.data.expected)
    if (parsed.data.action === 'publish') {
      revalidatePath('/sfi')
      revalidatePath('/initiatives/sikh-family-initiative')
    }
    return NextResponse.json(await getSfiEditorState(), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const status = error instanceof CmsError ? error.status : error instanceof SyntaxError ? 400 : 503
    return NextResponse.json({ error: error instanceof CmsError ? error.message : status === 400 ? 'The request is invalid.' : 'Website editing is temporarily unavailable.' }, { status })
  }
}
