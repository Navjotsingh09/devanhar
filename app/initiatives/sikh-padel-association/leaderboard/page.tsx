import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export const metadata = {
  title: "Leaderboard | Sikh Padel Association | Devanhaar",
  description:
    "Live games, points and rankings for the Sikh Padel Association tournament.",
}

export default function PadelLeaderboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="container mx-auto px-6 lg:px-12 py-20 md:py-28 max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(43,100%,29%)]/10">
            <Trophy className="h-8 w-8 text-[hsl(43,100%,29%)]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Live leaderboard
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            The live leaderboard goes live on tournament day. Games, points and
            rankings will be updated after each round so you can follow every
            team&apos;s progress.
          </p>
          <div className="mt-8">
            <Link href="/initiatives/sikh-padel-association">
              <Button variant="secondary" className="rounded-full px-6">
                Back to Sikh Padel Association
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
