import 'server-only'
import Stripe from 'stripe'

export async function settleFormPayment(client:any,session:Stripe.Checkout.Session,eventType:string){
 const id=session.metadata?.roots_form_submission_id;if(!id)return false
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(eventType))return true
 const {data:row,error}=await client.from('roots_form_submissions').select('id,form_id,amount_pence,currency,checkout_session_id,payment_state,payment_environment').eq('id',id).maybeSingle()
 if(error||!row)throw new Error('Form payment record is unavailable.')
 if(row.checkout_session_id!==session.id||session.metadata?.roots_form_id!==row.form_id||session.currency!==row.currency||session.amount_total!==row.amount_pence)throw new Error('Form payment does not match its saved checkout.')
 const environment=session.livemode?'live':'test';if(row.payment_environment!==environment)throw new Error('Form checkout environment does not match.')
 let state:string|undefined
 if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(eventType)&&session.payment_status==='paid')state='paid'
 if(eventType==='checkout.session.async_payment_failed')state='failed'
 if(eventType==='checkout.session.expired')state='expired'
 if(state&&row.payment_state!=='paid'){
  const {error:writeError}=await client.from('roots_form_submissions').update({payment_state:state,...(state==='paid'?{paid_at:new Date().toISOString()}:{})}).eq('id',id).eq('checkout_session_id',session.id).neq('payment_state','paid')
  if(writeError)throw new Error('Unable to save verified form payment.')
 }
 return true
}
