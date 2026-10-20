import 'server-only'
import { programmes, type CrmProgramme } from './programme-records'
import { validRecordId } from './submission-detail'
import { getPadelEntries } from '@/lib/padel-entries'

/** Caller must use the existing server access gate before this selected-record read. */
export async function programmeRecord(client: any, programme: CrmProgramme, kind: string, id: string) {
  if (!['records', 'recovered'].includes(kind) || !validRecordId(id)) return null
  const config = programmes[programme]
  if (kind === 'records' && programme === 'padel') {
    const entries = await getPadelEntries(client, id)
    return entries[0] ? { type: 'padel' as const, entry: entries[0] } : null
  }
  let query = client.from(kind === 'records' ? config.live : 'recovery_payment_ledger')
    .select(kind === 'records' ? '*' : 'id,source,occurred_at,amount,currency,payment_status,customer_name,customer_email,customer_phone,payment_reference,description,linked_record_type,linked_record_id')
    .eq('id', id)
  // Never let a programme-specific record URL expose another programme's evidence.
  if (kind === 'recovered') query = query.ilike('description', `%${config.evidence}%`)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error('Unable to load record')
  if (!data) return null
  return kind === 'records' ? { type: 'roots' as const, booking: data } : { type: 'recovered' as const, row: data }
}
