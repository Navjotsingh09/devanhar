'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { title: 'Vidyala Applications', url: '/dashboard/vidyala' },
  { title: 'Webinar Signups', url: '/dashboard/vidyala/webinar' },
  { title: 'Interest Registrations', url: '/dashboard/vidyala/interest' },
]

export function VidyalaSubNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {TABS.map((tab) => (
        <Link
          key={tab.url}
          href={tab.url}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            pathname === tab.url
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          )}
        >
          {tab.title}
        </Link>
      ))}
    </div>
  )
}
