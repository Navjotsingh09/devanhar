import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { createClient } from "@/lib/supabase/server"
import { Briefcase, MapPin, ArrowRight, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Careers | Devanhaar",
  description:
    "Open vacancies and volunteer opportunities at Devanhaar. Join the sevadaars building Sikh-rooted programmes across the UK.",
  openGraph: {
    title: "Careers | Devanhaar",
    description: "Open vacancies and volunteer opportunities at Devanhaar.",
    url: "https://devanhaar.vercel.app/careers",
  },
  alternates: { canonical: "https://devanhaar.vercel.app/careers" },
}

export const revalidate = 60

type Vacancy = {
  id: string
  title: string
  description: string | null
  vacancy_type: string
  employment_basis: string | null
  location: string | null
  is_remote: boolean | null
  closes_at: string | null
  created_at: string
  initiatives: { name: string } | null
}

async function getVacancies(): Promise<Vacancy[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vacancies")
    .select("id, title, description, vacancy_type, employment_basis, location, is_remote, closes_at, created_at, initiatives(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  return (data as unknown as Vacancy[]) ?? []
}

const typeLabel: Record<string, string> = {
  volunteer: "Volunteer",
  paid: "Paid Role",
  internship: "Internship",
}

export default async function CareersPage() {
  const vacancies = await getVacancies()

  const grouped = {
    paid: vacancies.filter((v) => v.vacancy_type === "paid"),
    volunteer: vacancies.filter((v) => v.vacancy_type === "volunteer"),
    internship: vacancies.filter((v) => v.vacancy_type === "internship"),
  }

  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="pt-24 pb-20 bg-background">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              Careers
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance mb-6">
              Build with us
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Open positions across the Devanhaar family — paid roles, volunteer
              opportunities, and internships. Find a place that matches your
              calling.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>
                {vacancies.length} {vacancies.length === 1 ? "open role" : "open roles"}
              </span>
            </div>
          </div>
        </section>

        {/* Listings */}
        <section className="container mx-auto px-6 lg:px-12 max-w-5xl">
          {vacancies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No open roles right now
              </h2>
              <p className="text-muted-foreground mb-6">
                Check back soon — new opportunities are posted regularly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Express interest <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {(["paid", "volunteer", "internship"] as const).map((cat) =>
                grouped[cat].length === 0 ? null : (
                  <div key={cat}>
                    <h2 className="text-2xl md:text-3xl font-light text-foreground mb-2 tracking-tight">
                      {typeLabel[cat]} {cat === "paid" ? "Positions" : cat === "volunteer" ? "Opportunities" : "Programmes"}
                    </h2>
                    <div className="w-12 h-px bg-amber-400 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grouped[cat].map((v) => (
                        <VacancyCard key={v.id} v={v} />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
      <FooterSection />
    </>
  )
}

function VacancyCard({ v }: { v: Vacancy }) {
  const closes = v.closes_at ? new Date(v.closes_at) : null
  return (
    <Link
      href={`/careers/${v.id}`}
      className="group block rounded-2xl border border-border bg-background p-6 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {v.title}
        </h3>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
          {typeLabel[v.vacancy_type] || v.vacancy_type}
        </span>
      </div>
      {v.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {v.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {(v.location || v.is_remote) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {v.is_remote ? "Remote" : v.location}
          </span>
        )}
        {v.employment_basis && (
          <span className="capitalize">{v.employment_basis.replace("-", " ")}</span>
        )}
        {v.initiatives?.name && <span>{v.initiatives.name}</span>}
        {closes && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Closes {closes.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </Link>
  )
}
