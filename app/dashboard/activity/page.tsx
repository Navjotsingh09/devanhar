import Link from 'next/link'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { redirect } from 'next/navigation'
export default async function ActivityPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const {client,user,authError,profile,grants}=await getRequestStaff()
 if(authError||!user)redirect('/auth/login')
 if(profile.error||!profile.data||grants.error||!Array.isArray(grants.data))throw new Error('Account access could not be verified')
 const isAdmin=['admin','super_admin'].includes(profile.data.role)
 const raw=Number((await searchParams).page||1);const page=Number.isSafeInteger(raw)&&raw>0?Math.min(raw,10000):1
 let query=client.from('activity_log').select('id,admin_id,action,entity_type,entity_id,created_at',{count:'exact'})
 if(!isAdmin)query=query.eq('admin_id',user.id)
 const result=await query.order('created_at',{ascending:false}).order('id',{ascending:false}).range((page-1)*25,page*25-1)
 if(result.error)throw new Error('Activity could not be loaded')
 const rows=result.data||[];const ids=[...new Set(rows.map(row=>row.admin_id))]
 const actors=ids.length?await client.from('admin_profiles').select('id,full_name').in('id',ids):{data:[],error:null}
 return <div className="space-y-6"><header><h1 className="text-3xl font-semibold tracking-tight">Activity log</h1><p className="mt-2 text-sm text-muted-foreground">{isAdmin?'Recent recorded staff and website changes.':'Your recorded staff and website changes.'}</p></header><div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">Recorded staff actions</caption><thead className="bg-muted"><tr>{['Person','Action','Content','Date and time'].map(text=><th key={text} className="px-4 py-3">{text}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t"><td className="px-4 py-4">{actors.data?.find(actor=>actor.id===row.admin_id)?.full_name||'Staff member'}</td><td className="px-4 py-4">{row.action}</td><td className="px-4 py-4"><span className="capitalize">{row.entity_type?.replaceAll('_',' ')}</span><span className="mt-1 block text-xs text-muted-foreground">{row.entity_id}</span></td><td className="px-4 py-4 whitespace-nowrap">{new Date(row.created_at).toLocaleString('en-GB',{timeZone:'Europe/London',dateStyle:'medium',timeStyle:'short'})}</td></tr>)}{!rows.length&&<tr><td colSpan={4} className="px-4 py-8 text-muted-foreground">No recorded changes.</td></tr>}</tbody></table></div><nav aria-label="Activity pages" className="flex items-center gap-5 text-sm">{page>1&&<Link prefetch={false} href={'/dashboard/activity?page='+(page-1)} className="underline">Previous</Link>}<span>Page {page} · {result.count||0} records</span>{page*25<(result.count||0)&&<Link prefetch={false} href={'/dashboard/activity?page='+(page+1)} className="underline">Next</Link>}</nav></div>
}
