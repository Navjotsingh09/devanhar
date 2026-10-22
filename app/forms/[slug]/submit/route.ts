import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { campDefinition, formSchema, formSummary, validSlug, validateAnswers } from '@/lib/roots-forms/schema'
import { formsAdmin, paymentReady, readJson, sameOrigin } from '@/lib/roots-forms/server'
export const dynamic='force-dynamic'
export async function POST(request:Request,{params}:{params:Promise<{slug:string}>}){
 if(!sameOrigin(request))return NextResponse.json({error:'Please submit from the form page.'},{status:403})
 try{
  const {slug}=await params;if(!validSlug(slug))return NextResponse.json({error:'Form not found.'},{status:404})
  const body=await readJson(request,250000);if(body.website||typeof body.requestKey!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestKey))throw new Error('Please reload the form and try again.')
  const client=formsAdmin(),{data:form,error}=await client.from('roots_forms').select('id,published_schema,published_version,accepting').eq('slug',slug).maybeSingle()
  if(error)return NextResponse.json({error:'This form is not ready to accept submissions. Please contact the Roots team.'},{status:503})
  if(!form?.published_schema||!form.accepting)return NextResponse.json({error:'This form is not accepting submissions.'},{status:409})
  const schema=campDefinition(formSchema.parse(form.published_schema),slug);let answers:Record<string,unknown>;try{answers=validateAnswers(schema,body.answers)}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Check your answers.'},{status:400})}const summary=formSummary(schema,answers)
  if(schema.payment.enabled&&!paymentReady())return NextResponse.json({error:'Payments are unavailable. Please contact the Roots team.'},{status:503})
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim()
  const ipHash=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex')
  const {data:created,error:insertError}=await client.rpc('create_roots_form_submission',{p_form_id:form.id,p_version:form.published_version,p_schema:schema,p_answers:answers,p_name:summary.name,p_email:summary.email,p_amount:schema.payment.enabled?schema.payment.amountPence:0,p_request_key:body.requestKey,p_ip_hash:ipHash})
  if(insertError)return NextResponse.json({error:insertError.message.includes('submission_rate_limit')?'Too many submissions. Please wait ten minutes before trying again.':'Your submission could not be saved. Please try again.'},{status:insertError.message.includes('submission_rate_limit')?429:503})
  const row=created?.[0];if(!row)throw new Error('Your submission could not be saved.')
  const receipt=`/forms/${slug}/received?ref=${encodeURIComponent(row.receipt_token)}`
  if(row.payment_state==='paid'||!row.amount_pence)return NextResponse.json({receivedUrl:receipt},{headers:{'Cache-Control':'private, no-store'}})
  if(['expired','failed'].includes(row.payment_state))return NextResponse.json({error:'Your response is saved, but this payment attempt has ended. Please contact Roots before trying again.'},{status:409})
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!)
  // The database price snapshot is authoritative; no client amount is accepted.
  const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{quantity:1,price_data:{currency:row.currency,unit_amount:row.amount_pence,product_data:{name:row.schema_snapshot.title}}}],...(row.respondent_email?{customer_email:row.respondent_email}:{}),client_reference_id:row.id,metadata:{roots_form_submission_id:row.id,roots_form_id:form.id},success_url:new URL(receipt,request.url).toString(),cancel_url:new URL(receipt,request.url).toString()},{idempotencyKey:`roots-form-${row.id}`})
  if(!session.url)return NextResponse.json({error:'Your submission was saved, but payment could not start. Retry this form to continue.'},{status:503})
  const {error:persistError}=await client.from('roots_form_submissions').update({checkout_session_id:session.id,checkout_url:session.url,payment_environment:session.livemode?'live':'test'}).eq('id',row.id)
  if(persistError)return NextResponse.json({error:'Your submission was saved, but payment could not start. Please retry.'},{status:503})
  return NextResponse.json({checkoutUrl:session.url},{headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return NextResponse.json({error:'Your submission or payment could not be completed. Please try again.'},{status:400})}
}
