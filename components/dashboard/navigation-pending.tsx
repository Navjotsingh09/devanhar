'use client'

import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

export function NavigationPending() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return <span role="status" className="ml-auto inline-flex items-center"><Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /><span className="sr-only">Loading page…</span></span>
}
