'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SpaForgotPasswordPage() {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') || '').trim()
    setPending(true); setError(''); setMessage('')
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/spa-admin/recovery`,
      })
      if (error) throw error
      setMessage('If this email has an account, a password-reset link has been requested. Check your inbox and spam folder.')
    } catch { setError('Unable to request a reset right now. Please try again later.') }
    finally { setPending(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6 text-[#0f2940]"><section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-bold">Reset your SPA password</h1>
    <p className="mt-3 text-sm text-[#6a6d77]">Use the email linked to your organiser account. Resetting a password does not grant organiser access.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      <Label htmlFor="email">Account email</Label><Input id="email" name="email" type="email" autoComplete="email" required />
      <Button disabled={pending} className="w-full bg-[#0f2940] text-white">{pending ? 'Requesting…' : 'Request reset link'}</Button>
    </form><Link href="/spa-admin/login" className="mt-5 inline-block text-sm underline">Back to organiser login</Link>
  </section></main>
}
