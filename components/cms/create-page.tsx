'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
export function CreatePage() {
  const [slug, setSlug] = useState('')
  const router = useRouter()
  return <form id="new-page" className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5" onSubmit={e => { e.preventDefault(); if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) router.push(`/dashboard/website/pages/page-${slug}`) }}><label className="space-y-2 text-sm font-medium"><span className="block">Create a page · /pages/your-page</span><Input required maxLength={95} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="your-page" value={slug} onChange={e => setSlug(e.target.value)} /></label><Button type="submit">Open new page editor</Button><p className="w-full text-xs text-muted-foreground">Use lowercase letters, numbers and hyphens. Pages become public only after publishing. An existing address opens its current editor.</p></form>
}
