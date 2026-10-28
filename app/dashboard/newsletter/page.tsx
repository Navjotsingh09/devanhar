import {requireProgramme} from '@/lib/staff-programme-server'
import {NewsletterSubscribers} from '@/components/dashboard/newsletter-subscribers'
export const dynamic='force-dynamic'
export default async function NewsletterPage(){await requireProgramme('newsletter');return <div className="space-y-6"><header><h1 className="text-3xl font-semibold tracking-tight">Newsletter subscribers</h1><p className="mt-2 text-sm text-muted-foreground">Search and export consented subscribers, or unsubscribe contacts. Restoring consent requires the person to subscribe again.</p></header><NewsletterSubscribers/></div>}
