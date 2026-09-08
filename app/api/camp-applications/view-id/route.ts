import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const campBucketName = process.env.SUPABASE_CAMP_UPLOAD_BUCKET || 'camp-applications'
const vidyalaBucketName = process.env.SUPABASE_VIDYALA_UPLOAD_BUCKET || 'vidyala-applications'

export async function GET(request: NextRequest) {
  try {
    // Auth check — must be logged-in admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient(supabaseUrl!, supabaseServiceKey!)

    const { data: profile } = await admin
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // A missing admin_profiles row defaults to 'staff' (matches app/dashboard/layout.tsx),
    // since staff Auth accounts and their admin_profiles rows are recreated separately
    // after a recovery — only an EXISTING profile with a disallowed role is blocked.
    if (profile && !['admin', 'super_admin', 'staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const filePath = request.nextUrl.searchParams.get('path')
    const source = request.nextUrl.searchParams.get('source')
    if (!filePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
    }

    // Validate path doesn't escape the bucket
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Generate a signed URL valid for 1 hour
    const bucketName = source === 'vidyala' ? vidyalaBucketName : campBucketName
    const { data, error } = await admin.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600)

    if (error || !data?.signedUrl) {
      console.error('[View ID] Signed URL error:', error)
      return NextResponse.json({ error: 'Failed to generate document URL' }, { status: 500 })
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (err) {
    console.error('[View ID] Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
