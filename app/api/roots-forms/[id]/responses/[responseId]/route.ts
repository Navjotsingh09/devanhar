import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { readJson, sameOrigin } from '@/lib/roots-forms/server'
import { responseTransition } from '@/lib/roots-forms/response-actions'
export async function PATCH(request: Request, {params}: {params: Promise<{id:string;responseId:string}>}) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Please use the response page.'},{status:403})
  let client
  try { client=await requireRootsStaff() } catch { return NextResponse.json({error:'You do not have permission to manage responses.'},{status:403}) }
  const {id,responseId}=await params
  if (![id,responseId].every(v=>/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v))) return NextResponse.json({error:'Response not found.'},{status:404})
  let body, state
  try {body=await readJson(request,4000);state=responseTransition(body.action,body.expectedState)} catch(e) {return NextResponse.json({error:e instanceof Error?e.message:'Check the requested action.'},{status:400})}
  const {data:{user},error:authError}=await client.auth.getUser()
  if(authError||!user)return NextResponse.json({error:'Please sign in again.'},{status:401})
  const {data,error}=await client.from('roots_form_submissions').update({record_state:state,state_changed_at:new Date().toISOString(),state_changed_by:user.id}).eq('form_id',id).eq('id',responseId).eq('record_state',body.expectedState).select('id,record_state').maybeSingle()
  if(error)return NextResponse.json({error:'The response could not be updated. Please try again.'},{status:500})
  if(!data)return NextResponse.json({error:'The response changed or is no longer available. Reload before trying again.'},{status:409})
  return NextResponse.json({state:data.record_state})
}
