import { notFound } from 'next/navigation'
import { requireRootsStaff } from '@/lib/staff-programme-server'
import { FormBuilder, type FormRecord } from '@/components/roots-forms/form-builder'
import { rootsCampTemplate, blankForm } from '@/lib/roots-forms/template'
import { formSchema } from '@/lib/roots-forms/schema'
import { paymentReady, missingStorage } from '@/lib/roots-forms/server'
export const dynamic='force-dynamic'
export default async function FormEditor({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{template?:string}>}){
 const client=await requireRootsStaff(),{id}=await params,query=await searchParams
 let initial:FormRecord|null=null,ready=true
 if(id==='new'){const {error}=await client.from('roots_forms').select('id').limit(1);if(error){if(missingStorage(error))ready=false;else return <p role="alert">Form storage could not be reached. Please try again.</p>}}
 else{if(!/^[a-f0-9-]{36}$/i.test(id))notFound();const {data,error}=await client.from('roots_forms').select('id,slug,title,draft_schema,published_version,revision,accepting').eq('id',id).maybeSingle();if(error)return <p role="alert">The form could not be loaded. Please return to the form studio.</p>;if(!data)notFound();const parsed=formSchema.safeParse(data.draft_schema);if(!parsed.success)return <p role="alert">This form design needs administrator review before it can be edited.</p>;initial={...data,draft_schema:parsed.data}}
 return <FormBuilder initial={initial} definition={initial?.draft_schema||(query.template==='blank'?blankForm():rootsCampTemplate())} storageReady={ready} paymentConfigured={paymentReady()} testPayments={/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY||'')} />
}
