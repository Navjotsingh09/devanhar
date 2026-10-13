'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOutOfSpa } from '@/app/spa-admin/login/actions'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Trophy, ClipboardList, Users, ScanFace, ListOrdered, ClipboardCheck, Menu, X, LogOut } from 'lucide-react'

const nav = [
  { href: '/spa-admin', title: 'Overview', icon: LayoutDashboard },
  { href: '/spa-admin/tournaments', title: 'Tournaments', icon: Trophy },
  { href: '/spa-admin/results', title: 'Results', icon: ClipboardList },
  { href: '/spa-admin/identities', title: 'Player identities', icon: ScanFace },
  { href: '/spa-admin/rankings', title: 'Rankings & parity', icon: ListOrdered },
  { href: '/spa-admin/players', title: 'Players', icon: Users },
  { href: '/spa-admin/registrations', title: 'Registrations', icon: ClipboardCheck },
]

export function SpaPortalShell({ children, fullName }: { children: React.ReactNode; fullName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return <div className="min-h-screen bg-[#f7f7f8] text-[#0f2940]">
    <header className="flex items-center justify-between border-b bg-[#0f2940] p-4 text-white md:hidden">
      <Link href="/spa-admin" className="font-bold">SPA operations</Link>
      <Button variant="ghost" size="icon" className="text-white" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
    </header>
    <aside className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-40 w-[232px] flex-col bg-[#0f2940] px-4 py-[22px] text-white md:flex`}>
      <Link href="/spa-admin" onClick={() => setOpen(false)} className="mb-7 block"><span className="block text-[17px] font-bold">DEVANHAAR</span><span className="text-[10px] font-bold tracking-wider text-[#e6a429]">SPA OPERATIONS</span></Link>
      <nav aria-label="SPA management" className="space-y-1">{nav.map(item => {
        const active = item.href === '/spa-admin' ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-[10px] px-3 py-3 text-xs ${active ? 'bg-[#183f5d] font-semibold text-white' : 'text-[#cfd8de] hover:bg-[#183f5d]'}`}><Icon className={`h-4 w-4 ${active ? 'text-[#e6a429]' : 'text-[#9fb0bc]'}`} />{item.title}</Link>
      })}</nav>
      <div className="mt-auto pt-8"><Link href="/spa/leaderboard" target="_blank" rel="noopener noreferrer" className="block px-3 py-3 text-xs text-[#cfd8de] hover:text-white">Public leaderboard ↗</Link>
        <div className="rounded-xl bg-[#183f5d] p-3"><div className="flex items-center gap-3"><img src="/spa-admin-assets/avatar.svg" alt="" width={32} height={32} /><div className="min-w-0"><p className="truncate text-xs font-semibold">{fullName}</p><p className="text-[10px] text-[#bfcbd3]">SPA organiser</p></div></div>
          <form action={signOutOfSpa} className="mt-3"><button className="flex items-center gap-2 text-xs text-[#cfd8de] hover:text-white"><LogOut className="h-3.5 w-3.5" />Sign out</button></form></div>
      </div>
    </aside>
    {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
    <main className="p-4 md:ml-[232px] md:px-[30px] md:py-6">{children}</main>
  </div>
}
