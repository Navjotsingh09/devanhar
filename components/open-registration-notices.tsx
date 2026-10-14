'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { OpenOpportunity } from '@/lib/registration-window-status'

export function OpenRegistrationNotices({ initialOpportunities }: { initialOpportunities: OpenOpportunity[] }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  useEffect(() => {
    let disposed = false
    let controller: AbortController | null = null
    const refresh = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const response = await fetch('/api/open-registrations', { cache: 'no-store', signal: controller.signal })
        const data = await response.json()
        if (!disposed) setOpportunities(response.ok && Array.isArray(data.opportunities) ? data.opportunities : [])
      } catch (error) {
        if (!disposed && !(error instanceof Error && error.name === 'AbortError')) setOpportunities([])
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh() }
    void refresh()
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 60000)
    document.addEventListener('visibilitychange', onVisible)
    return () => { disposed = true; controller?.abort(); window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  if (!opportunities.length) return null
  return <div aria-labelledby="open-now-heading" className="mt-6 max-w-6xl">
    <p id="open-now-heading" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Open now</p>
    <div className="grid max-h-[30svh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-4">
      {opportunities.map(item => <Link key={item.id} href={item.href}
        className="group flex items-center gap-3 rounded-xl border border-white/20 bg-black/40 px-4 py-3 backdrop-blur-md transition hover:border-amber-400/50 hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
        <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-400" />
        <div className="min-w-0"><p className="text-sm font-semibold leading-snug text-white">{item.title}</p><p className="mt-1 text-xs text-white/75">{item.kind === 'application' ? 'Applications open' : 'Register interest'}</p></div>
        <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5" />
      </Link>)}
    </div>
  </div>
}
