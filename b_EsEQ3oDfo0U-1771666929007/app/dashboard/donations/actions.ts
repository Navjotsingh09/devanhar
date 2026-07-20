'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordDonation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const donorName = formData.get('donor_name') as string
  const donorEmail = formData.get('donor_email') as string
  const amount = parseFloat(formData.get('amount') as string)
  const initiativeId = formData.get('initiative_id') as string
  const isRecurring = formData.get('is_recurring') === 'true'
  const paymentReference = formData.get('payment_reference') as string
  const notes = formData.get('notes') as string

  if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount')

  const { error } = await supabase.from('donations').insert({
    donor_name: donorName || null,
    donor_email: donorEmail || null,
    amount,
    initiative_id: initiativeId || null,
    is_recurring: isRecurring,
    payment_reference: paymentReference || null,
    notes: notes || null,
    recorded_by: user.id,
  })

  if (error) throw new Error(error.message)

  await supabase.from('activity_log').insert({
    admin_id: user.id,
    action: `Recorded donation of £${amount.toFixed(2)}`,
    entity_type: 'donation',
  })

  revalidatePath('/dashboard/donations')
}
