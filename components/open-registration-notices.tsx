'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { OpenOpportunity } from '@/lib/registration-window-status'

const SLIDE_DURATION = 5000

export function OpenRegistrationNotices({ initialOpportunities }: { initialOpportunities: OpenOpportunity[] }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [visible, setVisible] = useState(true)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const count = opportunities.length
  const activeIndex = count ? index % count : 0
  const paused = hovered || focused || userPaused || reducedMotion || !visible

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(preference.matches)
    updateMotion()
    preference.addEventListener('change', updateMotion)
    return () => preference.removeEventListener('change', updateMotion)
  }, [])

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
    const onVisible = () => {
      const isVisible = document.visibilityState === 'visible'
      setVisible(isVisible)
      if (isVisible) void refresh()
    }
    onVisible()
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 60000)
    document.addEventListener('visibilitychange', onVisible)
    return () => { disposed = true; controller?.abort(); window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  useEffect(() => {
    if (paused || count < 2) return
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % count), SLIDE_DURATION)
    return () => window.clearTimeout(timer)
  }, [index, count, paused])

  const move = (direction: number) => setIndex(current => (current + direction + count) % count)
  if (!count) return null

  return <section aria-label="Open applications and interest forms" aria-roledescription="carousel"
    className="mt-6 w-full max-w-xl" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false) }}
    onKeyDown={event => { if (count > 1 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) } }}>
    <div className="mb-2.5 flex items-center justify-between">
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Open now at Devanhaar</p>
      <span className="text-[10px] tabular-nums tracking-widest text-white/60">{String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
    </div>
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#101b2d]/85 shadow-lg backdrop-blur-xl"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={event => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; swiped.current = false }}
      onTouchEnd={event => {
        const start = touchStart.current
        touchStart.current = null
        if (!start || count < 2) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - start.x
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) { swiped.current = true; move(dx < 0 ? 1 : -1) }
      }} onTouchCancel={() => { touchStart.current = null }}
      onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false } }}>
      <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {opportunities.map((item, position) => <div key={item.id} role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${count}`} aria-hidden={position !== activeIndex} className="w-full shrink-0">
          <Link href={item.href} tabIndex={position === activeIndex ? 0 : -1}
            className="group flex min-h-[108px] items-center gap-3 px-4 py-4 outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 sm:gap-4 sm:px-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10"><CalendarDays aria-hidden="true" className="h-5 w-5 text-amber-400" /></span>
            <div className="min-w-0 flex-1"><p className="text-base font-semibold leading-snug text-white sm:text-lg">{item.title}</p><p className="mt-1.5 text-xs font-medium text-white/70">{item.kind === 'application' ? 'Applications open' : 'Register interest'}</p></div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[#101b2d] transition-transform group-hover:translate-x-0.5"><ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
          </Link>
        </div>)}
      </div>
    </div>
    {count > 1 && <div className="mt-2 flex items-center gap-3">
      <div className="flex min-w-0 flex-1 gap-1.5" aria-label="Choose an announcement">
        {opportunities.map((item, position) => <button key={item.id} type="button" aria-label={`Show ${item.title}`} aria-current={position === activeIndex ? 'true' : undefined} onClick={() => setIndex(position)} className="group flex h-7 min-w-0 flex-1 items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
          <span className="relative h-0.5 w-full overflow-hidden rounded-full bg-white/25">
            {position === activeIndex && <span key={`${item.id}-${index}-${paused}`} className="absolute inset-0 origin-left rounded-full bg-amber-400" style={!paused ? { animation: `devanhaarNoticeProgress ${SLIDE_DURATION}ms linear forwards` } : undefined} />}
          </span>
        </button>)}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous announcement" onClick={() => move(-1)} className="notice-control"><ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" /></button>
        {!reducedMotion && <button type="button" aria-label={userPaused ? 'Play announcements' : 'Pause announcements'} onClick={() => setUserPaused(current => !current)} className="notice-control">{userPaused ? <Play aria-hidden="true" className="h-3 w-3" /> : <Pause aria-hidden="true" className="h-3 w-3" />}</button>}
        <button type="button" aria-label="Next announcement" onClick={() => move(1)} className="notice-control"><ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
      </div>
    </div>}
    <style jsx>{`
      .notice-control { display: flex; height: 28px; width: 28px; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.8); transition: background-color .2s, color .2s; }
      .notice-control:hover { background: rgba(255,255,255,.1); color: #fbbf24; }
      .notice-control:focus-visible { outline: 2px solid #fcd34d; outline-offset: 2px; }
    `}</style>
    <style>{`@keyframes devanhaarNoticeProgress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
  </section>
}
