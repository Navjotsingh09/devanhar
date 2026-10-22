import { z } from 'zod'
import { isSafeContentLink } from './cms/sfi-content'
const optionalImage = z.string().max(2000).refine(v => !v || isSafeContentLink(v), 'Use an existing image path or HTTPS URL').default('')
export const blogInputSchema = z.object({
  originalSlug: z.string().optional(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  title: z.string().trim().min(1).max(240), description: z.string().trim().max(2000).default(''),
  content: z.string().max(200000).default(''), pillar: z.enum(['Develop','Elevate','Empower','Connect']),
  status: z.enum(['draft','published']), author: z.string().trim().max(160).default('Devanhaar'),
  coverImage: optionalImage, coverAlt: z.string().trim().max(500).default(''),
  tags: z.array(z.string().trim().max(80)).max(30).default([]), readTime: z.string().max(40).default('3 min'),
  source: z.string().max(2000).default(''), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v+'T12:00:00Z'); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === v }, 'Enter a valid date'),
  expectedDraft: z.string().uuid().nullable(), expectedUpdated: z.string().datetime({ offset: true }).nullable(),
})
export function blogRevisionBody(input: z.infer<typeof blogInputSchema>) {
  return { title: input.title, excerpt: input.description, content: input.content, pillar: input.pillar,
    author_name: input.author || 'Devanhaar', cover_image_url: input.coverImage || null, cover_image_alt: input.coverAlt || null,
    tags: input.tags, read_time: input.readTime, source: input.source || null, published_at: new Date(input.date+'T12:00:00Z').toISOString() }
}
