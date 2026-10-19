import { requireProgramme } from '@/lib/staff-programme-server'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
export const dynamic = 'force-dynamic'
export default async function KaursPage() {
 const supabase = await requireProgramme('kaurs')
 const { data: initiative } = await supabase.from('initiatives').select('id,name,slug').eq('slug','kaurs-camp').single()
 if (!initiative) throw new Error('Kaurs programme is not configured')
 const [camps,forms,interest] = await Promise.all([
  supabase.from('camp_applications').select('*').eq('initiative_id',initiative.id).order('created_at',{ascending:false}).limit(5000),
  supabase.from('form_submissions').select('*').eq('initiative_id',initiative.id).order('created_at',{ascending:false}).limit(5000),
  supabase.from('register_interest').select('id,name,email,country,notes,status,created_at').like('camp','kaurs%').order('created_at',{ascending:false}).limit(5000)
 ])
 if (camps.error || forms.error || interest.error) throw new Error('Unable to load Kaurs records')
 const submissions = [
  ...(camps.data || []).map(c => ({ id:String(c.id),full_name:[c.first_name,c.last_name].filter(Boolean).join(' '),email:c.email || '',phone:c.phone || null,message:null,
   form_data:c,status:c.status,internal_notes:c.internal_notes || null,created_at:c.created_at,initiatives:{name:initiative.name,slug:initiative.slug},source_table:'camp_applications' as const,
   stripe_payment_intent_id:c.stripe_payment_intent_id || null,stripe_checkout_session_id:c.stripe_checkout_session_id || null,stripe_checkout_expires_at:c.stripe_checkout_expires_at || null,stripe_pi_status:c.stripe_pi_status || null,stripe_review_state:c.stripe_review_state || null })),
  ...(forms.data || []).map(c => ({...c,id:String(c.id),form_data:c.form_data || {},initiatives:{name:initiative.name,slug:initiative.slug},source_table:'form_submissions' as const,
   stripe_payment_intent_id:null,stripe_checkout_session_id:null,stripe_checkout_expires_at:null,stripe_pi_status:null,stripe_review_state:null}))
 ]
 return <div className="space-y-6">
  <div><h1 className="text-2xl font-bold">Kaurs</h1><p className="mt-1 text-muted-foreground">Kaurs applications and interest registrations.</p></div>
  <section><h2 className="mb-3 text-lg font-semibold">Applications and enquiries ({submissions.length})</h2><SubmissionsTable submissions={submissions} /></section>
  <section><h2 className="mb-3 text-lg font-semibold">Interest registrations ({interest.data?.length || 0})</h2>
   <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted/50"><tr>{['Name','Email','Country','Notes','Status','Registered'].map(label=><th key={label} className="p-3 font-semibold">{label}</th>)}</tr></thead>
   <tbody>{(interest.data || []).map(row=><tr key={row.id} className="border-t"><td className="p-3">{row.name}</td><td className="p-3">{row.email}</td><td className="p-3">{row.country || '—'}</td><td className="p-3">{row.notes || '—'}</td><td className="p-3">{row.status}</td><td className="p-3">{new Date(row.created_at).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table>
   {!interest.data?.length ? <p className="p-6 text-muted-foreground">No interest registrations yet.</p> : null}</div>
  </section>
 </div>
}
