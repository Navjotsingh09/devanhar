import Link from "next/link"
import { FamilyInterestTable } from "@/components/family-initiative/family-interest-table"
import { ArrowRight, HeartHandshake, Sparkles, UsersRound } from "lucide-react"
import { requireProgramme } from "@/lib/staff-programme-server"

export const dynamic = "force-dynamic"
export const metadata = { title: "Sikh Family Initiative | Dashboard" }

async function getCounts() {
  const supabase = await requireProgramme('family')
  const [retreatBookings, initiativeBookings, interests] = await Promise.all([
    supabase.from("family_retreat_bookings").select("id", { count: "exact", head: true }),
    supabase.from("family_initiative_bookings").select("id", { count: "exact", head: true }),
    supabase.from("form_submissions").select("*").order("created_at", { ascending: false }).limit(5000),
  ])

  const rows = interests.data || []
  const countProject = (name: string) => rows.filter((row: any) => String(row.form_data?.project || "").toLowerCase() === name.toLowerCase()).length

  return {
    retreat: (retreatBookings.count || 0) + countProject("Sikh Family Retreat"),
    extravaganza: (initiativeBookings.count || 0) + countProject("Sikh Family Extravaganza"),
    wedding: countProject("Wedding Fair"),
    general: rows.filter((row: any) => !row.form_data?.project),
  }
}

export default async function FamilyInitiativeDashboardPage() {
  const counts = await getCounts()
  const projects = [
    {
      title: "Sikh Family Retreat",
      description: "New Year Reset, Spring and Summer retreat bookings and interest registrations.",
      href: "/dashboard/family-initiative/retreat",
      icon: HeartHandshake,
      count: counts.retreat,
    },
    {
      title: "Sikh Family Extravaganza",
      description: "Extravaganza bookings and interest registrations, including historic Family Fun Day records.",
      href: "/dashboard/family-initiative/extravaganza",
      icon: Sparkles,
      count: counts.extravaganza,
    },
    {
      title: "Wedding Fair",
      description: "Wedding Fair bookings and interest registrations.",
      href: "/dashboard/family-initiative/wedding-fair",
      icon: UsersRound,
      count: counts.wedding,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Umbrella programme</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Sikh Family Initiative</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Manage all three family projects from one place. Open a project to view its own bookings, registrations and follow-up records.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => {
          const Icon = project.icon
          return (
            <Link key={project.title} href={project.href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800"><Icon className="h-5 w-5" /></span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{project.count} records</span>
              </div>
              <h2 className="mt-6 text-xl font-bold">{project.title}</h2>
              <p className="mt-2 min-h-[60px] text-sm leading-6 text-muted-foreground">{project.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Open project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          )
        })}
      </div>
      <section className="space-y-3"><h2 className="text-xl font-semibold">General family enquiries</h2><FamilyInterestTable submissions={counts.general} /></section>
    </div>
  )
}
