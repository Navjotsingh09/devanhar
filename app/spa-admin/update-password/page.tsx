'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SpaUpdatePasswordPage() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (new URLSearchParams(window.location.search).has('error')) { setError('This reset link is invalid or expired. Request another link.'); return }
    const values = new FormData(event.currentTarget)
    const password = String(values.get('password') || '')
    if (password.length < 12) { setError('Choose a password with at least 12 characters.'); return }
    if (password !== values.get('confirm')) { setError('Passwords do not match.'); return }
    setPending(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('This reset link is invalid or expired. Request another link.')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      setDone(true)
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to update password.') }
    finally { setPending(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6 text-[#0f2940]"><section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-bold">{done ? 'Password updated' : 'Set your SPA password'}</h1>
    {done ? <p role="status" className="mt-4 text-sm">Sign in again with your new password.</p> : <form onSubmit={submit} className="mt-6 space-y-4">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      <Label htmlFor="confirm">Confirm password</Label><Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      <Button disabled={pending} className="w-full bg-[#0f2940] text-white">{pending ? 'Saving…' : 'Save password'}</Button>
    </form>}
    <Link href={done ? '/spa-admin/login' : '/spa-admin/forgot-password'} className="mt-5 inline-block text-sm underline">{done ? 'Sign in to SPA' : 'Request another reset link'}</Link>
  </section></main>
}
