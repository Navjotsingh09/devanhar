"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function pushConsent(state: "granted" | "denied") {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(["consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  }])
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cookie_consent")
    if (!saved) {
      setVisible(true)
    } else {
      pushConsent(saved as "granted" | "denied")
    }
  }, [])

  function accept() {
    localStorage.setItem("cookie_consent", "granted")
    pushConsent("granted")
    setVisible(false)
  }

  function decline() {
    localStorage.setItem("cookie_consent", "denied")
    pushConsent("denied")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[360px] w-[calc(100vw-2rem)]">
      <div
        className="rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ background: "#1a1d2e" }}
      >
        {/* Gold top accent bar */}
        <div className="h-1 w-full" style={{ background: "hsl(43 99% 50%)" }} />

        <div className="p-5">
          {/* Icon + heading */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(43 99% 50% / 0.15)" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.95 11.03A10 10 0 0 1 12 22 10 10 0 0 1 2 12c0-5.18 3.94-9.45 9-9.95A3 3 0 0 0 14 5a3 3 0 0 0 3 3 3 3 0 0 0 2.95-2.46 10.06 10.06 0 0 1 1.95 5.5z"
                  fill="hsl(43 99% 50%)"
                  opacity="0.9"
                />
                <path
                  d="M19 2.5A2.5 2.5 0 0 1 16.5 5 2.5 2.5 0 0 1 14 2.5 2.5 2.5 0 0 1 19 2.5z"
                  fill="#1a1d2e"
                  opacity="0.6"
                />
                <circle cx="9" cy="10" r="1.2" fill="#1a1d2e" opacity="0.5" />
                <circle cx="13" cy="14" r="1.2" fill="#1a1d2e" opacity="0.5" />
                <circle cx="8.5" cy="15" r="0.9" fill="#1a1d2e" opacity="0.5" />
                <circle cx="14" cy="9.5" r="0.9" fill="#1a1d2e" opacity="0.5" />
                <circle cx="11" cy="11.5" r="0.7" fill="#1a1d2e" opacity="0.4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                We use cookies
              </p>
              <p className="text-white/50 text-xs leading-tight mt-0.5">
                devanhaar.com
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/70 text-xs leading-relaxed mb-4">
            We use cookies to understand how you use our site and to improve your experience. Analytics help us grow our community and serve you better.
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={accept}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "hsl(43 99% 50%)",
                color: "#0f1117",
              }}
            >
              Accept All
            </button>
            <button
              onClick={decline}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              Decline
            </button>
          </div>

          {/* Privacy link */}
          <p className="text-center mt-3 text-white/30 text-[10px]">
            <a href="/privacy" className="hover:text-white/60 underline underline-offset-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
