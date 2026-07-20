import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const BUCKET = 'vacancy-cvs'

export async function GET(req: NextRequest) {
  // Auth check via SSR client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  const admin = createServiceClient(url, key)
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 10)
  if (error || !data) return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
