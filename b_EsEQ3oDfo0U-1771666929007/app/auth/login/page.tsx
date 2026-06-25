'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-primary p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-3 text-primary-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <Shield className="h-7 w-7 text-accent-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Devanhaar</h1>
              <p className="mt-1 text-sm opacity-80">Inspire. Empower. Transform.</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="w-full border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-card-foreground">Staff Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-card-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@devanhaar.org"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-card-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-primary-foreground/60">
            Access restricted to authorised Devanhaar staff only.
          </p>
        </div>
      </div>
    </div>
  )
}
