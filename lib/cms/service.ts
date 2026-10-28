import 'server-only'
import {createClient} from '@supabase/supabase-js'
export function cmsService(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Storage is temporarily unavailable.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
