import { z } from 'zod'
import homeDefaults from './home-default.json'
import { isSafeContentLink } from './sfi-content'
const text = z.string().trim().min(1, 'This field is required').max(10000)
const short = text.max(240)
const link = z.string().max(2000).refine(isSafeContentLink, 'Use a website path or an HTTPS link')
const image = z.string().max(2000).refine(v => v.startsWith('/') && isSafeContentLink(v), 'Use an existing website image path starting with /')
const button = z.object({ label: short, href: link }).strict()
const faq = z.object({ heading: short, subheading: text.max(500), items: z.array(z.object({ question: text.max(500), answer: text }).strict()).max(40) }).strict()
const base = { id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), hidden: z.boolean() }
const block = <T extends z.ZodTypeAny, K extends string>(type: K, data: T) => z.object({ ...base, type: z.literal(type), data }).strict()
const icon = z.enum(['Lightbulb','Flame','TrendingUp','Handshake','Users','Heart','Globe','BookOpen','GraduationCap','School','Shield','House'])
export const sectionSchema = z.discriminatedUnion('type', [
  block('homeHero', z.object({ before: short, highlight: short, after: short, description: text.max(1000), primary: button, secondary: button, slides: z.array(z.object({ subtitle: short, image }).strict()).min(1).max(6) }).strict()),
  block('pillars', z.object({ eyebrow: short, heading: short, items: z.array(z.object({ title: short, description: text, icon }).strict()).min(1).max(12) }).strict()),
  block('platform', z.object({ eyebrow: short, heading: short, description: text, tags: z.array(short).max(12), items: z.array(z.object({ title: short, description: text, icon, href: link }).strict()).max(30) }).strict()),
  block('impact', z.object({ heading: short, insightsHeading: short, insightsSubtitle: short, items: z.array(z.object({ badge: short, name: short, location: short, metricLabel: short, numericValue: z.number().int().min(0).max(1000000000), image }).strict()).max(12) }).strict()),
  block('social', z.object({ eyebrow: short, heading: short, description: text, buttonLabel: short }).strict()),
  block('faq', faq),
  block('hero', z.object({ eyebrow: short, heading: short, description: text, image, imageAlt: short, buttons: z.array(button).max(4) }).strict()),
  block('text', z.object({ heading: short, paragraphs: z.array(text).min(1).max(30) }).strict()),
  block('imageText', z.object({ heading: short, description: text, image, imageAlt: short, button }).strict()),
  block('cards', z.object({ heading: short, items: z.array(z.object({ title: short, description: text, href: link }).strict()).min(1).max(30) }).strict()),
  block('cta', z.object({ heading: short, description: text, buttons: z.array(button).min(1).max(4) }).strict()),
  block('gallery', z.object({ heading: short, items: z.array(z.object({ image, imageAlt: short, caption: short }).strict()).min(1).max(30) }).strict()),
  block('testimonials', z.object({ heading: short, items: z.array(z.object({ quote: text, name: short }).strict()).min(1).max(30) }).strict()),
  block('buttons', z.object({ heading: short, buttons: z.array(button).min(1).max(8) }).strict()),
])
export const pageContentSchema = z.object({
  schemaVersion: z.literal(1), title: short,
  seo: z.object({ title: text.max(160), description: text.max(320), noIndex: z.boolean() }).strict(),
  sections: z.array(sectionSchema).min(1).max(40).refine(sections => new Set(sections.map(s => s.id)).size === sections.length, 'Section IDs must be unique').refine(sections => sections.some(s => !s.hidden), 'Keep at least one section visible'),
}).strict()
export type PageContent = z.infer<typeof pageContentSchema>
export type PageSection = z.infer<typeof sectionSchema>
export const defaultHomeContent = pageContentSchema.parse(homeDefaults)
export const cmsSlugSchema = z.string().regex(/^(home|page-[a-z0-9]+(?:-[a-z0-9]+)*)$/).max(100)
export function pagePath(slug: string) { return slug === 'home' ? '/' : `/pages/${slug.replace(/^page-/, '')}` }
export function parsePageBody(body: string): PageContent | null {
  try { const result = pageContentSchema.safeParse(JSON.parse(body)); return result.success ? result.data : null } catch { return null }
}
export const blockTemplates = {
  hero: { eyebrow: 'Devanhaar', heading: 'New page', description: 'Add your introduction.', image: '/hero-slide-1.jpg', imageAlt: 'Devanhaar community', buttons: [{ label: 'Get in touch', href: '/contact' }] },
  text: { heading: 'Our story', paragraphs: ['Add your text.'] },
  imageText: { heading: 'Our community', description: 'Add your text.', image: '/hero-slide-1.jpg', imageAlt: 'Devanhaar community', button: { label: 'Find out more', href: '/contact' } },
  cards: { heading: 'Explore more', items: [{ title: 'Our projects', description: 'Discover our projects.', href: '/projects' }] },
  cta: { heading: 'Get involved', description: 'Support our community.', buttons: [{ label: 'Contact us', href: '/contact' }] },
  faq: { heading: 'Frequently Asked Questions', subheading: 'Find answers below', items: [{ question: 'How can I get involved?', answer: 'Contact our team.' }] },
  gallery: { heading: 'Gallery', items: [{ image: '/hero-slide-1.jpg', imageAlt: 'Devanhaar community', caption: 'Our community' }] },
  testimonials: { heading: 'Community voices', items: [{ quote: 'Add a quote with permission.', name: 'Name' }] },
  buttons: { heading: 'Useful links', buttons: [{ label: 'Contact us', href: '/contact' }] },
} as const
export function newPageContent(): PageContent {
  return pageContentSchema.parse({ schemaVersion: 1, title: 'New page', seo: { title: 'New page | Devanhaar', description: 'Add a description of this page.', noIndex: false }, sections: [{ id: 'hero', type: 'hero', hidden: false, data: blockTemplates.hero }] })
}
