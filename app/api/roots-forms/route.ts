import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { checkedDefinition, checkSlug, missingStorage, readJson, sameOrigin, setupMessage } from '@/lib/roots-forms/server'
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Request refused.'},{status:403})
 let client;try{client=await requireRootsStaff()}catch{return NextResponse.json({error:'Your account cannot manage Roots forms.'},{status:403})}
 try{const body=await readJson(request),schema=checkedDefinition(body.schema),slug=checkSlug(body.slug,schema.title);const {data:{user}}=await client.auth.getUser();if(!user)return NextResponse.json({error:'Sign in again.'},{status:401})
 const {data,error}=await client.from('roots_forms').insert({slug,title:schema.title,draft_schema:schema,created_by:user.id}).select('id,slug,title,draft_schema,published_version,revision,accepting').single()
 if(error)return NextResponse.json({error:missingStorage(error)?setupMessage:error.code==='23505'?'That link name is already used. Choose another.':'Unable to save this form.'},{status:missingStorage(error)?503:409})
 return NextResponse.json({form:data},{status:201,headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Check your form.'},{status:400})}
}
