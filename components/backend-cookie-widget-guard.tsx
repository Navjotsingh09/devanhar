"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * The public cookie-consent manager is loaded site-wide via GTM.
 * Keep consent handling on public pages, but suppress its floating
 * launcher and dialog in authenticated back-office workspaces.
 */
const BACKEND_PREFIXES = [
  "/dashboard",
  "/spa-admin",
  "/auth",
  "/admin",
  "/cms",
  "/manage",
]

function isBackendPath(path: string) {
  return BACKEND_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + "/"))
}

export function BackendCookieWidgetGuard() {
  const pathname = usePathname()

  useEffect(() => {
    if (isBackendPath(pathname || "")) {
      document.documentElement.setAttribute("data-devanhaar-backend", "true")
    } else {
      document.documentElement.removeAttribute("data-devanhaar-backend")
    }
    return () => document.documentElement.removeAttribute("data-devanhaar-backend")
  }, [pathname])

  return null
}
