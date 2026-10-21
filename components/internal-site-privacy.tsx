'use client'

import { usePathname } from 'next/navigation'

/** Hide the public cookie widget on internal routes, including client navigation. */
export function InternalSitePrivacy() {
  const path = usePathname()
  const internal = /^\/(dashboard|spa-admin|auth)(\/|$)/.test(path)
  return internal ? <span hidden data-internal-app="true" /> : null
}
