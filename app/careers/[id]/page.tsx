import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { createClient } from "@/lib/supabase/server"
import { CareersApplyForm, type ApplicationConfig } from "@/components/careers/careers-apply-form"
import { ArrowLeft, MapPin, Clock, Briefcase, Banknote } from "lucide-react"

export const revalidate = 60

type Vacancy = {
  id: string
  title: string
  description: string | null
  vacancy_type: string
  employment_basis: string | null
  location: string | null
  is_remote: boolean | null
  salary_range: string | null
  requirements: string | null
  responsibilities: string | null
  how_to_apply: string | null
  closes_at: string | null
  is_active: boolean
  application_config: ApplicationConfig | null
  initiatives: { name: string } | null
}

async function getVacancy(id: string): Promise<Vacancy | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vacancies")
    .select("id, title, description, vacancy_type, employment_basis, location, is_remote, salary_range, requirements, responsibilities, how_to_apply, closes_at, is_active, application_config, initiatives(name)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle()
  return (data as unknown as Vacancy) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const v = await getVacancy(id)
  if (!v) return { title: "Role not found | Devanhaar Careers" }
  return {
    title: `${v.title} | Devanhaar Careers`,
    description: v.description?.slice(0, 160) ?? `Apply for ${v.title} at Devanhaar.`,
  }
}

export default async function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const v = await getVacancy(id)
  if (!v) notFound()

  const closes = v.closes_at ? new Date(v.closes_at) : null
  const typeLabel: Record<string, string> = { volunteer: "Volunteer", paid: "Paid Role", internship: "Internship" }

  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="pt-24 pb-20 bg-background">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <Link href="/careers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> All roles
          </Link>

          <header className="mb-10">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-4">
              {typeLabel[v.vacancy_type] || v.vacancy_type}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">{v.title}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {(v.location || v.is_remote) && (
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{v.is_remote ? "Remote" : v.location}</span>
              )}
              {v.employment_basis && (
                <span className="inline-flex items-center gap-1.5 capitalize"><Briefcase className="w-4 h-4" />{v.employment_basis.replace("-", " ")}</span>
              )}
              {v.salary_range && (
                <span className="inline-flex items-center gap-1.5"><Banknote className="w-4 h-4" />{v.salary_range}</span>
              )}
              {v.initiatives?.name && <span>{v.initiatives.name}</span>}
              {closes && (
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />Closes {closes.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
            </div>
          </header>

          <article className="prose prose-neutral max-w-none mb-12">
            {v.description && <Section title="About the role" body={v.description} />}
            {v.responsibilities && <Section title="Responsibilities" body={v.responsibilities} />}
            {v.requirements && <Section title="What we are looking for" body={v.requirements} />}
            {v.how_to_apply && <Section title="How to apply" body={v.how_to_apply} />}
          </article>

          <section id="apply" className="rounded-2xl border border-border bg-muted/30 p-6 md:p-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Apply for this role</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in the form below. We aim to respond within 7 days.
            </p>
            <CareersApplyForm vacancyId={v.id} vacancyTitle={v.title} config={v.application_config} />
          </section>
        </div>
      </main>
      <FooterSection />
    </>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">{body}</div>
    </div>
  )
}
