'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Row = {
  id: string; email: string; name: string | null; source: string; created_at: string
  status: 'active' | 'unsubscribed'; subscribed_at: string | null; unsubscribed_at: string | null
  consent_at: string | null; consent_statement: string | null
}
const date = (value: string | null) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Europe/London' }) : 'Not recorded'

export function NewsletterSubscribers() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState(''), [status, setStatus] = useState('active'), [consent, setConsent] = useState('all'), [source, setSource] = useState('all')
  const [page, setPage] = useState(1), [total, setTotal] = useState(0), [loading, setLoading] = useState(true)
  const [error, setError] = useState(''), [warning, setWarning] = useState(''), [busy, setBusy] = useState(false), [version, setVersion] = useState(0)
  const params = new URLSearchParams({ q, status, consent, source, page: String(page) }).toString()
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/cms/subscribers?${params}`, { signal: controller.signal })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setRows(result.rows); setTotal(result.total); setError('')
      })
      .catch(error => { if (error.name !== 'AbortError') setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [params, version])

  async function unsubscribe(row: Row) {
    if (!confirm(`Unsubscribe ${row.email}? Their record will be kept, and they can subscribe again themselves.`)) return
    setBusy(true); setError(''); setWarning('')
    try {
      const response = await fetch('/api/cms/subscribers', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, status: 'unsubscribed', expectedStatus: row.status }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      if (result.warning) setWarning(result.warning)
      setVersion(value => value + 1)
    } catch (error) { setError(error instanceof Error ? error.message : 'Update failed.') }
    finally { setBusy(false) }
  }

  return <section className="space-y-4">
    <div className="flex flex-wrap items-end gap-3">
      <label className="grow text-sm">Search email<Input value={q} maxLength={100} onChange={event => { setQ(event.target.value); setPage(1) }} /></label>
      <label className="text-sm">Status<select className="ml-3 rounded-lg border bg-background p-2" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="active">Active</option><option value="unsubscribed">Unsubscribed</option><option value="all">All subscribers</option></select></label>
      <label className="text-sm">Consent evidence<select className="ml-3 rounded-lg border bg-background p-2" value={consent} onChange={event => { setConsent(event.target.value); setPage(1) }}><option value="all">All records</option><option value="recorded">Explicit consent recorded</option><option value="unknown">Evidence not recorded</option></select></label>
      <label className="text-sm">Source<select className="ml-3 rounded-lg border bg-background p-2" value={source} onChange={event => { setSource(event.target.value); setPage(1) }}><option value="all">All sources</option><option value="website">Website</option><option value="legacy">Legacy records</option></select></label>
      <a className="rounded-lg border px-4 py-2 text-sm" href={`/api/cms/subscribers?${params}&export=csv`}>Export filtered CSV</a>
    </div>
    <p className="text-sm text-muted-foreground">Legacy records are retained. An active status or record-creation date is not proof of consent; missing evidence is shown explicitly.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {warning && <p role="status" className="text-sm text-amber-700">{warning}</p>}
    {loading ? <p role="status">Loading subscribers...</p> : <>
      <p className="text-sm text-muted-foreground">{total} subscribers</p>
      <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm">
        <thead className="bg-muted"><tr>{['Contact', 'Status', 'Source', 'Record created', 'Consent evidence', 'Actions'].map(label => <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t">
          <td className="p-3">{row.email}{row.name && <p className="mt-1 text-xs text-muted-foreground">{row.name}</p>}</td>
          <td className="p-3 capitalize">{row.status}{row.unsubscribed_at && <p className="mt-1 text-xs">{date(row.unsubscribed_at)}</p>}</td>
          <td className="p-3">{row.source}</td><td className="p-3">{date(row.created_at)}</td>
          <td className="p-3"><p>{date(row.consent_at)}</p>{row.consent_statement && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{row.consent_statement}</p>}</td>
          <td className="p-3">{row.status === 'active' ? <Button variant="outline" size="sm" disabled={busy} onClick={() => void unsubscribe(row)}>Unsubscribe</Button> : <span className="text-xs text-muted-foreground">Consent withdrawn</span>}</td>
        </tr>)}</tbody>
      </table>{!rows.length && <p className="p-6 text-sm text-muted-foreground">No subscribers match.</p>}</div>
      <nav aria-label="Subscriber pages" className="flex items-center gap-4"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / 25))}</span><Button variant="outline" disabled={page * 25 >= total} onClick={() => setPage(page + 1)}>Next</Button></nav>
    </>}
  </section>
}
