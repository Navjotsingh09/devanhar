'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createServiceClient(url, key)
}

export async function updateFamilyRetreatStatus(id: string, status: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('family_retreat_bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  if ((status === 'confirmed' || status === 'declined') && process.env.RESEND_API_KEY) {
    try {
      const { data: booking } = await supabase
        .from('family_retreat_bookings').select('first_name, email').eq('id', id).single()
      if (booking?.email) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        if (status === 'confirmed') {
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Your Sikh Family Retreat booking is confirmed',
            text: `Dear ${booking.first_name},\n\nWe are delighted to confirm your family's place at the Sikh Family Retreat.\n\nA sevadaar will be in touch shortly with further details including arrival information, accommodation guidance and the retreat timetable.\n\nIf you have any questions in the meantime, please do not hesitate to get in touch.\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nSikh Family Retreat Team\nDevanhaar`,
          })
        } else {
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Update on your Sikh Family Retreat booking request',
            text: `Dear ${booking.first_name},\n\nThank you for submitting a booking request for the Sikh Family Retreat.\n\nUnfortunately we are unable to accommodate your family at this time. If places become available, we will be in touch.\n\nIf you have any questions, please do not hesitate to contact us.\n\nWaheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh!\n\nSikh Family Retreat Team\nDevanhaar`,
          })
        }
      }
    } catch (emailErr) {
      console.warn('[family-retreat] Email send failed:', emailErr)
    }
  }

  revalidatePath('/dashboard/family-retreat')
}

export async function updateFamilyRetreatNotes(id: string, notes: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('family_retreat_bookings').update({ internal_notes: notes }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/family-retreat')
}
