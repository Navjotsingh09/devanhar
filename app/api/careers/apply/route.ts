import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendApplicationConfirmation, sendStaffApplicationNotification } from '@/lib/careers-email'

const ALLOWED_CV_EXT = ['pdf', 'doc', 'docx']
const MAX_CV_BYTES = 5 * 1024 * 1024
const BUCKET = 'vacancy-cvs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createServiceClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const vacancyId = String(fd.get('vacancy_id') || '').trim()
    const fullName = String(fd.get('full_name') || '').trim()
    const email = String(fd.get('email') || '').trim().toLowerCase()
    const phone = String(fd.get('phone') || '').trim() || null
    const linkedin = String(fd.get('linkedin_url') || '').trim() || null
    const coverLetter = String(fd.get('cover_letter') || '').trim()
    const consent = fd.get('consent')
    const cvFile = fd.get('cv') as File | null

    if (!vacancyId || !fullName || !email || !coverLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Verify vacancy is real and active
    const { data: vacancy, error: vErr } = await supabase
      .from('vacancies')
      .select('id, title, is_active')
      .eq('id', vacancyId)
      .maybeSingle()
    if (vErr || !vacancy || !vacancy.is_active) {
      return NextResponse.json({ error: 'Vacancy not available' }, { status: 404 })
    }

    // Optional CV upload
    let cvUrl: string | null = null
    if (cvFile && cvFile.size > 0) {
      const ext = cvFile.name.split('.').pop()?.toLowerCase() || ''
      if (!ALLOWED_CV_EXT.includes(ext)) {
        return NextResponse.json({ error: 'CV must be PDF or DOCX' }, { status: 400 })
      }
      if (cvFile.size > MAX_CV_BYTES) {
        return NextResponse.json({ error: 'CV must be under 5MB' }, { status: 400 })
      }
      const safe = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${vacancyId}/${Date.now()}-${safe}`
      const buf = await cvFile.arrayBuffer()
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, new Uint8Array(buf), {
          contentType: cvFile.type || 'application/octet-stream',
          upsert: false,
        })
      if (upErr) {
        console.error('[Careers Apply] CV upload failed:', upErr)
        return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 })
      }
      cvUrl = path
    }

    const { data: app, error: insErr } = await supabase
      .from('vacancy_applications')
      .insert({
        vacancy_id: vacancyId,
        full_name: fullName,
        email,
        phone,
        linkedin_url: linkedin,
        cover_letter: coverLetter,
        cv_url: cvUrl,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insErr || !app) {
      console.error('[Careers Apply] Insert failed:', insErr)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Fire emails in parallel; don't block on failure
    await Promise.allSettled([
      sendApplicationConfirmation({ to: email, applicantName: fullName, vacancyTitle: vacancy.title }),
      sendStaffApplicationNotification({
        applicantName: fullName,
        applicantEmail: email,
        vacancyTitle: vacancy.title,
        vacancyId,
        applicationId: app.id,
        hasCv: !!cvUrl,
      }),
    ])

    return NextResponse.json({ success: true, id: app.id }, { status: 201 })
  } catch (e) {
    console.error('[Careers Apply] Error:', e)
    return NextResponse.json({ error: 'Application failed' }, { status: 500 })
  }
}
