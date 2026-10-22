import { notFound } from 'next/navigation'
import { FormRenderer } from '@/components/roots-forms/form-renderer'
import { campDefinition, formSchema,validSlug } from '@/lib/roots-forms/schema'
import { formsAdmin } from '@/lib/roots-forms/server'
import '@/components/roots-forms/forms.css'
export const dynamic='force-dynamic'
export default async function PublicForm({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!validSlug(slug))notFound()
 let row:any;try{const {data,error}=await formsAdmin().from('roots_forms').select('published_schema,accepting').eq('slug',slug).maybeSingle();if(error)throw error;row=data}catch{return <main className="mx-auto max-w-xl px-6 py-20"><h1 className="text-2xl font-medium">Roots form unavailable</h1><p className="mt-4 text-sm">This form is not ready to accept submissions. Please contact the Roots team.</p></main>}
 if(!row?.published_schema)notFound();const parsed=formSchema.safeParse(row.published_schema)
 return <main className="mx-auto max-w-2xl px-5 py-12"><p className="mb-8 text-xs font-semibold uppercase tracking-[.2em] text-amber-700">Devanhaar · Roots</p>{!row.accepting?<><h1 className="text-2xl font-medium">This form is closed</h1><p className="mt-4 text-sm">Please contact Roots if you need assistance.</p></>:!parsed.success?<p>This form is unavailable. Please contact Roots.</p>:<FormRenderer definition={campDefinition(parsed.data,slug)} slug={slug} testPayments={/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY||'')} />}</main>
}
