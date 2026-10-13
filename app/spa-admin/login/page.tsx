'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signInToSpa } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SpaLoginPage() {
  const [state, action, pending] = useActionState(signInToSpa, { error: '' })
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6 text-[#0f2940]">
    <section className="w-full max-w-md rounded-2xl border border-[#dedfe3] bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c98616]">Sikh Padel Association</p>
      <h1 className="mt-3 text-3xl font-bold">SPA organiser login</h1>
      <p className="mt-3 text-sm text-[#6a6d77]">Manage tournaments, players, results and registrations in your dedicated SPA workspace.</p>
      <form action={action} className="mt-8 space-y-5">
        {state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <Button type="submit" disabled={pending} className="w-full rounded-full bg-[#0f2940] text-white hover:bg-[#183f5d]">{pending ? 'Signing in…' : 'Sign in to SPA'}</Button>
      </form>
      <p className="mt-6 text-xs text-[#6a6d77]">Use your existing organiser credentials. Access is granted by the SPA team.</p>
      <Link href="/spa/leaderboard" className="mt-5 inline-block text-sm font-medium underline underline-offset-4">View public rankings</Link>
    </section>
  </main>
}
