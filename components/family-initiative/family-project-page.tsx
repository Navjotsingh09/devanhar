import Link from "next/link"
import { CalendarDays, ArrowLeft, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"

export function FamilyProjectPage({
  eyebrow,
  showNavbar = true,
  heroVariant = "photo",
  title,
  subtitle,
  date,
  body,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string
  showNavbar?: boolean
  heroVariant?: "photo" | "wedding"
  title: string
  subtitle: string
  date: string
  body: string[]
  ctaHref?: string
  ctaLabel?: string
}) {
  const isWeddingHero = heroVariant === "wedding"

  return (
    <>
      {showNavbar ? <Navbar /> : null}
      <main className="min-h-screen">
        <section className={`relative flex min-h-[620px] items-end overflow-hidden ${isWeddingHero ? "bg-[#f8f3eb] text-[#1b2635]" : "bg-[#101b2d] text-white"}`}>
          {isWeddingHero ? (
            <>
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_88%_24%,rgba(202,157,91,0.18),transparent_48%),radial-gradient(ellipse_at_0%_100%,rgba(202,157,91,0.12),transparent_55%)]" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-24 h-[480px] w-[480px] rounded-full border border-[#bd955c]/30 md:h-[600px] md:w-[600px]" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-40 h-[360px] w-[360px] rounded-full border border-[#bd955c]/20 md:h-[460px] md:w-[460px]" />
            </>
          ) : (
            <>
              <img src="/initiatives/sikh-family-retreat-top.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101b2d] via-[#101b2d]/65 to-transparent" />
            </>
          )}
          <div className="relative z-10 container mx-auto max-w-5xl px-6 pb-16 pt-40 lg:px-12 md:pb-24">
            <Link href="/sfi" className={`mb-7 inline-flex items-center gap-2 text-sm transition-colors ${isWeddingHero ? "text-[#745b37] hover:text-[#293a48]" : "text-white/75 hover:text-white"}`}>
              <ArrowLeft className="h-4 w-4" /> Sikh Family Initiative
            </Link>
            <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.24em] ${isWeddingHero ? "text-[#976b2a]" : "text-amber-300"}`}>{eyebrow}</p>
            <h1 className={`max-w-4xl text-5xl font-bold leading-tight md:text-7xl ${isWeddingHero ? "font-serif tracking-tight" : ""}`}>{title}</h1>
            <p className={`mt-5 max-w-2xl text-lg leading-relaxed md:text-xl ${isWeddingHero ? "text-[#485260]" : "text-white/85"}`}>{subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${isWeddingHero ? "border-[#dec7a3] bg-white/85 text-[#3e3833]" : "border-white/20 bg-white/10 backdrop-blur-sm"}`}>
                <CalendarDays className={`h-4 w-4 ${isWeddingHero ? "text-[#997237]" : "text-amber-300"}`} /> {date}
              </div>
              {ctaHref && ctaLabel && (
                <Button asChild className={`rounded-full px-6 ${isWeddingHero ? "bg-[#1b2635] text-white hover:bg-[#33465b]" : "bg-amber-400 text-slate-950 hover:bg-amber-300"}`}>
                  <Link href={ctaHref}>{ctaLabel}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-6 lg:px-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">About the project</p>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        <section className="bg-[hsl(43,100%,29%)] py-16">
          <div className="container mx-auto max-w-3xl px-6 text-center text-white lg:px-12">
            <h2 className="text-3xl font-bold">Part of Sikh Family Initiative</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">Explore the full family programme and see every upcoming project and date in one place.</p>
            <Button asChild variant="secondary" className="mt-7 rounded-full px-7">
              <Link href="/initiatives/sikh-family-initiative">View all family projects</Link>
            </Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
