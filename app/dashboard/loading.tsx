export default function DashboardLoading() {
  return <div className="crm-page space-y-6" role="status" aria-label="Loading records">
    <span className="sr-only">Loading your workspace…</span>
    <div className="animate-pulse" aria-hidden="true"><div className="h-3 w-36 rounded bg-muted" /><div className="mt-4 h-8 w-52 rounded bg-muted" /><div className="mt-3 h-4 w-72 max-w-full rounded bg-muted" /></div>
    <div className="crm-panel overflow-hidden animate-pulse" aria-hidden="true"><div className="h-12 border-b bg-muted/40" />{Array.from({length:5},(_,i)=><div className="flex items-center gap-5 border-b p-5 last:border-0" key={i}><div className="h-8 w-8 rounded-full bg-muted" /><div className="h-3 flex-1 rounded bg-muted" /><div className="h-3 w-20 rounded bg-muted" /></div>)}</div>
  </div>
}
