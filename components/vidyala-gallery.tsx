"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const NAVY = "#1E3461"
const GOLD = "#F5A623"

const images = [
  "/initiatives/vidyala-highlight-1.jpg",
  "/initiatives/vidyala-highlight-2.jpg",
  "/initiatives/vidyala-highlight-4.jpg",
  "/initiatives/vidyala-highlight-5.jpg",
  "/initiatives/vidyala-highlight-6.jpg",
  "/initiatives/sikhi-vidyala-top.jpg",
]

export function VidyalaGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [])

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [])

  useEffect(() => {
    if (activeIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [activeIndex, close, prev, next])

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={`Open image ${i + 1} in lightbox`}
          >
            <Image
              src={src}
              alt={`Sikhi Vidyala highlight ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <svg className="w-10 h-10 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6M7.5 10.5h6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(10,15,30,0.95)" }}
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 rounded-full transition hover:opacity-80"
            style={{ backgroundColor: GOLD, color: NAVY }}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 z-10 p-3 rounded-full transition hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative w-[90vw] max-w-5xl"
            style={{ aspectRatio: "16/10" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`Sikhi Vidyala highlight ${activeIndex + 1}`}
              fill
              className="object-contain rounded-xl"
              sizes="90vw"
              priority
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 z-10 p-3 rounded-full transition hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === activeIndex ? GOLD : "rgba(255,255,255,0.35)", transform: i === activeIndex ? "scale(1.4)" : "scale(1)" }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
