import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, Inbox } from 'lucide-react'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { paymentLabel, responseStates, type ResponseState } from '@/lib/roots-forms/response-actions'
import { applicationAge, applicationPaymentLabel, decisionFilters, decisionLabels, type DecisionFilter } from '@/lib/roots-forms/application-tracker'
import { ResponseActions } from '@/components/roots-forms/response-actions'
export const dynamic = 'force-dynamic'
export default async function Responses({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{page?: string; view?: string; decision?: string}>}) {
  const client = await requireRootsStaff(), {id} = await params, q = await searchParams
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound()
  const {data: form, error: formError} = await client.from('roots_forms').select('id,title,slug').eq('id', id).maybeSingle()
  if (formError) return <p role="alert">Responses could not be loaded.</p>
  if (!form) notFound()
  const roots = form.slug === 'roots-residential-camp-registration'
  const view: ResponseState = responseStates.includes(q.view as ResponseState) ? q.view as ResponseState : 'active'
  const decision: DecisionFilter = roots && decisionFilters.includes(q.decision as DecisionFilter) ? q.decision as DecisionFilter : 'all'
  const number = Number(q.page), page = Number.isSafeInteger(number) && number > 0 && number < 100000 ? number : 1, offset = (page - 1) * 25
  const query = (head = false) => {
    let result = client.from('roots_form_submissions').select('id,respondent_name,respondent_email,payment_state,payment_environment,created_at,record_state,decision_status', {count: 'exact', head}).eq('form_id', id).eq('record_state', view)
    if (decision !== 'all') result = result.eq('decision_status', decision)
    return result
  }
  const [result, counts] = await Promise.all([
    query().order('created_at', {ascending: false}).order('id', {ascending: false}).range(offset, offset + 24),
    roots ? Promise.all(decisionFilters.map(filter => {
      let count = client.from('roots_form_submissions').select('id', {head: true, count: 'exact'}).eq('form_id', id).eq('record_state', view)
      if (filter !== 'all') count = count.eq('decision_status', filter)
      return count
    })) : Promise.resolve([]),
  ])
  const {data, error} = result
  let total = result.count
  if (error?.code === 'PGRST103') {
    const count = await query(true)
    if (!count.error) total = count.count
  }
  const rangeMiss = error?.code === 'PGRST103' && total !== null && offset >= total
  const base = `/dashboard/roots/forms/${id}/responses`
  const href = (state: ResponseState, filter: DecisionFilter, n = 1) => `${base}?view=${state}&decision=${filter}&page=${n}`
  const labels = {active: 'Active', archived: 'Archived', deleted: 'Deleted'}
  const now = new Date()
  return <div className="space-y-6">
    <Link prefetch={false} href="/dashboard/roots" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Roots Residential</Link>
    <header className="space-y-2"><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Roots · Registrations</p><h1 className="text-3xl font-semibold tracking-tight">Form responses</h1><p className="text-sm text-muted-foreground">{form.title}</p></header>
    <nav aria-label="Response status" className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border bg-muted/30 p-1">{responseStates.map(state => <Link prefetch={false} key={state} href={href(state, decision)} aria-current={view === state ? 'page' : undefined} className={'rounded-lg px-4 py-2 text-sm font-medium ' + (view === state ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/60')}>{labels[state]}</Link>)}</nav>
    {roots && <div className="space-y-2">
      <nav aria-label="Application decisions" className="grid grid-cols-2 gap-3 lg:grid-cols-4">{decisionFilters.map((filter, index) => <Link prefetch={false} key={filter} href={href(view, filter)} aria-current={decision === filter ? 'page' : undefined} className={'rounded-xl border p-4 ' + (decision === filter ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/30')}><span className="block text-sm font-medium">{decisionLabels[filter]}</span><span className="mt-2 block text-2xl font-semibold">{counts[index]?.error ? 'Unavailable' : counts[index]?.count ?? 'Unavailable'}</span></Link>)}</nav>
      <p className="text-xs text-muted-foreground">Counts are for {labels[view].toLowerCase()} applications. New means awaiting a team decision. Application age uses UK calendar days.</p>
      {counts.some(count => count.error) && <p role="alert" className="text-sm text-red-700">Decision counts could not be loaded. Refresh or contact an administrator.</p>}
    </div>}
    {error && !rangeMiss ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Responses could not be loaded. Please try again.</p> : <section className="overflow-hidden rounded-2xl border bg-card" aria-label={`${labels[view]} responses`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><p className="text-sm font-medium">{total ?? 0} {decision === 'all' ? view : decisionLabels[decision].toLowerCase()} {(total ?? 0) === 1 ? 'response' : 'responses'}</p><p className="text-xs text-muted-foreground">25 per page · Page {page}</p></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">{labels[view]} form responses with View and management actions</caption><thead className="bg-muted/30 text-xs text-muted-foreground"><tr>{['Child / respondent', 'Email', ...(roots ? ['Decision'] : []), 'Payment', 'Submitted', 'Actions'].map(label => <th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y">
        {data?.map(row => <tr key={row.id} className="hover:bg-muted/20">
          <td className="px-5 py-4 font-medium">{row.respondent_name}</td>
          <td className="px-5 py-4 text-muted-foreground">{row.respondent_email || '—'}</td>
          {roots && <td className="px-5 py-4"><span className={'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ' + (row.decision_status === 'accepted' ? 'bg-green-50 text-green-800' : row.decision_status === 'declined' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800')}>{decisionLabels[row.decision_status as Exclude<DecisionFilter, 'all'>] || row.decision_status}</span></td>}
          <td className="px-5 py-4"><span className="inline-flex whitespace-nowrap rounded-full border bg-muted/30 px-2.5 py-1 text-xs">{roots ? applicationPaymentLabel(row.payment_state, row.decision_status) : paymentLabel(row.payment_state)}</span>{row.payment_environment === 'test' && <span className="ml-2 text-xs text-amber-800">Test payment</span>}</td>
          <td className="whitespace-nowrap px-5 py-4 text-muted-foreground"><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString('en-GB', {timeZone: 'Europe/London', day: '2-digit', month: 'short', year: 'numeric'})}</time><p className="mt-1 text-xs">{applicationAge(row.created_at, now)}</p></td>
          <td className="px-5 py-4"><div className="flex items-center gap-2"><Link prefetch={false} href={`${base}/${row.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2"><Eye aria-hidden="true" className="h-4 w-4" />View<span className="sr-only"> response from {row.respondent_name}</span></Link><ResponseActions formId={id} responseId={row.id} name={row.respondent_name} state={row.record_state as ResponseState} /></div></td>
        </tr>)}
        {!data?.length && <tr><td colSpan={roots ? 6 : 5} className="px-5 py-12 text-center"><Inbox aria-hidden="true" className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><p className="font-medium">No matching responses on this page</p>{page > 1 && <Link className="mt-3 inline-block text-sm underline" href={href(view, decision)}>Return to first page</Link>}</td></tr>}
      </tbody></table></div>
      <nav aria-label="Response pages" className="flex items-center justify-between border-t px-5 py-4 text-sm"><span className="text-xs text-muted-foreground">{data?.length || 0} shown · {total ?? 0} total</span><div className="flex gap-4">{page > 1 && <Link prefetch={false} className="inline-flex items-center gap-2" href={href(view, decision, page - 1)}><ArrowLeft className="h-4 w-4" />Previous</Link>}{offset + 25 < (total ?? 0) && <Link prefetch={false} className="inline-flex items-center gap-2" href={href(view, decision, page + 1)}>Next<ArrowRight className="h-4 w-4" /></Link>}</div></nav>
    </section>}
  </div>
}
