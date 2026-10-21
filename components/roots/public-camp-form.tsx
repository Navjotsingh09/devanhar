import { FormRenderer } from '@/components/roots-forms/form-renderer'
import { formSchema } from '@/lib/roots-forms/schema'
import { formsAdmin } from '@/lib/roots-forms/server'
import '@/components/roots-forms/forms.css'
export async function PublicCampForm() {
 try {
  const {data,error}=await formsAdmin().from('roots_forms').select('published_schema,accepting').eq('slug','roots-residential-camp-registration').maybeSingle()
  const parsed=formSchema.safeParse(data?.published_schema)
  if(error||!data?.accepting||!parsed.success) throw new Error('unavailable')
  return <FormRenderer definition={parsed.data} slug="roots-residential-camp-registration" />
 } catch { return <p role="alert">Registration is temporarily unavailable. Please try again shortly or contact the Roots team.</p> }
}
