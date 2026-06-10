"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

const GOLD = "hsl(43 99% 50%)"
const NAVY = "#1a1d2e"
const COOKIE_BADGE_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(43 99% 50%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
  )

function patchExternalCookieBadge() {
  const img = document.querySelector<HTMLImageElement>("#ccm-trigger-badge img")
  if (!img) return

  if (img.src !== COOKIE_BADGE_ICON) {
    img.src = COOKIE_BADGE_ICON
  }
  img.alt = "Cookie preferences"
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

/* Recognizable cookie icon */
function CookieIcon({ size = 22, color = NAVY }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  )
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [decided, setDecided] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cookie_consent")
    if (!saved) {
      setVisible(true)
    } else {
      setDecided(true)
      pushConsent(saved as "granted" | "denied")
    }

    // External cookie manager injects its own badge; force it to use our cookie icon.
    patchExternalCookieBadge()
    const observer = new MutationObserver(() => {
      patchExternalCookieBadge()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  function accept() {
    localStorage.setItem("cookie_consent", "granted")
    pushConsent("granted")
    setVisible(false)
    setDecided(true)
  }

  function decline() {
    localStorage.setItem("cookie_consent", "denied")
    pushConsent("denied")
    setVisible(false)
    setDecided(true)
  }

  /* Floating cookie button to reopen preferences after a choice was made */
  if (decided && !visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        aria-label="Cookie preferences"
        title="Cookie preferences"
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-transform hover:scale-105 active:scale-95"
        style={{ background: GOLD }}
      >
        <CookieIcon size={24} color={NAVY} />
      </button>
    )
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[360px] w-[calc(100vw-2rem)]">
      <div
        className="rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Gold top accent bar */}
        <div className="h-1 w-full" style={{ background: GOLD }} />

        <div className="p-5">
          {/* Icon + heading */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(43 99% 50% / 0.15)" }}
            >
              <CookieIcon size={22} color={GOLD} />
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
              style={{ background: GOLD, color: "#0f1117" }}
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
