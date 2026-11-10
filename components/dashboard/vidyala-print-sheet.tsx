'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import type { VidyalaApplicationRow } from './vidyala-applications-table'

type Preview = { status: 'loading' | 'unavailable' | 'missing' } | { status: 'ready'; pages: string[] }

async function preparePages(path: string, signal: AbortSignal, objectUrl: (blob: Blob) => string) {
  const response = await fetch('/api/camp-applications/view-id?source=vidyala&print=1&path=' + encodeURIComponent(path), {
    cache: 'no-store',
    signal,
  })
  if (!response.ok) throw new Error('ID unavailable')
  const file = await response.blob()
  const extension = path.split('.').pop()?.toLowerCase()
  if (extension === 'pdf' || new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) === '%PDF-') {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = '/vidyala-print-assets/pdf.worker.min.mjs'
    const data = await file.arrayBuffer()
    signal.throwIfAborted()
    const task = pdfjs.getDocument({ data, wasmUrl: '/vidyala-print-assets/wasm/', isEvalSupported: false, useSystemFonts: true })
    const cancel = () => { void task.destroy().catch(() => {}) }
    signal.addEventListener('abort', cancel, { once: true })
    try {
      const pdf = await task.promise
      const pages: string[] = []
      for (let index = 1; index <= pdf.numPages; index++) {
        signal.throwIfAborted()
        const page = await pdf.getPage(index)
        const original = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: 1600 / Math.max(original.width, original.height) })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        await page.render({ canvas, viewport }).promise
        const image = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not render ID page')), 'image/png')
        })
        pages.push(objectUrl(image))
        page.cleanup()
        canvas.width = canvas.height = 0
      }
      return pages
    } finally {
      signal.removeEventListener('abort', cancel)
      if (!signal.aborted) await task.destroy()
    }
  }

  if (extension === 'heic' || extension === 'heif') {
    const { heicTo } = await import('heic-to/csp')
    return [objectUrl(await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 }))]
  }
  return [objectUrl(file)]
}

export function VidyalaPrintSheet({ application, onClose, children }: {
  application: VidyalaApplicationRow
  onClose: () => void
  children: ReactNode
}) {
  const path = application.id_document_url
  const [preview, setPreview] = useState<Preview>({ status: path ? 'loading' : 'missing' })
  const name = [application.first_name, application.middle_name, application.last_name].filter(Boolean).join(' ')

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    const urls: string[] = []
    const objectUrl = (blob: Blob) => {
      controller.signal.throwIfAborted()
      const url = URL.createObjectURL(blob)
      urls.push(url)
      return url
    }
    const timeout = window.setTimeout(() => {
      controller.abort()
      setPreview({ status: 'unavailable' })
    }, 45_000)
    void preparePages(path, controller.signal, objectUrl).then(async (pages) => {
      // Wait for every page to decode before enabling the print button.
      await Promise.all(pages.map(async (src) => {
        const image = new Image()
        image.src = src
        await image.decode()
      }))
      if (!controller.signal.aborted) setPreview({ status: 'ready', pages })
    }).catch(() => {
      if (!controller.signal.aborted) setPreview({ status: 'unavailable' })
    }).finally(() => window.clearTimeout(timeout))
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [path])

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => window.print()} disabled={preview.status === 'loading'}>
          {preview.status === 'loading' ? 'Preparing ID…' : preview.status === 'unavailable' ? 'Print without ID' : 'Print / Save as PDF'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
      {preview.status === 'unavailable' && <p role="alert" className="text-sm">The ID could not be included. Use “View document” in the Documents section to open or print it separately.</p>}
      {preview.status === 'missing' && <p className="text-sm">No ID document was uploaded.</p>}
      {preview.status !== 'loading' && createPortal(
        <article className="vidyala-print-sheet">
          <style>{`
            @page { size: A4; margin: 14mm; }
            @media screen { .vidyala-print-sheet { display: none; } }
            @media print {
              html:has(.vidyala-print-sheet), body:has(.vidyala-print-sheet) {
                height: auto !important; overflow: visible !important; margin: 0 !important;
              }
              body:has(> .vidyala-print-sheet) > :not(.vidyala-print-sheet) { display: none !important; }
              .vidyala-print-sheet { color: #000; background: #fff; font: 11pt/1.4 system-ui, sans-serif; }
              .vidyala-print-sheet h1 { font-size: 20pt; font-weight: 700; }
              .vidyala-print-sheet h2, .vidyala-print-sheet h3 { font-weight: 700; break-after: avoid; }
              .vidyala-print-sheet section { margin: 10pt 0; padding: 0; border: 0; background: none; }
              .vidyala-print-sheet .grid { display: block; }
              .vidyala-print-sheet .grid .rounded-md { display: block; margin: 0 0 5pt; padding: 0; border: 0; background: none; }
              .vidyala-print-sheet .rounded-md > span { font-weight: 600; break-after: avoid; }
              .vidyala-print-sheet .rounded-md > div { font-size: 10pt; line-height: 1.35; overflow-wrap: anywhere; }
              .vidyala-print-sheet * { color: #000 !important; }
              .vidyala-id-page { break-before: page; break-inside: avoid; }
              .vidyala-id-page img { display: block; width: auto; max-width: 100%; max-height: 238mm; margin: 8pt auto 0; object-fit: contain; }
            }
          `}</style>
          <header>
            <h1>{name}</h1>
            <p>Sikhi Vidyala application #{application.id} · Confidential</p>
          </header>
          {children}
          {preview.status === 'ready' && preview.pages.map((src, index) => (
            <section className="vidyala-id-page" key={src}>
              <h2>Applicant ID · {name} · #{application.id}</h2>
              <p>Page {index + 1} of {preview.pages.length}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- local, private print image */}
              <img src={src} alt={`Applicant ID page ${index + 1}`} />
            </section>
          ))}
          {preview.status === 'unavailable' && <p>Applicant ID could not be included in this printout.</p>}
        </article>,
        document.body,
      )}
    </div>
  )
}
