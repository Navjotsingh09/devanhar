import {NextResponse} from 'next/server'
import {revalidatePath,revalidateTag} from 'next/cache'
import {z} from 'zod'
import {kindSchema,entrySlugSchema,entrySchemas} from '@/lib/cms/entries/content'
import {EntryError,writeEntry,getEntryState} from '@/lib/cms/entries/server'
const schema=z.object({action:z.enum(['save','publish','restore','discard','unpublish','archive','recover']),content:z.unknown().optional(),projectId:z.string().uuid().nullable(),expectedDraft:z.string().uuid().nullable(),expectedPublished:z.string().uuid().nullable(),revisionId:z.string().uuid().optional()}).strict()
export async function POST(request:Request,{params}:{params:Promise<{kind:string;slug:string}>}){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Use the content editor.'},{status:403})
 const{kind:rawKind,slug}=await params,kind=kindSchema.safeParse(rawKind)
 if(!kind.success||!entrySlugSchema.safeParse(slug).success)return NextResponse.json({error:'Content not found.'},{status:404})
 if(Number(request.headers.get('content-length'))>500000)return NextResponse.json({error:'Content is too large.'},{status:413})
 const raw=await request.text();if(raw.length>500000)return NextResponse.json({error:'Content is too large.'},{status:413})
 const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Invalid content request.'},{status:400})
 const input=parsed.data;let content
 if(input.action==='save'||input.action==='publish'){const result=entrySchemas[kind.data].safeParse(input.content);if(!result.success)return NextResponse.json({error:result.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400});content=result.data}
 if(input.action==='restore'&&!input.revisionId)return NextResponse.json({error:'Choose a revision.'},{status:400})
 await writeEntry(kind.data,slug,{...input,content})
 if(['publish','unpublish','archive'].includes(input.action)){revalidateTag('cms-entries',{expire:0});revalidatePath('/','layout');revalidatePath('/projects');revalidatePath('/events');revalidatePath(`/projects/${slug}`);revalidatePath(`/events/${slug}`)}
 revalidatePath('/dashboard/website')
 return NextResponse.json(await getEntryState(kind.data,slug),{headers:{'Cache-Control':'private, no-store'}})
}catch(error){const status=error instanceof EntryError?error.status:error instanceof SyntaxError?400:503;return NextResponse.json({error:error instanceof EntryError?error.message:status===400?'Invalid request.':'Content management is temporarily unavailable.'},{status})}}
