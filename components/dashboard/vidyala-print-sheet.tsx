'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import type { VidyalaApplicationRow } from './vidyala-applications-table'

type DocumentPages = { label: string; pages: string[] }
type Packet = { row: VidyalaApplicationRow; documents: DocumentPages[] }

function applicantName(row: VidyalaApplicationRow) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' ')
}

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

export function VidyalaPrintSheet({ applications, onClose, renderApplication, autoPrint = false }: {
  applications: readonly VidyalaApplicationRow[]
  onClose: () => void
  renderApplication: (row: VidyalaApplicationRow) => ReactNode
  autoPrint?: boolean
}) {
  const [packets, setPackets] = useState<Packet[] | null>(null)
  const [finished, setFinished] = useState(0)
  const didAutoPrint = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    const urls: string[] = []
    async function prepare() {
      const result: Packet[] = []
      for (const row of applications) {
        const documents: DocumentPages[] = []
        for (const [label, path] of [['Applicant ID', row.id_document_url], ['DBS certificate', row.dbs_certificate_url]] as const) {
          if (controller.signal.aborted) return
          if (!path) continue
          const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(45_000)])
          const fileUrls: string[] = []
          let pages: string[] = []
          try {
            pages = await preparePages(path, signal, (blob) => {
              signal.throwIfAborted()
              const url = URL.createObjectURL(blob)
              urls.push(url)
              fileUrls.push(url)
              return url
            })
            for (const src of pages) {
              const image = new Image()
              image.src = src
              await image.decode()
            }
            signal.throwIfAborted()
          } catch {
            fileUrls.forEach((url) => URL.revokeObjectURL(url))
            pages = []
          }
          if (controller.signal.aborted) return
          documents.push({ label, pages })
        }
        result.push({ row, documents })
        if (result.length % 5 === 0 || result.length === applications.length) setFinished(result.length)
      }
      if (!controller.signal.aborted) setPackets(result)
    }
    void prepare()
    return () => {
      controller.abort()
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [applications])

  const failures = packets?.flatMap(({ row, documents }) =>
    documents.filter(({ pages }) => !pages.length).map(({ label }) => ({ row, label }))
  ) ?? []
  const canAutoPrint = autoPrint && packets !== null && failures.length === 0
  useEffect(() => {
    if (!canAutoPrint || didAutoPrint.current) return
    const frame = window.requestAnimationFrame(() => {
      didAutoPrint.current = true
      window.print()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [canAutoPrint])

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => window.print()} disabled={!packets}>
          {!packets ? 'Preparing documents…' : failures.length ? 'Print with missing documents' : 'Print / Save as PDF'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
      {!packets && <p role="status" className="text-sm">Prepared {finished} of {applications.length} applications.</p>}
      {!!failures.length && (
        <div role="alert" className="text-sm">
          <p>Some uploaded documents could not be included. Close and try again, or print with these documents missing:</p>
          <ul className="mt-2 max-h-36 list-disc overflow-auto pl-5">
            {failures.map(({ row, label }) => <li key={row.id + label}>{applicantName(row)} (#{row.id}): {label}</li>)}
          </ul>
        </div>
      )}
      {packets && createPortal(
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
              .vidyala-print-application + .vidyala-print-application { break-before: page; }
              .vidyala-id-page { break-before: page; break-inside: avoid; }
              .vidyala-id-page img { display: block; width: auto; max-width: 100%; max-height: 238mm; margin: 8pt auto 0; object-fit: contain; }
            }
          `}</style>
          {packets.map(({ row, documents }) => (
            <div className="vidyala-print-application" key={row.id}>
              <header>
                <h1>{applicantName(row)}</h1>
                <p>Sikhi Vidyala application #{row.id} · Confidential</p>
              </header>
              {renderApplication(row)}
              {documents.map(({ label, pages }) => pages.length ? pages.map((src, index) => (
                <section className="vidyala-id-page" key={src}>
                  <h2>{label} · {applicantName(row)} · #{row.id}</h2>
                  <p>Page {index + 1} of {pages.length}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local, private print image */}
                  <img src={src} alt={`${label}, page ${index + 1}`} />
                </section>
              )) : <p key={label}>{label} could not be included in this printout.</p>)}
            </div>
          ))}
        </article>,
        document.body,
      )}
    </div>
  )
}
