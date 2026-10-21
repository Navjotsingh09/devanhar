import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { formSchema, publishable, validSlug, type FormDefinition } from './schema'
export function formsAdmin(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Form storage is not connected.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export const missingStorage=(error:any)=>['PGRST205','42P01','42501'].includes(error?.code)
export const setupMessage='Form storage is not connected yet. The Roots form-builder database setup must be applied by an administrator.'
export function paymentReady(){return !!(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET)}
export function checkedDefinition(input:unknown, publishing=false):FormDefinition {const parsed=formSchema.safeParse(input);if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||'Check the form questions.');if(publishing){publishable(parsed.data);if(parsed.data.payment.enabled&&!paymentReady())throw new Error('Stripe checkout and its webhook must be configured before publishing a paid form.')}return parsed.data}
export function checkSlug(slug:unknown){if(typeof slug!=='string'||!validSlug(slug))throw new Error('Use a link name with 3–80 lowercase letters, numbers and hyphens.');return slug}
export async function readJson(request:Request,max=160000){const reader=request.body?.getReader();if(!reader)throw new Error('Missing request.');const chunks:Uint8Array[]=[];let bytes=0;for(;;){const next=await reader.read();if(next.done)break;bytes+=next.value.byteLength;if(bytes>max){await reader.cancel();throw new Error('This submission is too large.')}chunks.push(next.value)}const joined=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length}return JSON.parse(new TextDecoder().decode(joined))}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}
