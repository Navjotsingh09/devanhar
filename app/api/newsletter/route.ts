import {NextResponse} from 'next/server'
import {subscribeSchema} from '@/lib/newsletter'
import {cmsService} from '@/lib/cms/service'
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Please subscribe from the website.'},{status:403})
 try{const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Request is too large.'},{status:413});const parsed=subscribeSchema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Enter a valid email address and agree to receive the newsletter.'},{status:400});const{error}=await cmsService().from('newsletter_subscriptions').upsert({email:parsed.data.email,full_name:parsed.data.name||null,consent:true,status:'active',subscribed_at:new Date().toISOString(),unsubscribed_at:null,source:'website'},{onConflict:'email'});if(error)throw error;return NextResponse.json({success:true})}catch{return NextResponse.json({error:'Your subscription could not be saved. Please retry.'},{status:503})}
}
