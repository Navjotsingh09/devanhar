export const PAGE_SIZE = 25
export const sources = {
  form_submissions: { label: 'Contact & enquiries', names: ['full_name'], email: 'email', date: 'created_at', status: 'status', editable: true },
  camp_applications: { label: 'Camp applications', names: ['first_name', 'last_name'], email: 'email', date: 'created_at', status: 'status', editable: true },
  vidyala_applications: { label: 'Vidyala applications', names: ['first_name', 'last_name'], email: 'email', date: 'created_at', status: 'status', editable: true },
  padel_registrations: { label: 'Padel registrations', names: ['captain_first_name', 'captain_last_name'], email: 'captain_email', date: 'created_at', status: 'status', editable: true },
  spn_submissions: { label: 'SPN submissions', names: ['first_name', 'last_name'], email: 'email', date: 'created_at', status: 'status', editable: true },
  register_interest: { label: 'Interest & webinar signups', names: ['name'], email: 'email', date: 'created_at', status: 'status', editable: false },
  roots_bookings: { label: 'Roots bookings', names: ['camper_first_name', 'camper_last_name'], email: 'parent_email', date: 'created_at', status: 'status', editable: false },
  wolfrun_fundraisers: { label: 'Wolf Run fundraisers', names: ['first_name', 'last_name'], email: 'email', date: 'created_at', status: 'status', editable: false },
  family_initiative_bookings: { label: 'Family bookings', names: ['contact_name'], email: 'email', date: 'created_at', status: 'status', editable: false },
  recovery_payment_ledger: { label: 'Recovered payments', names: ['customer_name'], email: 'customer_email', date: 'occurred_at', status: 'payment_status', editable: false },
} as const
export type SubmissionSource = keyof typeof sources
export type ListRow = { id: string; name: string; email: string; status: string; date: string }
export function isSource(value: string): value is SubmissionSource {
  return Object.hasOwn(sources, value)
}
export type QueryParams = Record<string, string | string[] | undefined>
const one = (value: string | string[] | undefined) => typeof value === 'string' ? value : ''
export function listParams(params: QueryParams, fixedSource?: SubmissionSource) {
  const rawSource = one(params.source)
  const source = fixedSource || (isSource(rawSource) ? rawSource : 'form_submissions')
  const rawPage = one(params.page)
  const number = /^\d{1,6}$/.test(rawPage) ? Number(rawPage) : 1
  const page = Math.min(10000, Math.max(1, number))
  // PostgREST filter grammar is not allowed in search text. Wildcards stay literal.
  const q = one(params.q).slice(0, 100).replace(/[^\p{L}\p{N}@.+_ '\-]/gu, '').replace(/[%_]/g, '').trim()
  const status = one(params.status).slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '')
  const direction = one(params.order) === 'oldest' ? 'oldest' : 'newest'
  return { source, page, q, status, direction }
}
export type ListParams = ReturnType<typeof listParams>
export function listHref(params: ListParams, changes: Partial<ListParams> = {}, pathname = '/dashboard/submissions') {
  const p = { ...params, ...changes }
  const query = new URLSearchParams({ source: p.source, page: String(p.page) })
  if (p.q) query.set('q', p.q)
  if (p.status) query.set('status', p.status)
  if (p.direction === 'oldest') query.set('order', 'oldest')
  return pathname + '?' + query.toString()
}
/** Only one allowlisted dataset and one bounded database range per list request. */
export async function loadSubmissionList(client: any, params: ListParams) {
  const config = sources[params.source]
  const columns = ['id', ...config.names, config.email, config.status, config.date].join(',')
  let query = client.from(params.source).select(columns, { count: 'exact' })
  if (params.q) query = query.or([...config.names, config.email].map(column => `${column}.ilike.%${params.q}%`).join(','))
  if (params.status) query = query.eq(config.status, params.status)
  const ascending = params.direction === 'oldest'
  const start = (params.page - 1) * PAGE_SIZE
  const result = await query.order(config.date, { ascending, nullsFirst: false }).order('id', { ascending }).range(start, start + PAGE_SIZE - 1)
  if (result.error) throw new Error('Unable to load this dataset. Please try again or contact your administrator.')
  const rows: ListRow[] = (result.data || []).map((row: Record<string, unknown>) => ({
    id: String(row.id), name: config.names.map(key => String(row[key] || '')).filter(Boolean).join(' ') || 'Unknown',
    email: String(row[config.email] || ''), status: String(row[config.status] || ''), date: String(row[config.date] || ''),
  }))
  return { rows, count: result.count ?? 0 }
}
