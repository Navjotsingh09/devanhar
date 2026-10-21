import Link from 'next/link'
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Inbox, Search, SlidersHorizontal } from 'lucide-react'
import { listHref, sources, PAGE_SIZE, type ListParams, type ListRow, type SubmissionSource } from '@/lib/crm/submissions'
import { RecordStatus } from '@/components/dashboard/record-status'

export function SubmissionsList({ params, rows, count, error, fixedSource, basePath, title, datasetOptions, recordHref, exportHref, headingLevel = 1 }: {
  params: ListParams; rows: ListRow[]; count: number; error?: string; fixedSource?: SubmissionSource;
  basePath?: string; title?: string; datasetOptions?: Array<{ source: SubmissionSource; label: string }>;
  recordHref?: (row: ListRow) => string; exportHref?: string; headingLevel?: 1 | 2;
}) {
  const pathname = basePath || (fixedSource ? '/dashboard/recovery-payments' : '/dashboard/submissions')
  const Heading = headingLevel === 2 ? 'h2' : 'h1'
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const detailQuery = new URLSearchParams({ page: String(params.page), ...(params.q ? { q: params.q } : {}), ...(params.status ? { status: params.status } : {}), ...(params.direction === 'oldest' ? { order: 'oldest' } : {}) }).toString()
  const datasets = datasetOptions || Object.entries(sources).map(([source, config]) => ({ source: source as SubmissionSource, label: config.label }))
  return <div className="crm-page space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="crm-eyebrow mb-3">Devanhaar · Records</p><Heading className="crm-page-title">{title || (fixedSource ? 'Recovered payments' : 'Submissions')}</Heading><p className="crm-subtitle mt-2">{sources[params.source].label}. Find a record and pick up where you left off.</p></div>
      {!error && rows.length > 0 && <a className="crm-action" href={exportHref || listHref(params, {}, '/api/crm/submissions/export')}><ArrowDownToLine />Export this page<span className="sr-only"> (up to 25 rows)</span></a>}
    </div>
    {(!fixedSource || datasetOptions) && <nav aria-label="Submission datasets" className="crm-datasets">{datasets.map(item => ['spn_submissions', 'wolfrun_fundraisers'].includes(item.source) ? <span key={item.source} aria-disabled="true">{item.label} (unavailable)</span> : <Link prefetch={false} key={item.source} href={listHref(params, { source: item.source, page: 1, q: '', status: '' }, pathname)} aria-current={params.source === item.source ? 'page' : undefined}>{item.label}</Link>)}</nav>}
    <form key={`${params.source}:${params.q}:${params.status}:${params.direction}`} action={pathname} className="crm-filter">
      <input type="hidden" name="source" value={params.source} />
      <label htmlFor="crm-record-search" className="sm:min-w-[230px]"><span>Search name or email</span><span className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input id="crm-record-search" type="search" name="q" defaultValue={params.q} placeholder="Find a record…" maxLength={100} className="w-full !pl-9" /></span></label>
      <label htmlFor="crm-record-status"><span>Status (exact value)</span><input id="crm-record-status" name="status" defaultValue={params.status} placeholder="All statuses" maxLength={50} /></label>
      <div className="crm-order-field"><label htmlFor="crm-record-order">Order</label><select id="crm-record-order" name="order" defaultValue={params.direction}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
      <button className="crm-action crm-action-primary"><SlidersHorizontal />Apply filters</button>
      <Link prefetch={false} href={listHref(params, { page: 1, q: '', status: '', direction: 'newest' }, pathname)} className="px-2 py-3 text-xs text-muted-foreground underline underline-offset-4">Clear filters</Link>
    </form>
    {error ? <div role="alert" className="crm-panel p-6"><h2 className="font-medium">We couldn’t load these records</h2><p className="crm-subtitle mt-2">{error}</p><Link prefetch={false} href={listHref(params, {}, pathname)} className="crm-action mt-4">Try again<ArrowRight /></Link></div> : <section className="crm-panel overflow-hidden" aria-label="Records">
      <div className="crm-table-wrap"><table className="crm-table"><caption className="sr-only">{sources[params.source].label}, up to {PAGE_SIZE} records per page</caption><thead><tr>{['Name', 'Email', 'Status', 'Date', 'Actions'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>
        <td><div className="flex items-center gap-3"><span aria-hidden="true" className="crm-avatar">{row.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span><span className="font-medium">{row.name}</span></div></td>
        <td className="break-all text-muted-foreground">{row.email || '—'}</td><td><RecordStatus status={row.status} /></td><td className="whitespace-nowrap text-muted-foreground">{row.date ? new Date(row.date).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }) : '—'}</td>
        <td><Link prefetch={false} className="crm-open" href={(recordHref ? recordHref(row) : `/dashboard/submissions/${params.source}/${encodeURIComponent(row.id)}`) + '?' + detailQuery}>Open record<ArrowUpRight className="h-3.5 w-3.5" /><span className="sr-only"> for {row.name}</span></Link></td>
      </tr>)}{!rows.length && <tr><td colSpan={5}><div className="crm-empty"><Inbox aria-hidden="true" className="mx-auto mb-3 h-7 w-7 opacity-50" /><p className="font-medium text-foreground">No matching records on this page.</p><p className="mt-2 text-xs">Try clearing your filters{params.page > 1 ? ' or returning to the first page' : ''}.</p></div></td></tr>}</tbody></table></div>
      <nav aria-label="Submission pagination" className="crm-pagination"><p>Page {params.page} of {totalPages} · {count} matching records · {rows.length} shown</p><div className="flex items-center gap-2">{params.page > 1 && <Link prefetch={false} className="crm-action" href={listHref(params, { page: params.page - 1 }, pathname)}><ArrowLeft />Previous</Link>}{params.page < totalPages && <Link prefetch={false} className="crm-action" href={listHref(params, { page: params.page + 1 }, pathname)}>Next<ArrowRight /></Link>}{params.page > totalPages && <Link prefetch={false} className="crm-action crm-action-primary" href={listHref(params, { page: 1 }, pathname)}>First page<ArrowRight /></Link>}</div></nav>
    </section>}
    <p className="text-xs text-muted-foreground">Up to {PAGE_SIZE} records per page. Open a record to view its details.</p>
  </div>
}
