import { requireProgramme } from '@/lib/staff-programme-server'
import { NewsletterSubscribers } from '@/components/dashboard/newsletter-subscribers'
export const dynamic = 'force-dynamic'
export default async function NewsletterPage() {
 const supabase = await requireProgramme('newsletter')
 const { data, error } = await supabase.from('newsletter_subscriptions').select('id,email,created_at').order('created_at',{ascending:false})
 if (error) throw new Error('Unable to load newsletter subscribers')
 return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Devanhaar Monthly Newsletter</h1><p className="mt-1 text-muted-foreground">View and export the newsletter subscriber list.</p></div><NewsletterSubscribers subscribers={data || []} /></div>
}
