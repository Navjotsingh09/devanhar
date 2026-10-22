import { redirect } from 'next/navigation'
export default function Drafts() { redirect('/dashboard/website/pages?status=draft') }
