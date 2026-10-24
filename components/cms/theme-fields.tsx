'use client'

import { Input } from '@/components/ui/input'
import { themeSchema, type SiteTheme } from '@/lib/cms/theme'

export function ThemeFields({ value, onChange }: { value?: SiteTheme; onChange: (theme: SiteTheme | undefined) => void }) {
  const theme = value ?? themeSchema.parse({})
  return <section className="space-y-4 rounded-xl border p-5">
    <h3 className="font-semibold">Typography and control styling</h3>
    <p className="text-sm text-muted-foreground">Existing programme layouts remain unchanged until you save, preview and publish these settings. Bespoke programme CSS can intentionally retain its own styling.</p>
    <label className="block space-y-2 text-sm">Font family<select className="w-full rounded-lg border bg-background p-3" value={theme.font} onChange={event => onChange({ ...theme, font: themeSchema.shape.font.parse(event.target.value) })}>{[['current', 'Keep existing fonts'], ['inter', 'Inter'], ['system', 'System sans-serif'], ['serif', 'Georgia serif']].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label className="block space-y-2 text-sm">Shared corner radius (0–32 pixels)<Input type="number" min={0} max={32} value={theme.radius} onChange={event => { const radius = Number(event.target.value); if (Number.isFinite(radius)) onChange({ ...theme, radius }) }} /></label>
    <label className="block space-y-2 text-sm">Shared button shape<select className="w-full rounded-lg border bg-background p-3" value={theme.buttonStyle} onChange={event => onChange({ ...theme, buttonStyle: themeSchema.shape.buttonStyle.parse(event.target.value) })}>{[['current', 'Keep existing button shapes'], ['rounded', 'Rounded'], ['pill', 'Pill'], ['square', 'Square']].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <button type="button" className="text-sm underline" onClick={() => onChange(undefined)}>Reset to existing website styling in this draft</button>
  </section>
}
