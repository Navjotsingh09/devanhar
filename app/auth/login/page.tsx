"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()

  const normalizeEmail = (value: string) => value.trim().toLowerCase()

  const handleReset = async () => {
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) { setError("Please enter your email address first."); return }
    setResetLoading(true); setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setResetLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail.endsWith("@devanhaar.com")) {
      setError("Access is restricted to Devanhaar staff. Please use your @devanhaar.com email address.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0d1120] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logos/main-white-transparent.png"
            alt="Devanhaar"
            width={320}
            height={320}
            className="object-contain opacity-10"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <Image src="/logos/main-white-transparent.png" alt="Devanhaar" width={48} height={48} className="rounded-xl" />
              <span className="text-2xl font-semibold text-white">Devanhaar</span>
            </div>
            <h1 className="text-5xl font-light text-white mb-6 leading-tight">
              Inspire.<br />
              Empower.<br />
              <span className="text-amber-400">Transform.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              Access the Devanhaar dashboard to manage programmes, track impact, and empower communities across the UK.
            </p>
          </div>
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <span>Birmingham, UK</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>Since 2015</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#0d1120] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-10">
            <Image src="/logos/main-white-transparent.png" alt="Devanhaar" width={64} height={64} className="rounded-2xl mb-4" />
            <h2 className="text-2xl font-semibold text-white">Devanhaar</h2>
            <p className="text-white/50 text-sm mt-1">Inspire. Empower. Transform.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400/10 mx-auto mb-6">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white text-center mb-2">Staff Login</h2>
            <p className="text-white/50 text-center text-sm mb-8">Enter your credentials to access the dashboard</p>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
                <Input id="email" type="email" placeholder="you@devanhaar.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:ring-amber-400/20 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:ring-amber-400/20 h-12 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end -mt-2">
                <button type="button" onClick={handleReset} disabled={resetLoading} className="text-amber-400/70 hover:text-amber-400 text-xs transition-colors disabled:opacity-50">
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              {resetSent && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg text-center">Password reset email sent - check your inbox.</div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-xl transition-all duration-200">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
          <p className="text-center text-white/30 text-xs mt-8">Access restricted to authorised Devanhaar staff only.</p>
        </div>
      </div>
    </div>
  )
}
