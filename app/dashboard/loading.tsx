export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div>
        <div className="h-7 w-48 rounded bg-muted" />
        <div className="mt-2 h-4 w-72 rounded bg-muted/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="h-4 w-24 rounded bg-muted/70" />
            <div className="mt-3 h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-muted/70" />
              <div className="h-4 flex-1 rounded bg-muted/70" />
              <div className="h-4 w-20 rounded bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
