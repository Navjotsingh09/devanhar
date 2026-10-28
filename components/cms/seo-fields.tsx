'use client'

import { Input } from '@/components/ui/input'
import { MediaField } from './media-field'
import type { PageSeo } from '@/lib/cms/seo'

export function SeoFields({ value, onChange }: { value: PageSeo; onChange: (value: PageSeo) => void }) {
  return <div className="space-y-5">
    <label className="block space-y-2 text-sm font-medium">Search title<Input maxLength={160} value={value.title} onChange={event => onChange({ ...value, title: event.target.value })} /></label>
    <label className="block space-y-2 text-sm font-medium">Search description<textarea maxLength={320} rows={3} className="w-full rounded-lg border bg-background p-3" value={value.description} onChange={event => onChange({ ...value, description: event.target.value })} /></label>
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={value.noIndex} onChange={event => onChange({ ...value, noIndex: event.target.checked })} />Ask search engines not to index this page</label>
    <label className="block space-y-2 text-sm font-medium">Social sharing title<Input maxLength={160} placeholder="Uses the search title when empty" value={value.socialTitle ?? ''} onChange={event => onChange({ ...value, socialTitle: event.target.value })} /></label>
    <label className="block space-y-2 text-sm font-medium">Social sharing description<textarea maxLength={320} rows={3} placeholder="Uses the search description when empty" className="w-full rounded-lg border bg-background p-3" value={value.socialDescription ?? ''} onChange={event => onChange({ ...value, socialDescription: event.target.value })} /></label>
    <MediaField label="Social sharing image" value={value.socialImage ?? ''} onChange={socialImage => onChange({ ...value, socialImage })} />
    <p className="text-sm text-muted-foreground">SEO changes use the same saved draft, preview and publish workflow as page content. Page addresses stay unchanged.</p>
  </div>
}
