"use client"

import { useEffect } from "react"

export function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.12 },
    )

    const raf = requestAnimationFrame(() => {
      document
        .querySelectorAll("[data-animate], [data-animate-stagger]")
        .forEach((el) => observer.observe(el))
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return null
}
