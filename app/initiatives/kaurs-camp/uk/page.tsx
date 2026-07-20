import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Kaurs Camp UK | Devanhaar",
  description:
    "Kaurs Camp UK applications are not currently open. Get in touch to be the first to hear when they do.",
}

export default function KaursCampUkPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl py-16 md:py-24">
          <Link
            href="/initiatives/kaurs-camp"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kaurs Camps
          </Link>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(43,100%,29%)] mb-4">
            Kaurs Camp UK
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
            Applications are not currently open
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
            Kaurs Camp UK applications are not currently open. Get in touch to
            be the first to hear when they do.
          </p>
          <Link href="/contact">
            <Button className="rounded-full px-7 bg-[hsl(43,100%,29%)] hover:bg-[hsl(43,100%,25%)] text-white">
              Get in touch
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
