import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { submissionId, emergencyId, subject, bodyText, sendEmail, isInternalNote } = body

  if (!bodyText) {
    return NextResponse.json({ error: 'Reply body is required' }, { status: 400 })
  }

  // Get recipient email
  let recipientEmail: string | null = null
  if (sendEmail && !isInternalNote) {
    if (submissionId) {
      const { data: submission } = await supabase
        .from('form_submissions')
        .select('email')
        .eq('id', submissionId)
        .single()
      recipientEmail = submission?.email || null
    } else if (emergencyId) {
      const { data: emergency } = await supabase
        .from('emergency_requests')
        .select('caller_email')
        .eq('id', emergencyId)
        .single()
      recipientEmail = emergency?.caller_email || null
    }
  }

  // Attempt to send email via Resend if configured
  let emailSent = false
  if (sendEmail && recipientEmail && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Devanhaar <noreply@devanhaar.org>',
        to: recipientEmail,
        subject: subject || 'Response from Devanhaar',
        text: bodyText,
      })
      emailSent = true
    } catch (err) {
      console.error('Failed to send email:', err)
      // Continue without email - we'll still save the reply
    }
  }

  // Save reply to database
  const { data: reply, error } = await supabase
    .from('replies')
    .insert({
      submission_id: submissionId || null,
      emergency_id: emergencyId || null,
      admin_id: user.id,
      subject: subject || null,
      body: bodyText,
      sent_to_email: recipientEmail,
      email_sent: emailSent,
      is_internal_note: isInternalNote || false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update submission/emergency status to 'replied' if it was a reply (not internal note)
  if (!isInternalNote) {
    if (submissionId) {
      await supabase
        .from('form_submissions')
        .update({ status: 'replied', updated_at: new Date().toISOString() })
        .eq('id', submissionId)
    }
    if (emergencyId) {
      await supabase
        .from('emergency_requests')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', emergencyId)
    }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: isInternalNote ? 'Added internal note' : `Sent reply${emailSent ? ' (email sent)' : ''}`,
    entity_type: submissionId ? 'form_submission' : 'emergency_request',
    entity_id: submissionId || emergencyId,
    metadata: { email_sent: emailSent, recipient: recipientEmail },
  })

  return NextResponse.json({ success: true, reply, emailSent })
}
