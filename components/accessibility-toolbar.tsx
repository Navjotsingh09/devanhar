"use client"

import { Accessibility, Contrast, RotateCcw, Type } from "lucide-react"
import { useEffect, useState } from "react"

type TextScale = 1 | 1.25 | 1.5 | 2

type Preferences = {
  textScale: TextScale
  highContrast: boolean
  dyslexiaFont: boolean
}

const defaultPreferences: Preferences = { textScale: 1, highContrast: false, dyslexiaFont: false }

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("devanhaar-accessibility") || "null") as Partial<Preferences> | null
      if (stored) {
        setPreferences({
          textScale: stored.textScale === 1.25 || stored.textScale === 1.5 || stored.textScale === 2 ? stored.textScale : 1,
          highContrast: stored.highContrast === true,
          dyslexiaFont: stored.dyslexiaFont === true,
        })
      }
    } catch {
      setPreferences(defaultPreferences)
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty("--a11y-text-scale", String(preferences.textScale))
    document.documentElement.classList.toggle("a11y-high-contrast", preferences.highContrast)
    document.documentElement.classList.toggle("a11y-dyslexia-font", preferences.dyslexiaFont)
    localStorage.setItem("devanhaar-accessibility", JSON.stringify(preferences))
  }, [preferences])

  const reset = () => setPreferences(defaultPreferences)

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-border bg-background p-4 text-foreground shadow-xl" id="accessibility-settings" role="region" aria-label="Accessibility settings">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Accessibility settings</p>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted" title="Reset accessibility settings">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
          <fieldset className="mb-4">
            <legend className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"><Type className="h-4 w-4" /> Text size</legend>
            <div className="grid grid-cols-4 gap-1">
              {([1, 1.25, 1.5, 2] as TextScale[]).map((scale) => (
                <button key={scale} type="button" onClick={() => setPreferences((current) => ({ ...current, textScale: scale }))} aria-pressed={preferences.textScale === scale} className="rounded-md border border-border px-2 py-2 text-xs hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background">
                  {scale * 100}%
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <button type="button" onClick={() => setPreferences((current) => ({ ...current, highContrast: !current.highContrast }))} aria-pressed={preferences.highContrast} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"><Contrast className="h-4 w-4" /> High contrast</button>
            <button type="button" onClick={() => setPreferences((current) => ({ ...current, dyslexiaFont: !current.dyslexiaFont }))} aria-pressed={preferences.dyslexiaFont} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"><Type className="h-4 w-4" /> Dyslexia-friendly font</button>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="accessibility-settings" aria-label="Open accessibility settings" className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
        <Accessibility className="h-5 w-5" />
      </button>
    </div>
  )
}
