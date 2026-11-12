import Link from 'next/link'

export function SfrBookingTicker() {
  return (
    <aside className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden bg-amber-400 text-slate-950">
      <Link href="/sfr/book?event=new-year-reset" className="flex h-full items-center overflow-hidden text-xs font-semibold tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-slate-950">
        <span className="sr-only">Sikh Family Retreat New Year Reset bookings are open. Book now.</span>
        <span aria-hidden="true" className="sfr-ticker-track">
          {[0, 1].map(copy => <span key={copy} className="sfr-ticker-copy">Bookings open · Sikh Family Retreat New Year Reset · Book now <span className="px-8">✦</span></span>)}
        </span>
      </Link>
      <style>{`
        .sfr-ticker-track { display: flex; width: max-content; animation: sfr-ticker 24s linear infinite; }
        .sfr-ticker-copy { display: flex; flex: none; align-items: center; white-space: nowrap; }
        @keyframes sfr-ticker { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .sfr-ticker-track { width: 100%; animation: none; }
          .sfr-ticker-copy:first-child { white-space: normal; line-height: 1.1; padding: 0 1rem; }
          .sfr-ticker-copy:nth-child(2) { display: none; }
        }
      `}</style>
    </aside>
  )
}
