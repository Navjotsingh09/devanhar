import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, Inbox } from 'lucide-react'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
import { paymentLabel, responseStates, type ResponseState } from '@/lib/roots-forms/response-actions'
import { ResponseActions } from '@/components/roots-forms/response-actions'
export const dynamic='force-dynamic'
export default async function Responses({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{page?:string;view?:string}>}) {
  const client=await requireGeneralStaff(),{id}=await params,q=await searchParams
  if(!/^[a-f0-9-]{36}$/i.test(id))notFound()
  const {data:form,error:formError}=await client.from('roots_forms').select('id,title').eq('id',id).maybeSingle()
  if(formError)return <p role="alert">Responses could not be loaded.</p>
  if(!form)notFound()
  const view:ResponseState=responseStates.includes(q.view as ResponseState)?q.view as ResponseState:'active'
  const number=Number(q.page),page=Number.isSafeInteger(number)&&number>0&&number<100000?number:1,offset=(page-1)*25
  const query=()=>client.from('roots_form_submissions').select('id,respondent_name,respondent_email,payment_state,payment_environment,created_at,record_state',{count:'exact'}).eq('form_id',id).eq('record_state',view)
  const {data,count,error}=await query().order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+24)
  let total=count
  if(error?.code==='PGRST103'){const result=await client.from('roots_form_submissions').select('id',{head:true,count:'exact'}).eq('form_id',id).eq('record_state',view);if(!result.error)total=result.count}
  const rangeMiss=error?.code==='PGRST103'&&total!==null&&offset>=total
  const base=`/dashboard/roots/forms/${id}/responses`,pageHref=(n:number)=>`${base}?view=${view}&page=${n}`
  const labels={active:'Active',archived:'Archived',deleted:'Deleted'}
  return <div className="space-y-6">
    <Link prefetch={false} href="/dashboard/roots" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Roots Residential</Link>
    <header className="space-y-2"><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Roots · Registrations</p><h1 className="text-3xl font-semibold tracking-tight">Form responses</h1><p className="text-sm text-muted-foreground">{form.title}</p></header>
    <nav aria-label="Response status" className="flex w-fit gap-1 rounded-xl border bg-muted/30 p-1">{responseStates.map(state=><Link prefetch={false} key={state} href={`${base}?view=${state}`} aria-current={view===state?'page':undefined} className={'rounded-lg px-4 py-2 text-sm font-medium '+(view===state?'bg-background text-foreground shadow-sm':'text-muted-foreground hover:bg-background/60')}>{labels[state]}</Link>)}</nav>
    {error&&!rangeMiss?<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Responses could not be loaded. Please try again.</p>:<section className="overflow-hidden rounded-2xl border bg-card" aria-label={`${labels[view]} responses`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><p className="text-sm font-medium">{total??0} {view} {(total??0)===1?'response':'responses'}</p><p className="text-xs text-muted-foreground">25 per page · Page {page}</p></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">{labels[view]} form responses with View and management actions</caption><thead className="bg-muted/30 text-xs text-muted-foreground"><tr>{['Child / respondent','Email','Payment','Submitted','Actions'].map(label=><th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y">
        {data?.map(row=><tr key={row.id} className="hover:bg-muted/20"><td className="px-5 py-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">{row.respondent_name.split(/\s+/).filter(Boolean).slice(0,2).map((part:string)=>part[0]).join('').toUpperCase()}</span><span className="font-medium">{row.respondent_name}</span></div></td><td className="px-5 py-4 text-muted-foreground">{row.respondent_email||'—'}</td><td className="px-5 py-4"><span className="inline-flex whitespace-nowrap rounded-full border bg-muted/30 px-2.5 py-1 text-xs">{paymentLabel(row.payment_state)}</span>{row.payment_environment==='test'&&<span className="ml-2 text-xs text-amber-800">Test payment</span>}</td><td className="whitespace-nowrap px-5 py-4 text-muted-foreground"><time>{new Date(row.created_at).toLocaleDateString('en-GB',{timeZone:'Europe/London',day:'2-digit',month:'short',year:'numeric'})}</time></td><td className="px-5 py-4"><div className="flex items-center gap-2"><Link prefetch={false} href={`${base}/${row.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2"><Eye aria-hidden="true" className="h-4 w-4" />View<span className="sr-only"> response from {row.respondent_name}</span></Link><ResponseActions formId={id} responseId={row.id} name={row.respondent_name} state={row.record_state as ResponseState} /></div></td></tr>)}
        {!data?.length&&<tr><td colSpan={5} className="px-5 py-12 text-center"><Inbox aria-hidden="true" className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><p className="font-medium">No {view} responses on this page</p><p className="mt-2 text-xs text-muted-foreground">{view==='active'?'New registrations will appear here.':view==='archived'?'Archived responses will appear here.':'Deleted responses can be restored from here.'}</p>{page>1&&<Link className="mt-3 inline-block text-sm underline" href={pageHref(1)}>Return to first page</Link>}</td></tr>}
      </tbody></table></div>
      <nav aria-label="Response pages" className="flex items-center justify-between border-t px-5 py-4 text-sm"><span className="text-xs text-muted-foreground">{data?.length||0} shown · {total??0} total</span><div className="flex gap-4">{page>1&&<Link prefetch={false} className="inline-flex items-center gap-2" href={pageHref(page-1)}><ArrowLeft className="h-4 w-4" />Previous</Link>}{offset+25<(total??0)&&<Link prefetch={false} className="inline-flex items-center gap-2" href={pageHref(page+1)}>Next<ArrowRight className="h-4 w-4" /></Link>}</div></nav>
    </section>}
  </div>
}
