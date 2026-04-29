import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { CalendarDays } from "lucide-react"

export const metadata: Metadata = {
  title: "Events – Coming Soon | Devanhaar",
  description:
    "Our events programme is coming soon. Check back shortly for upcoming dates and details.",
}

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] bg-white flex items-center justify-center px-6 py-32">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-600 mb-8">
            <CalendarDays className="w-7 h-7" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-500 mb-4">
            Events
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-5">
            Coming Soon
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Our events programme is being put together. Please check back soon for upcoming
            dates and details.
          </p>
        </div>
      </main>
      <FooterSection />
    </>
  )
}
