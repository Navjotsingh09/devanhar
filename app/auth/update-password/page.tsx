"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push("/dashboard"), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1120] px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Image src="/logos/main-white-transparent.png" alt="Devanhaar" width={64} height={64} className="rounded-2xl mb-4" />
          <h2 className="text-2xl font-semibold text-white">Devanhaar</h2>
          <p className="text-white/50 text-sm mt-1">Inspire. Empower. Transform.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400/10 mx-auto mb-6">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Password updated</h2>
              <p className="text-white/50 text-sm">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white text-center mb-2">Set new password</h2>
              <p className="text-white/50 text-center text-sm mb-8">Choose a strong password for your account</p>
              <form onSubmit={handleUpdate} className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70 text-sm">New password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:ring-amber-400/20 h-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-white/70 text-sm">Confirm password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-400/50 focus:ring-amber-400/20 h-12" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-xl transition-all duration-200">
                  {isLoading ? "Updating…" : "Set password & sign in"}
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-white/30 text-xs mt-8">Access restricted to authorised Devanhaar staff only.</p>
      </div>
    </div>
  )
}
