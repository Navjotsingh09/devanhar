'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Eye, Plus, Save, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SfiContent } from '@/lib/cms/sfi-content'
import type { getSfiEditorState } from '@/lib/cms/sfi-server'

type State = Awaited<ReturnType<typeof getSfiEditorState>>
const labels = { events: 'Upcoming events', why: 'Why SFI', faq: 'Frequently asked questions', community: 'Community & seva' }
function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block space-y-2 text-sm font-medium"><span>{label}</span>{multiline
    ? <textarea value={value} onChange={event => onChange(event.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background p-3 font-normal leading-6 focus:outline-none focus:ring-2 focus:ring-primary" />
    : <Input value={value} onChange={event => onChange(event.target.value)} className="font-normal" />}</label>
}

export function SfiEditor({ initial }: { initial: State }) {
  const [saved, setSaved] = useState(initial)
  const [content, setContent] = useState<SfiContent>(initial.content)
  const [tab, setTab] = useState('Hero')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [viewport, setViewport] = useState('100%')
  const [reviewed, setReviewed] = useState<string | null>(null)
  const dirty = JSON.stringify(content) !== JSON.stringify(saved.content)
  const canEdit = saved.permissions.edit
  function changeHero(key: keyof SfiContent['hero'], value: string | [string, string]) {
    setContent({ ...content, hero: { ...content.hero, [key]: value } })
  }
  async function submit(action: 'save' | 'publish') {
    if (action === 'publish' && !window.confirm('Publish this saved SFI draft? It will become the version shown at /sfi on this deployment.')) return
    setBusy(true); setMessage(''); setError('')
    try {
      const response = await fetch('/api/cms/sfi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, content, expected: saved.head }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The page could not be saved.')
      setSaved(result); setContent(result.content); setReviewed(null); setPreview(false)
      setMessage(action === 'save' ? 'Draft saved. The published page has not changed.' : 'The saved draft is now published on this deployment.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The page could not be saved.') }
    finally { setBusy(false) }
  }
  function moveSection(index: number, direction: number) {
    const order = [...content.sectionOrder]
    const target = index + direction
    if (target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target], order[index]]
    setContent({ ...content, sectionOrder: order })
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Website / Pages</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Sikh Family Initiative</h1><p className="mt-2 text-sm text-muted-foreground">Edit the page, save a draft, preview it, then publish.</p></div>
      <a href="/sfi" target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-sm font-medium">View published page ↗</a>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm"><span className={`rounded-full px-3 py-1 font-medium ${dirty ? 'bg-amber-100 text-amber-900' : 'bg-muted'}`}>{dirty ? 'Unsaved changes' : saved.head.draftId ? 'Draft saved' : saved.head.publishedId ? 'Published' : 'Original website content'}</span><span className="text-muted-foreground">{saved.updatedAt ? `Last saved ${new Date(saved.updatedAt).toLocaleString('en-GB', { timeZone: 'Europe/London' })}` : 'No CMS changes have been saved yet.'}</span></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy || !canEdit || (!dirty && !!saved.head.draftId)} onClick={() => void submit('save')}><Save className="mr-2 h-4 w-4" />{busy ? 'Working…' : 'Save draft'}</Button>
        <Button variant="outline" disabled={busy || dirty} onClick={() => { setPreview(true); setReviewed(saved.head.draftId) }}><Eye className="mr-2 h-4 w-4" />Preview</Button>
        {saved.permissions.publish && <Button disabled={busy || dirty || !saved.head.draftId || reviewed !== saved.head.draftId} onClick={() => void submit('publish')}><Send className="mr-2 h-4 w-4" />Publish</Button>}
      </div>
    </div>
    {dirty && <p className="text-sm text-muted-foreground">Save your draft to preview the latest changes. Publishing is available after previewing the saved draft.</p>}
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p>{error}</p><p className="mt-2">Your text is still in the editor. Copy any unsaved changes before reloading.</p></div>}
    {preview ? <section className="overflow-hidden rounded-xl border bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card p-4"><div><h2 className="font-semibold">Saved draft preview</h2><p className="text-xs text-muted-foreground">The same page layout as /sfi. Previewing does not publish.</p></div><div className="flex flex-wrap gap-2">{[['Desktop', '100%'], ['Tablet', '768px'], ['Mobile', '390px']].map(([label, width]) => <Button key={label} size="sm" variant={viewport === width ? 'default' : 'outline'} onClick={() => setViewport(width)}>{label}</Button>)}<Button size="sm" variant="outline" onClick={() => setPreview(false)}>Back to editing</Button></div></div>
      <div className="overflow-auto p-3"><iframe key={`${saved.head.draftId}-${saved.head.publishedId}`} title="SFI saved draft preview" src="/cms-preview/sfi" className="mx-auto h-[75vh] border bg-white" style={{ width: viewport, maxWidth: 'none' }} /></div>
    </section> : <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
      <nav aria-label="Page editing sections" className="space-y-1 self-start rounded-xl border bg-card p-3">{['Hero', 'Events', 'FAQs', 'Sections', 'SEO', 'History'].map(name => <button key={name} aria-current={tab === name ? 'page' : undefined} onClick={() => setTab(name)} className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${tab === name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{name}</button>)}</nav>
      <fieldset disabled={!canEdit || busy} className="min-w-0 space-y-6 rounded-xl border bg-card p-5 md:p-7">
        <legend className="sr-only">SFI page content</legend>
        <h2 className="text-xl font-semibold">{tab}</h2>
        {tab === 'Hero' && <div className="space-y-5">
          {(['eyebrow', 'title', 'subtitle', 'image', 'imageAlt'] as const).map(key => <Field key={key} label={{ eyebrow: 'Label', title: 'Heading', subtitle: 'Subtitle', image: 'Hero image path', imageAlt: 'Image description (alt text)' }[key]} value={content.hero[key]} onChange={value => changeHero(key, value)} />)}
          {content.hero.paragraphs.map((paragraph, index) => <Field key={index} multiline label={`Introduction paragraph ${index + 1}`} value={paragraph} onChange={value => { const paragraphs = [...content.hero.paragraphs] as [string, string]; paragraphs[index] = value; changeHero('paragraphs', paragraphs) }} />)}
        </div>}
        {tab === 'Events' && <div className="space-y-6">
          {(['eyebrow', 'title', 'description'] as const).map(key => <Field key={key} label={`Section ${key}`} multiline={key === 'description'} value={content.eventsIntro[key]} onChange={value => setContent({ ...content, eventsIntro: { ...content.eventsIntro, [key]: value } })} />)}
          {content.events.map((event, index) => <details key={index} className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">{index + 1}. {event.title || 'New event'}</summary><div className="mt-5 space-y-4">
            {(['eyebrow', 'title', 'date', 'intro', 'href', 'cta'] as const).map(key => <Field key={key} multiline={key === 'intro'} label={{ eyebrow: 'Event type', title: 'Event name', date: 'Date text', intro: 'Introduction', href: 'Button link', cta: 'Button text' }[key]} value={event[key]} onChange={value => setContent({ ...content, events: content.events.map((item, i) => i === index ? { ...item, [key]: value } : item) })} />)}
            <Field multiline label="Details (one paragraph per line)" value={event.body.join('\n')} onChange={value => setContent({ ...content, events: content.events.map((item, i) => i === index ? { ...item, body: value.split('\n') } : item) })} />
            <Button variant="outline" type="button" onClick={() => setContent({ ...content, events: content.events.filter((_, i) => i !== index) })}><Trash2 className="mr-2 h-4 w-4" />Remove from draft</Button>
          </div></details>)}
          <Button variant="outline" onClick={() => setContent({ ...content, events: [...content.events, { eyebrow: 'Family event', title: '', date: '', intro: '', body: [''], href: '/contact', cta: 'Find out more', icon: 'HeartHandshake' }] })}><Plus className="mr-2 h-4 w-4" />Add event</Button>
        </div>}
        {tab === 'FAQs' && <div className="space-y-6">{content.faqs.map((faq, index) => <div key={index} className="space-y-4 rounded-xl border p-4"><Field label={`Question ${index + 1}`} value={faq.question} onChange={value => setContent({ ...content, faqs: content.faqs.map((item, i) => i === index ? { ...item, question: value } : item) })} /><Field label="Answer" multiline value={faq.answer} onChange={value => setContent({ ...content, faqs: content.faqs.map((item, i) => i === index ? { ...item, answer: value } : item) })} /><Button variant="outline" onClick={() => setContent({ ...content, faqs: content.faqs.filter((_, i) => i !== index) })}>Remove from draft</Button></div>)}<Button variant="outline" onClick={() => setContent({ ...content, faqs: [...content.faqs, { question: '', answer: '' }] })}>Add FAQ</Button></div>}
        {tab === 'Sections' && <div className="space-y-3"><p className="text-sm text-muted-foreground">The hero stays first. Reorder or hide the sections below; changes stay in the draft until published.</p>{content.sectionOrder.map((key, index) => <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={!content.hiddenSections.includes(key)} onChange={event => setContent({ ...content, hiddenSections: event.target.checked ? content.hiddenSections.filter(item => item !== key) : [...content.hiddenSections, key] })} />{labels[key]}</label><div className="flex gap-2"><Button size="icon" variant="outline" aria-label={`Move ${labels[key]} up`} disabled={index === 0} onClick={() => moveSection(index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button size="icon" variant="outline" aria-label={`Move ${labels[key]} down`} disabled={index === 3} onClick={() => moveSection(index, 1)}><ArrowDown className="h-4 w-4" /></Button></div></div>)}</div>}
        {tab === 'SEO' && <div className="space-y-5"><Field label="SEO title" value={content.seo.title} onChange={value => setContent({ ...content, seo: { ...content.seo, title: value } })} /><Field label="Meta description" multiline value={content.seo.description} onChange={value => setContent({ ...content, seo: { ...content.seo, description: value } })} /><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={content.seo.noIndex} onChange={event => setContent({ ...content, seo: { ...content.seo, noIndex: event.target.checked } })} />Ask search engines not to index this page</label><p className="text-sm text-muted-foreground">The page URL stays /sfi.</p></div>}
        {tab === 'History' && <div className="space-y-3"><p className="text-sm text-muted-foreground">Saved revisions are retained separately from the published version.</p>{saved.history.length ? saved.history.map(revision => <div key={revision.id} className="rounded-lg border p-4 text-sm"><p className="font-semibold">Revision {revision.revision_number}{revision.id === saved.head.publishedId ? ' · Published' : revision.id === saved.head.draftId ? ' · Current draft' : ''}</p><p className="mt-1 text-muted-foreground">{new Date(revision.created_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p></div>) : <p className="text-sm">No CMS revisions yet.</p>}</div>}
      </fieldset>
    </div>}
  </div>
}
