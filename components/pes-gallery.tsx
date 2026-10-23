'use client'

import { applyPageCopy } from '@/lib/cms/copy-node'
import { usePageCopy } from '@/components/cms/page-copy-provider'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { pesPhotos } from '@/lib/pes-gallery-photos'

export function PesGallery() {
  const cmsCopy = usePageCopy()

  const [active, setActive] = useState<number | null>(null)
  const lastTrigger = useRef<HTMLButtonElement | null>(null)
  const photo = active === null ? null : pesPhotos[active]
  const move = (offset: number) => setActive(index => index === null ? null : (index + offset + pesPhotos.length) % pesPhotos.length)

  return applyPageCopy(((
    <section aria-labelledby="pes-gallery-heading" className="border-t border-border bg-white py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-6 lg:px-12">
        <div className="mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(43,100%,29%)]">Our partner school</p>
          <h2 id="pes-gallery-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Learning, connection and opportunity.</h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">A glimpse of life at Maharaja Ranjit Singh Public School — from classroom learning and creative activities to moments shared together.</p>
          <p className="mt-3 text-sm text-muted-foreground">Select a photograph to view it in full.</p>
        </div>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {pesPhotos.map((item, index) => (
            <button key={item.src} type="button" aria-label={`Open photograph ${index + 1}: ${item.alt}`} aria-haspopup="dialog"
              onClick={event => { lastTrigger.current = event.currentTarget; setActive(index) }}
              className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-[#f8f8f5] text-left outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4">
              <img src={item.thumbnail} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async"
                className="h-auto w-full transition-transform duration-300 motion-safe:group-hover:scale-[1.025]" />
              <span aria-hidden="true" className="absolute bottom-3 right-3 rounded-full bg-[#101b2d]/80 p-2.5 text-white"><Expand className="h-4 w-4" /></span>
            </button>
          ))}
        </div>
      </div>
      <Dialog open={active !== null} onOpenChange={open => { if (!open) setActive(null) }}>
        <DialogContent className="max-h-[95dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto rounded-2xl border-white/15 bg-[#101b2d] p-4 pt-12 text-white sm:p-6 sm:pt-12"
          onCloseAutoFocus={event => { event.preventDefault(); lastTrigger.current?.focus() }}
          onKeyDown={event => {
            if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
            if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
          }}>
          <DialogTitle className="sr-only">Punjab Education Support photo gallery</DialogTitle>
          <DialogDescription className="sr-only">Use the previous and next buttons or arrow keys to browse. Press Escape to close.</DialogDescription>
          {photo && <>
            <img key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
              className="mx-auto max-h-[70dvh] w-auto max-w-full object-contain" />
            <div className="flex items-center justify-between gap-4">
              <button type="button" aria-label="Previous photograph" onClick={() => move(-1)} className="shrink-0 rounded-full border border-white/30 p-3 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><ChevronLeft className="h-5 w-5" /></button>
              <div aria-live="polite" aria-atomic="true" className="text-center"><p className="text-sm text-white/90">{photo.alt}</p><p className="mt-1 text-xs text-white/60">{(active ?? 0) + 1} of {pesPhotos.length}</p></div>
              <button type="button" aria-label="Next photograph" onClick={() => move(1)} className="shrink-0 rounded-full border border-white/30 p-3 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  )), cmsCopy)
}
