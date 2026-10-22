import { FormRenderer } from '@/components/roots-forms/form-renderer'
import { campDefinition, formSchema } from '@/lib/roots-forms/schema'
import { formsAdmin } from '@/lib/roots-forms/server'
import { rootsCampTemplate } from '@/lib/roots-forms/template'
import '@/components/roots-forms/forms.css'
export async function PublicCampForm() {
 try {
  const {data,error}=await formsAdmin().from('roots_forms').select('published_schema,accepting').eq('slug','roots-residential-camp-registration').maybeSingle()
  const parsed=formSchema.safeParse(data?.published_schema)
  if(error||!data?.accepting||!parsed.success) throw new Error('unavailable')
  return <FormRenderer sectionHeadings={{child_name:'About your child',parent_name:'Parent or guardian',emergency_one_name:'Emergency contact 1',emergency_two_name:'Emergency contact 2',heard_about:'Travel & room sharing',dietary_needs:'Health & wellbeing',activity_consent:'Activities & confirmations'}} definition={campDefinition(parsed.data,'roots-residential-camp-registration')} slug="roots-residential-camp-registration" />
 } catch {
  if(process.env.VERCEL_ENV !== 'production') return <><p role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Registration preview — you can complete and test the form here. Live submissions are not enabled yet.</p><FormRenderer definition={rootsCampTemplate()} preview /></>
  return <p role="alert">Registration is temporarily unavailable. Please try again shortly or contact the Roots team.</p>
 }
}

