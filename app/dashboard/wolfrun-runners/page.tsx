import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import RunnersAdminTable from '@/components/wolfrun/runners-admin-table'

type RunnerRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  city: string
  pack: string
  agree_whatsapp_group: boolean
  status: string
  created_at: string
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (url === '' || key === '') {
    throw new Error('Missing Supabase environment variables for Wolf Run runners dashboard')
  }

  return createServiceClient(url, key)
}

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
  if (stripeSecretKey === '') {
    return null
  }
  return new Stripe(stripeSecretKey)
}

function normalizePack(pack: string | undefined) {
  const value = String(pack || '').trim().toLowerCase()
  if (value === 'singhs' || value === 'kaurs') {
    return value
  }
  return 'unknown'
}

async function getRunnerStats() {
  const supabase = getSupabaseAdmin()

  const [runnersResult, singhsResult, kaursResult] = await Promise.all([
    supabase
      .from('wolfrun_runners')
      .select('id, first_name, last_name, email, phone, age, city, pack, agree_whatsapp_group, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'singhs')
      .eq('status', 'confirmed'),
    supabase
      .from('wolfrun_runners')
      .select('id', { count: 'exact', head: true })
      .eq('pack', 'kaurs')
      .eq('status', 'confirmed'),
  ])

  const error = runnersResult.error || singhsResult.error || kaursResult.error

  return {
    runners: runnersResult.data || [],
    totalCount: runnersResult.data?.length ?? 0,
    singhsCount: singhsResult.count ?? 0,
    kaursCount: kaursResult.count ?? 0,
    error: error?.message ?? null,
  }
}

async function getStripeFallbackRunners() {
  const stripe = getStripeClient()
  if (stripe === null) {
    return { runners: [] as RunnerRow[], error: 'Missing STRIPE_SECRET_KEY' }
  }

  const runners: RunnerRow[] = []
  let cursor: string | undefined
  let pageCount = 0

  while (pageCount < 50) {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      ...(cursor ? { starting_after: cursor } : {}),
    })

    for (const session of page.data) {
      if (session.metadata?.type !== 'wolfrun_entry') continue
      if (session.payment_status !== 'paid') continue

      const m = session.metadata || {}
      const pack = normalizePack(m.pack)
      const age = Number.parseInt(String(m.age || ''), 10)

      runners.push({
        id: session.id,
        first_name: String(m.first_name || '').trim() || 'Unknown',
        last_name: String(m.last_name || '').trim() || 'Runner',
        email: String(m.email || '').trim().toLowerCase(),
        phone: String(m.phone || '').trim(),
        age: Number.isFinite(age) ? age : 0,
        city: String(m.city || '').trim(),
        pack,
        agree_whatsapp_group: m.agree_whatsapp_group === 'true',
        status: 'confirmed',
        created_at: new Date(session.created * 1000).toISOString(),
      })
    }

    pageCount += 1

    if (page.has_more === false || page.data.length === 0) {
      break
    }

    cursor = page.data[page.data.length - 1].id
  }

  runners.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  return { runners, error: null }
}

export default async function WolfRunRunnersPage() {
  const primary = await getRunnerStats()
  let runners = primary.runners
  let totalCount = primary.totalCount
  let singhsCount = primary.singhsCount
  let kaursCount = primary.kaursCount
  let error = primary.error
  let usingStripeFallback = false
  let dataSourceLabel = 'Supabase'

  if (error === null && totalCount === 0) {
    const fallback = await getStripeFallbackRunners()
    if (fallback.error) {
      error = fallback.error
    } else {
      runners = fallback.runners
      totalCount = fallback.runners.length
      singhsCount = fallback.runners.filter((r) => r.pack === 'singhs').length
      kaursCount = fallback.runners.filter((r) => r.pack === 'kaurs').length
      usingStripeFallback = true
      dataSourceLabel = 'Stripe fallback'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wolf Run Runners</h1>
        <p className="text-muted-foreground">Confirmed entrants for the Wolf Run event</p>
        <p className="text-xs text-muted-foreground mt-1">Data source: {dataSourceLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Singhs Pack</CardTitle>
            <span className="text-lg">🟡</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{singhsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Singhs Pack</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kaurs Pack</CardTitle>
            <span className="text-lg">🟣</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{kaursCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Kaurs Pack</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Confirmed Runners</h2>
        {usingStripeFallback ? (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Showing historic entries directly from Stripe because Supabase has no runner rows yet.
          </div>
        ) : null}
        {usingStripeFallback && totalCount === 0 ? (
          <div className="mb-3 rounded-md border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
            Stripe fallback returned no paid Wolf Run sessions with metadata type "wolfrun_entry".
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error.includes("Could not find the table 'public.wolfrun_runners'")
              ? 'The wolfrun_runners table has not been created in Supabase yet. Run the SQL in supabase-wolfrun.sql, then refresh this page.'
              : `Failed to load runners: ${error}`}
          </div>
        ) : (
          <RunnersAdminTable runners={runners} />
        )}
      </div>
    </div>
  )
}
