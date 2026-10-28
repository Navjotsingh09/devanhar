import 'server-only'
import {createHmac,timingSafeEqual} from 'node:crypto'
import {z} from 'zod'
const payload=z.object({id:z.string().uuid(),email:z.string().email().max(254)}).strict()
function key(){const value=process.env.NEWSLETTER_TOKEN_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!value)throw new Error('Unsubscribe links are unavailable');return value}
export function unsubscribeToken(id:string,email:string){const body=Buffer.from(JSON.stringify(payload.parse({id,email}))).toString('base64url');return body+'.'+createHmac('sha256',key()).update('newsletter-unsubscribe:'+body).digest('base64url')}
export function verifyUnsubscribeToken(token:string){if(token.length>1000)return null;try{const parts=token.split('.');if(parts.length!==2)return null;const expected=createHmac('sha256',key()).update('newsletter-unsubscribe:'+parts[0]).digest(),received=Buffer.from(parts[1],'base64url');if(received.length!==expected.length||!timingSafeEqual(received,expected))return null;return payload.parse(JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8')))}catch{return null}}
