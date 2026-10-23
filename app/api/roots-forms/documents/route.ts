import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { sameOrigin } from '@/lib/roots-forms/server'
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Request refused.'},{status:403})
 let client;try{client=await requireRootsStaff()}catch{return NextResponse.json({error:'Your account cannot upload form documents.'},{status:403})}
 if(Number(request.headers.get('content-length')||0)>3500000)return NextResponse.json({error:'PDFs must be smaller than 3 MB.'},{status:413})
 try{const data=await request.formData(),file=data.get('file');if(!(file instanceof File)||file.type!=='application/pdf'||file.size>3*1024*1024)throw new Error('Choose a PDF smaller than 3 MB.');const bytes=Buffer.from(await file.arrayBuffer());if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('This file is not a PDF.')
 const path=`${randomUUID()}.pdf`;const {error}=await client.storage.from('roots-form-documents').upload(path,bytes,{contentType:'application/pdf',upsert:false});if(error)throw new Error('Document storage is not ready or this PDF could not be uploaded.')
 return NextResponse.json({url:client.storage.from('roots-form-documents').getPublicUrl(path).data.publicUrl},{headers:{'Cache-Control':'private, no-store'}})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to upload PDF.'},{status:400})}
}
