import { listParams, listHref, type QueryParams, type SubmissionSource } from './submissions'

export const programmes = {
  padel: { title: 'SPA registrations', live: 'padel_registrations', evidence: 'Padel', path: '/dashboard/padel' },
  roots: { title: 'Roots Bookings', live: 'roots_bookings', evidence: 'Roots Residential', path: '/dashboard/roots' },
} as const
export type CrmProgramme = keyof typeof programmes
export function isCrmProgramme(value: string): value is CrmProgramme {
  return Object.hasOwn(programmes, value)
}
export function programmeList(programme: CrmProgramme, input: QueryParams) {
  const config = programmes[programme]
  const recovered = input.source === 'recovery_payment_ledger'
  const params = listParams(input, recovered ? 'recovery_payment_ledger' : config.live)
  const scope = recovered ? { descriptionContains: config.evidence } : {}
  const datasetOptions: Array<{ source: SubmissionSource; label: string }> = [
    { source: config.live, label: 'Live records' }, { source: 'recovery_payment_ledger', label: 'Recovered evidence' },
  ]
  const exportHref = listHref(params, {}, '/api/crm/submissions/export') + '&programme=' + programme
  const recordHref = (row: { id: string }) => `${config.path}/${recovered ? 'recovered' : 'records'}/${encodeURIComponent(row.id)}`
  return { params, scope, datasetOptions, exportHref, recordHref, config }
}
