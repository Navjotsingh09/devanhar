import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getRequestStaff } from '@/lib/crm/request-staff'
import { programmeHome, PROGRAMME_LABELS, type StaffProgramme } from '@/lib/staff-programme-access'

export const dynamic = 'force-dynamic'
export default async function SpaAccessPage() {
  const { user, grants } = await getRequestStaff()
  if (!user) redirect('/spa-admin/login')
  const programmes = (grants.data || []).map(row => row.programme).filter((key): key is StaffProgramme => Object.hasOwn(PROGRAMME_LABELS, key))
  const unavailable = !!grants.error || !Array.isArray(grants.data)
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6 text-[#202536]">
    <section className="w-full max-w-lg rounded-2xl border border-[#e5e7ec] bg-white p-8 shadow-sm">
      <ShieldCheck className="mb-5 h-8 w-8 text-[#a97508]" aria-hidden="true" />
      <p className="text-xs font-semibold tracking-widest text-[#737987]">SIKH PADEL ASSOCIATION</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">{unavailable ? 'We couldn’t verify your access' : 'SPA organiser access required'}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#626a79]">{unavailable ? 'Your account access could not be checked. Please try again, or contact your administrator if this continues.' : 'Your current account can access its assigned Devanhaar programmes. The SPA organiser portal requires a separate organiser permission.'}</p>
      {!unavailable && programmes.length > 0 && <div className="mt-5 rounded-xl bg-[#f7f8fa] p-4"><p className="text-xs font-medium text-[#626a79]">Your assigned programmes</p><ul className="mt-2 space-y-2 text-sm">{programmes.map(key => <li key={key}>{PROGRAMME_LABELS[key]}</li>)}</ul></div>}
      <div className="mt-7 flex flex-wrap gap-3">
        {unavailable ? <Link prefetch={false} href="/spa-admin" className="inline-flex items-center gap-2 rounded-full bg-[#ffb800] px-5 py-3 text-sm font-medium">Try again<ArrowRight className="h-4 w-4" /></Link> : <Link prefetch={false} href={programmeHome(programmes)} className="inline-flex items-center gap-2 rounded-full bg-[#ffb800] px-5 py-3 text-sm font-medium"><ArrowLeft className="h-4 w-4" />Go to my workspace</Link>}
        <Link prefetch={false} href="/spa-admin/login" className="inline-flex items-center gap-2 rounded-full bg-[#f0f1f4] px-5 py-3 text-sm font-medium">Use an SPA organiser account<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-[#737987]">If you need SPA access on this account, contact your Devanhaar administrator.</p>
    </section>
  </main>
}
