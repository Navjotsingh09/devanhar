import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ALLOWED_FIELDS = ['cv', 'cover_letter', 'portfolio'] as const
const ALLOWED_EXT = ['pdf', 'doc', 'docx']
const MAX_BYTES = 5 * 1024 * 1024
const BUCKET = 'vacancy-cvs'

type Field = (typeof ALLOWED_FIELDS)[number]

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createServiceClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const vacancyId = String(body.vacancy_id || '').trim()
    const field = String(body.field || '').trim() as Field
    const filename = String(body.filename || '').trim()
    const size = Number(body.size || 0)

    if (!vacancyId || !filename || !ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const ext = filename.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: 'File must be PDF, DOC or DOCX' },
        { status: 400 },
      )
    }
    if (!size || size <= 0 || size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File must be under 5MB' },
        { status: 400 },
      )
    }

    const admin = getAdmin()

    const { data: vacancy, error: vErr } = await admin
      .from('vacancies')
      .select('id, is_active')
      .eq('id', vacancyId)
      .maybeSingle()
    if (vErr || !vacancy || !vacancy.is_active) {
      return NextResponse.json({ error: 'Vacancy not available' }, { status: 404 })
    }

    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${vacancyId}/${field}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`

    const { data, error } = await admin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[Careers UploadURL] sign failed:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      bucket: BUCKET,
    })
  } catch (e) {
    console.error('[Careers UploadURL] Error:', e)
    return NextResponse.json({ error: 'Upload URL request failed' }, { status: 500 })
  }
}
