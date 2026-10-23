import Link from 'next/link'
import {SiteSettingsProvider} from './site-settings-provider'
import {ManagedProjects,ManagedEvents} from './content-sections'
import { Navbar } from '@/components/navbar'
import { FooterSection } from '@/components/footer-section'
import { ScrollAnimations } from '@/components/scroll-animations'
import { HeroOptionA } from '@/components/hero-option-a'
import { PillarsSection } from '@/components/pillars-section'
import { PlatformSection } from '@/components/platform-section'
import { ProjectsSection } from '@/components/projects-section'
import { MediaSection } from '@/components/media-section'
import { FAQSection } from '@/components/faq-section'
import type { BlogPost } from '@/lib/blog'
import type { PageContent, PageSection } from '@/lib/cms/page-content'
import type { OpenOpportunity } from '@/lib/registration-window-status'

function Buttons({ items }: { items: { label: string; href: string }[] }) {
  return <div className="mt-6 flex flex-wrap gap-3">{items.map((item, i) => <Link key={i} href={item.href} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">{item.label}</Link>)}</div>
}
function Section({ section, opportunities, posts }: { section: PageSection; opportunities: OpenOpportunity[]; posts: BlogPost[] }) {
  switch (section.type) {
    case 'pageCopy': return null
    case 'siteSettings': return null
    case 'projects': return <ManagedProjects {...section.data}/>
    case 'events': return <ManagedEvents {...section.data}/>
    case 'sharedFaqs': return <FAQSection heading={section.data.heading} items={[]}/>
    case 'insights': return <section className="container mx-auto px-6 py-16"><h2 className="mb-8 text-3xl font-bold">{section.data.heading}</h2><div className="grid gap-6 md:grid-cols-3">{posts.slice(0,section.data.limit).map(post=><Link key={post.slug} href={`/insights/${post.slug}`} className="rounded-xl border p-6"><h3 className="text-xl font-semibold">{post.title} →</h3><p className="mt-4 text-sm text-muted-foreground">{post.description}</p></Link>)}</div></section>
    case 'homeHero': return <HeroOptionA content={section.data} opportunities={opportunities} />
    case 'pillars': return <PillarsSection content={section.data} />
    case 'platform': return <PlatformSection content={section.data} />
    case 'impact': return <ProjectsSection content={section.data} posts={posts.map(({slug,pillar,description,readTime})=>({slug,pillar,description,readTime}))} />
    case 'social': return <MediaSection content={section.data} />
    case 'faq': return <FAQSection {...section.data} />
    case 'hero': return <section className="relative flex min-h-[65svh] items-end bg-slate-950 px-6 pb-16 pt-36 text-white"><img src={section.data.image} alt={section.data.imageAlt} className="absolute inset-0 h-full w-full object-cover opacity-40" /><div className="container relative mx-auto"><p className="text-sm uppercase tracking-widest">{section.data.eyebrow}</p><h1 className="mt-4 max-w-4xl text-4xl font-bold md:text-6xl">{section.data.heading}</h1><p className="mt-5 max-w-2xl whitespace-pre-line text-lg">{section.data.description}</p><Buttons items={section.data.buttons} /></div></section>
    case 'text': return <section className="container mx-auto max-w-4xl px-6 py-16"><h2 className="text-3xl font-bold">{section.data.heading}</h2>{section.data.paragraphs.map((p, i) => <p key={i} className="mt-6 whitespace-pre-line leading-8 text-muted-foreground">{p}</p>)}</section>
    case 'imageText': return <section className="container mx-auto grid items-center gap-10 px-6 py-16 md:grid-cols-2"><img src={section.data.image} alt={section.data.imageAlt} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" /><div><h2 className="text-3xl font-bold">{section.data.heading}</h2><p className="mt-5 whitespace-pre-line leading-8 text-muted-foreground">{section.data.description}</p><Buttons items={[section.data.button]} /></div></section>
    case 'cards': return <section className="container mx-auto px-6 py-16"><h2 className="mb-8 text-3xl font-bold">{section.data.heading}</h2><div className="grid gap-6 md:grid-cols-3">{section.data.items.map((item, i) => <Link key={i} href={item.href} className="rounded-xl border p-6 hover:border-primary"><h3 className="text-xl font-semibold">{item.title} →</h3><p className="mt-4 whitespace-pre-line text-muted-foreground">{item.description}</p></Link>)}</div></section>
    case 'cta': return <section className="border-y bg-secondary/30 px-6 py-16"><div className="container mx-auto"><h2 className="text-3xl font-bold">{section.data.heading}</h2><p className="mt-5 whitespace-pre-line text-muted-foreground">{section.data.description}</p><Buttons items={section.data.buttons} /></div></section>
    case 'gallery': return <section className="container mx-auto px-6 py-16"><h2 className="mb-8 text-3xl font-bold">{section.data.heading}</h2><div className="grid gap-6 md:grid-cols-3">{section.data.items.map((item, i) => <figure key={i}><img src={item.image} alt={item.imageAlt} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" /><figcaption className="mt-3 text-sm text-muted-foreground">{item.caption}</figcaption></figure>)}</div></section>
    case 'testimonials': return <section className="container mx-auto px-6 py-16"><h2 className="mb-8 text-3xl font-bold">{section.data.heading}</h2><div className="grid gap-6 md:grid-cols-2">{section.data.items.map((item, i) => <blockquote key={i} className="rounded-xl border p-8"><p className="whitespace-pre-line text-lg">“{item.quote}”</p><footer className="mt-5 text-sm text-muted-foreground">{item.name}</footer></blockquote>)}</div></section>
    case 'buttons': return <section className="container mx-auto px-6 py-16"><h2 className="text-3xl font-bold">{section.data.heading}</h2><Buttons items={section.data.buttons} /></section>
  }
}
export function CmsPageRenderer({ content, opportunities = [], posts = [] }: { content: PageContent; opportunities?: OpenOpportunity[]; posts?: BlogPost[] }) {
  const settings=content.sections.find(s=>s.type==='siteSettings')
  if(settings?.type==='siteSettings')return <SiteSettingsProvider settings={settings.data}><Navbar/><section className="container mx-auto px-6 pb-16 pt-36"><p className="text-sm text-muted-foreground">Shared website settings preview</p><h1 className="mt-4 text-4xl font-bold">{settings.data.brand.name}</h1><p className="mt-4">Review the header navigation, project menu, logo, accent colour, contact details and footer below.</p><a href="#contact" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground">Example button</a></section><FooterSection/></SiteSettingsProvider>
  const visible = content.sections.filter(s => !s.hidden)
  const startsWithHero = ['hero', 'homeHero'].includes(visible[0]?.type)
  return <main className={`min-h-screen bg-background text-foreground ${startsWithHero ? '' : 'pt-28'}`}><ScrollAnimations /><Navbar />{visible.map(section => <Section key={section.id} section={section} opportunities={opportunities} posts={posts} />)}<FooterSection /></main>
}
