import { SubmissionsList } from './submissions-list'
import { loadSubmissionList, type QueryParams } from '@/lib/crm/submissions'
import { programmeList, type CrmProgramme } from '@/lib/crm/programme-records'

/** The caller must authenticate/authorise using the existing programme gate first. */
export async function ProgrammeRecordsList({ client, programme, input }: { client: any; programme: CrmProgramme; input: QueryParams }) {
  const { params, scope, datasetOptions, exportHref, recordHref, config } = programmeList(programme, input)
  let result
  try { result = await loadSubmissionList(client, params, scope) }
  catch { return <SubmissionsList params={params} rows={[]} count={0} error="Unable to load this dataset. Please try again or contact your administrator." headingLevel={programme === 'padel' ? 2 : 1} basePath={config.path} title={config.title} datasetOptions={datasetOptions} /> }
  return <div className="space-y-3"><SubmissionsList params={params} {...result} headingLevel={programme === 'padel' ? 2 : 1} basePath={config.path} title={config.title} datasetOptions={datasetOptions} exportHref={exportHref} recordHref={recordHref} /><p className="text-sm text-muted-foreground">Recovered evidence is historical and may refer to a live record. It is listed separately; no records are merged or deleted.</p></div>
}
