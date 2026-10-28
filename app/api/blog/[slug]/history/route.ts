import {NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'
import {z} from 'zod'
import {getBlogStaff} from '@/lib/blog-staff-server'

const restoreInput=z.object({
 revisionId:z.string().uuid(),
 expectedDraft:z.string().uuid().nullable(),
 expectedUpdated:z.string().datetime({offset:true}),
}).strict()
const slugSchema=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160)

export async function POST(request:Request,{params}:{params:Promise<{slug:string}>}){
 try{
  const{slug}=await params
  const{user,allowed,client}=await getBlogStaff(slug,'edit')
  if(!user)return NextResponse.json({error:'Please sign in again.'},{status:401})
  if(!allowed)return NextResponse.json({error:'Blog access is no longer available.'},{status:403})
  if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Use the article editor.'},{status:403})
  if(!slugSchema.safeParse(slug).success)return NextResponse.json({error:'Article not found.'},{status:404})
  if(Number(request.headers.get('content-length'))>2000)return NextResponse.json({error:'Request is too large.'},{status:413})
  const raw=await request.text()
  if(raw.length>2000)return NextResponse.json({error:'Request is too large.'},{status:413})
  const input=restoreInput.safeParse(JSON.parse(raw))
  if(!input.success)return NextResponse.json({error:'Reload the editor and choose a revision.'},{status:400})
  const{error}=await client.rpc('blog_restore_revision',{
   p_slug:slug,p_revision:input.data.revisionId,
   p_expected_draft:input.data.expectedDraft,p_expected_updated:input.data.expectedUpdated,
  })
  if(error)return NextResponse.json({error:error.code==='40001'?'Someone changed this article. Reload before restoring.':error.code==='42501'?'Blog access is no longer available.':error.code==='22023'?'This revision cannot be restored for this article.':'The revision could not be restored.'},{status:error.code==='40001'?409:error.code==='42501'?403:error.code==='22023'?400:503})
  revalidatePath('/dashboard/blog')
  revalidatePath(`/dashboard/blog/${slug}/edit`)
  return NextResponse.json({success:true},{headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return NextResponse.json({error:error instanceof SyntaxError?'Invalid request.':'The revision could not be restored.'},{status:error instanceof SyntaxError?400:503})}
}
