import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (url === '' || key === '') {
    throw new Error('Missing Supabase service role credentials')
  }

  return createServiceClient(url, key)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', status: 401, supabase: null }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403, supabase: null }
  }

  return { error: null, status: 200, supabase }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, status, supabase } = await requireAdmin()
    if (error || !supabase) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing runner id' }, { status: 400 })
    }

    if (!isUuid(id)) {
      return NextResponse.json(
        { error: 'This row is from Stripe fallback data and cannot be deleted until it exists in Supabase.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getServiceRoleClient()

    const { error: deleteError } = await supabaseAdmin
      .from('wolfrun_runners')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[WolfRun Runners] Delete error:', deleteError)
      return NextResponse.json({ error: `Failed to delete runner: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[WolfRun Runners] DELETE error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
