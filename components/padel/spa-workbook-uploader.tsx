'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { parseSPAWorkbookSheets, type SPAWorkbookImport } from '@/lib/spa-workbook-import'
import { importSPAWorkbook } from '@/app/dashboard/padel/rankings/import-actions'

type Event = { id: string; name: string; event_date: string }
export function SPAWorkbookUploader({ events, importReady = false }: { events: Event[]; importReady?: boolean }) {
  const [payload, setPayload] = useState<SPAWorkbookImport | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [filename, setFilename] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const sources = [...new Set(payload?.results.map((r) => r.source_tournament_id) || [])]

  async function readFile(file?: File) {
    setPayload(null); setError(null); setFilename(''); setMapping({})
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.xlsx') || file.size > 5 * 1024 * 1024) { setError('Choose an .xlsx workbook smaller than 5 MB'); return }
    setReading(true)
    try {
      const XLSX = await import('xlsx')
      const book = XLSX.read(await file.arrayBuffer(), { type: 'array', cellFormula: false })
      const sheets = Object.fromEntries(book.SheetNames.map((name) => [name,
        XLSX.utils.sheet_to_json<unknown[]>(book.Sheets[name], { header: 1, raw: true, defval: null })]))
      const parsed = parseSPAWorkbookSheets(sheets)
      setPayload(parsed); setFilename(file.name)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not read the workbook') }
    finally { setReading(false) }
  }

  function save() {
    if (!payload) return
    startTransition(async () => {
      try {
        const result = await importSPAWorkbook(payload, mapping)
        if ('error' in result) { setError(result.error || 'Import failed'); return }
        toast.success('Workbook imported — player totals and rankings recalculated')
        setPayload(null); setFilename(''); setError(null); router.refresh()
      } catch (err) { setError(err instanceof Error ? err.message : 'Import failed') }
    })
  }

  return <section className="space-y-4 rounded-xl border bg-card p-5">
    <div><h2 className="text-lg font-semibold">Upload SPA workbook</h2>
      <p className="mt-1 text-sm text-muted-foreground">Reads Leaderboard, Player results, Points rules and Developer notes. Adds missing player identities, updates final results and recalculates rankings together. Existing player names and flags are preserved.</p></div>
    <div><Label htmlFor="spa-workbook">Spreadsheet (.xlsx)</Label>
      <input id="spa-workbook" type="file" accept=".xlsx" className="mt-2 block w-full text-sm" disabled={reading || pending}
        onChange={(event) => void readFile(event.target.files?.[0])} /></div>
    {!importReady && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Workbook preview is available. Importing requires the pending workbook database setup; no data will be saved until it is enabled.</p>}
    {reading && <p role="status" className="text-sm">Reading workbook…</p>}
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {payload && <div className="space-y-4">
      <p className="text-sm font-medium">{filename}: {payload.players.length} player identities · {payload.results.length} results · {sources.length} tournaments</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="p-2 text-left text-xs text-muted-foreground">Preview of the first 10 player identities</caption>
          <thead className="bg-muted"><tr><th className="p-2">Player</th><th className="p-2">Identity key</th><th className="p-2">Results</th></tr></thead>
          <tbody>{payload.players.slice(0, 10).map((player) => <tr className="border-t" key={player.canonical_player_id}>
            <td className="p-2">{player.display_name}</td><td className="p-2 font-mono text-xs">{player.canonical_player_id}</td>
            <td className="p-2">{payload.results.filter((result) => result.canonical_player_id === player.canonical_player_id).length}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{sources.map((source) => <div key={source}>
        <Label htmlFor={`event-${source}`}>Workbook {source} → event</Label>
        <select id={`event-${source}`} value={mapping[source] || ''} disabled={pending}
          className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          onChange={(event) => setMapping((current) => ({ ...current, [source]: event.target.value }))}>
          <option value="">Choose the matching event</option>
          {events.map((event) => <option key={event.id} value={event.id}>{event.name} — {event.event_date}</option>)}
        </select></div>)}</div>
      <p className="text-sm text-muted-foreground">Review the event mapping before importing. Re-uploading the same result keys updates them without adding duplicates. For this handoff, T1 is Birmingham and T2 is London. London group totals retain the source workbook's 32-points-per-game assumption.</p>
      <Button onClick={save} disabled={!importReady || pending || sources.some((source) => !mapping[source])}>{pending ? 'Importing…' : 'Import workbook and recalculate'}</Button>
    </div>}
  </section>
}
