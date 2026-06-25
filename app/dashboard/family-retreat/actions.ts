'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createServiceClient(url, key)
}

const TEAM_SIGNATURE = [
  'Best wishes,',
  '',
  'Daljit Kaur',
  'Specialist Lead',
  'Mob: 07780 334 940',
  'Email: Daljit.Kaur@devanhaar.com',
  'LinkedIn: daljitkaurstem',
  '',
  'Follow The Sikh Family Initiative on Instagram:',
  'https://www.instagram.com/thesikhfamilyinitiative',
].join('\n')

function formatAccommodation(value: string | null | undefined): string {
  if (!value) return 'To be confirmed'
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function updateFamilyRetreatStatus(
  id: string,
  status: string,
  details?: { adults?: string; amount?: string }
) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('family_retreat_bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  if ((status === 'confirmed' || status === 'declined') && process.env.RESEND_API_KEY) {
    try {
      const { data: booking } = await supabase
        .from('family_retreat_bookings')
        .select('first_name, last_name, email, children_attending, accommodation_preference')
        .eq('id', id).single()
      if (booking?.email) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        if (status === 'confirmed') {
          const familyName = `${booking.first_name} ${booking.last_name}`.trim()
          const childrenCount = Array.isArray(booking.children_attending) ? booking.children_attending.length : 0
          const accommodation = formatAccommodation(booking.accommodation_preference as string | null)
          const adults = details?.adults?.trim() || 'To be confirmed'
          const amount = (details?.amount || '').toString().trim().replace(/^\u00a3/, '') || 'To be confirmed'
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Your Sikh Family Retreat booking is confirmed',
            text: [
              `Dear ${booking.first_name},`,
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              'Thank you for your time and for taking our call today. We are pleased to confirm that your family booking has been accepted, subject to the agreed payment being made and received.',
              '',
              'Booking details:',
              '',
              `Family name: ${familyName}`,
              `Number of adults: ${adults}`,
              `Number of children/young people: ${childrenCount}`,
              `Accommodation type: ${accommodation}`,
              `Total amount agreed: \u00a3${amount}`,
              '',
              'Please note that your place is only fully secured once payment has been received. If payment has already been made, please accept this email as confirmation of your family\'s place at the retreat.',
              '',
              'Further information, including arrival times, what to bring, accommodation guidance and the retreat programme, will be shared closer to the event.',
              '',
              'We are really looking forward to welcoming your family to the Sikh Family Retreat.',
              '',
              'Warm regards,',
              'The Sikh Family Initiative Team',
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              TEAM_SIGNATURE,
            ].join('\n'),
          })
        } else {
          await resend.emails.send({
            from: 'Sikh Family Retreat <noreply@devanhaar.com>',
            to: booking.email,
            subject: 'Update on your Sikh Family Retreat booking request',
            text: [
              `Dear ${booking.first_name},`,
              '',
              'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh Ji.',
              '',
              'Thank you for your interest in The Sikh Family Initiative: Sikh Family Retreat, and for taking the time to complete the booking form for your family.',
              '',
              'Unfortunately, we are sorry to let you know that we have not been able to secure a place for your family at this retreat. Due to limited accommodation and high interest, we have had to carefully allocate the available spaces, and we are very sorry that we could not accommodate everyone this time.',
              '',
              'We are truly grateful for your interest and would very much like your family to stay connected with The Sikh Family Initiative. We are keen to welcome you to future retreats, family events and programmes as the initiative continues to grow.',
              '',
              'Please do follow The Sikh Family Initiative for updates, future event announcements and further opportunities for families to connect, learn and spend time in sangat:',
              'https://www.instagram.com/thesikhfamilyinitiative',
              '',
              'Thank you again for your understanding and support.',
              '',
              'Warm regards,',
              'The Sikh Family Initiative Team',
              '',
              TEAM_SIGNATURE,
            ].join('\n'),
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
