import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { checkedDefinition, checkSlug, readJson, sameOrigin } from '@/lib/roots-forms/server'
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return NextResponse.json({error:'Request refused.'},{status:403})
 let client;try{client=await requireRootsStaff()}catch{return NextResponse.json({error:'Your account cannot manage Roots forms.'},{status:403})}
 try{const {id}=await params,body=await readJson(request);if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isSafeInteger(body.revision)||body.revision<1)throw new Error('Reload this form before saving.')
 const {data:current,error:readError}=await client.from('roots_forms').select('id,slug,draft_schema,published_version,revision').eq('id',id).maybeSingle();if(readError||!current)return NextResponse.json({error:'This form is unavailable.'},{status:404})
 if(current.revision!==body.revision)return NextResponse.json({error:'Another editor changed this form. Reload before saving.'},{status:409})
 let patch:Record<string,unknown>={revision:current.revision+1,updated_at:new Date().toISOString()}
 if(body.action==='publish'){const schema=checkedDefinition(current.draft_schema,true);patch={...patch,published_schema:schema,published_version:current.published_version+1,accepting:true}}
 else if(body.action==='close')patch.accepting=false
 else if(body.action==='save'){const schema=checkedDefinition(body.schema),slug=current.published_version?current.slug:checkSlug(body.slug,schema.title);patch={...patch,title:schema.title,draft_schema:schema,slug}}
 else throw new Error('Unknown form action.')
 const {data,error}=await client.from('roots_forms').update(patch).eq('id',id).eq('revision',body.revision).select('id,slug,title,draft_schema,published_version,revision,accepting').maybeSingle()
 if(error||!data)return NextResponse.json({error:error?.code==='23505'?'That link name is already used.':'The form changed or could not be saved. Reload and try again.'},{status:409})
 return NextResponse.json({form:data},{headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Check your form.'},{status:400})}
}
