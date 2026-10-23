import { z } from 'zod'
import defaults from './sfi-default.json'
import { isSafeContentLink, isSafeAssetLink } from './content-links'
import { pageSeoSchema } from './seo'
export { isSafeContentLink, isSafeAssetLink } from './content-links'

const text = z.string().trim().min(1, 'This field is required').max(10000)
const link = z.string().max(2000).refine(isSafeContentLink, 'Use a website path or an HTTPS link')
const section = z.enum(['events', 'why', 'faq', 'community'])
export const sfiSchema = z.object({
  schemaVersion: z.literal(1),
  seo: pageSeoSchema,
  hero: z.object({
    eyebrow: text.max(160), title: text.max(240), subtitle: text.max(500),
    paragraphs: z.tuple([text, text]),
    image: z.string().max(2000).refine(isSafeAssetLink, 'Choose an existing website image or uploaded media URL'),
    imageAlt: text.max(500),
  }).strict(),
  eventsIntro: z.object({ eyebrow: text.max(160), title: text.max(240), description: text }).strict(),
  events: z.array(z.object({
    eyebrow: text.max(160), title: text.max(240), date: text.max(160), href: link,
    icon: z.enum(['HeartHandshake', 'UsersRound', 'Leaf', 'Sparkles']),
    intro: text, body: z.array(text).min(1).max(12), cta: text.max(160),
  }).strict()).max(30),
  faqs: z.array(z.object({ question: text.max(500), answer: text }).strict()).max(40),
  sectionOrder: z.array(section).length(4).refine(value => new Set(value).size === 4, 'Include each section exactly once'),
  hiddenSections: z.array(section).max(4).refine(value => new Set(value).size === value.length),
}).strict()
export type SfiContent = z.infer<typeof sfiSchema>
export type SfiHead = { pageId: string | null; draftId: string | null; publishedId: string | null }
export const defaultSfiContent: SfiContent = sfiSchema.parse(defaults)
export const sfiHeadSchema = z.object({
  pageId: z.string().uuid().nullable(), draftId: z.string().uuid().nullable(), publishedId: z.string().uuid().nullable(),
}).strict()
export function parseSfiBody(body: string): SfiContent | null {
  try {
    const result = sfiSchema.safeParse(JSON.parse(body))
    return result.success ? result.data : null
  } catch { return null }
}
