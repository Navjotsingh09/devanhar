import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireGeneralStaff } from '@/lib/staff-programme-server'
export const dynamic='force-dynamic'
export default async function Responses({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{page?:string}>}){
 const client=await requireGeneralStaff(),{id}=await params,q=await searchParams;if(!/^[a-f0-9-]{36}$/i.test(id))notFound()
 const {data:form,error:formError}=await client.from('roots_forms').select('id,title').eq('id',id).maybeSingle();if(formError)return <p role="alert">Responses could not be loaded.</p>;if(!form)notFound()
 const number=Number(q.page),page=Number.isSafeInteger(number)&&number>0&&number<100000?number:1,offset=(page-1)*25
 const {data,count,error}=await client.from('roots_form_submissions').select('id,respondent_name,respondent_email,payment_state,payment_environment,created_at',{count:'exact'}).eq('form_id',id).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+24)
 // Resolve a confirmed range miss without presenting a database outage.
 let total=count;if(error?.code==='PGRST103'){const result=await client.from('roots_form_submissions').select('id',{head:true,count:'exact'}).eq('form_id',id);if(!result.error)total=result.count}
 const rangeMiss=error?.code==='PGRST103'&&total!==null&&offset>=total
 return <div className="space-y-6"><Link href='/dashboard/roots' className="text-sm text-muted-foreground">← Roots bookings</Link><h1 className="text-3xl font-medium">{form.title} · Responses</h1>{error&&!rangeMiss?<p role="alert">Responses could not be loaded. Please try again.</p>:<><p className="text-sm text-muted-foreground">{total??0} responses · page {page}. Open a response to view its answers.</p><div className="crm-panel divide-y">{data?.length?data.map(r=><Link prefetch={false} key={r.id} href={`/dashboard/roots/forms/${id}/responses/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="text-sm font-medium">{r.respondent_name}</p><p className="text-xs text-muted-foreground">{r.respondent_email}</p></div><div className="text-right text-xs text-muted-foreground"><p>{r.payment_state.replaceAll('_',' ')}{r.payment_environment==='test'?' · test payment':''}</p><time>{new Date(r.created_at).toLocaleDateString('en-GB')}</time></div></Link>):<p className="p-6 text-sm">No responses on this page. <Link className="underline" href={`/dashboard/roots/forms/${id}/responses`}>First page</Link></p>}</div><nav aria-label="Response pages" className="flex gap-5 text-sm">{page>1&&<Link prefetch={false} href={`?page=${page-1}`}>Previous</Link>}{offset+25<(total??0)&&<Link prefetch={false} href={`?page=${page+1}`}>Next</Link>}</nav></>}</div>
}
