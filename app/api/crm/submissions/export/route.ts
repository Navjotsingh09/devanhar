import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { listParams, loadSubmissionList, type QueryParams } from '@/lib/crm/submissions'

import { programmeList, isCrmProgramme } from '@/lib/crm/programme-records'

export const dynamic = 'force-dynamic'
function csv(value: string) {
  const safe = /^[\s]*[=+\-@]/.test(value) ? "'" + value : value
  return '"' + safe.replaceAll('"', '""') + '"'
}
export async function GET(request: Request) {
  let client
  try { client = await requireGeneralStaff() }
  catch { return Response.json({ error: 'Not authorised to export submissions' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } }) }
  const url = new URL(request.url)
  const input: QueryParams = Object.fromEntries(url.searchParams)
  try {
    const programme = url.searchParams.get('programme') || ''
    if (programme && !isCrmProgramme(programme)) return Response.json({ error: 'Invalid programme' }, { status: 400, headers: { 'Cache-Control': 'private, no-store' } })
    const scoped = isCrmProgramme(programme) ? programmeList(programme, input) : null
    const params = scoped?.params || listParams(input)
    const { rows } = await loadSubmissionList(client, params, scoped?.scope)
    const body = [['Name', 'Email', 'Status', 'Date'], ...rows.map(row => [row.name, row.email, row.status, row.date])].map(row => row.map(csv).join(',')).join('\r\n')
    return new Response(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="submissions-page.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
  } catch { return Response.json({ error: 'Unable to export this page' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }) }
}
