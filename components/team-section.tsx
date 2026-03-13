import { Button } from "@/components/ui/button"
import { ArrowRight, Linkedin } from "lucide-react"
import Link from "next/link"

const backgrounds = [
  "Education",
  "Community Leadership",
  "Technology",
  "Healthcare",
  "Finance",
  "Legal",
  "Arts & Culture",
]

const teamMembers = [
  {
    name: "Mandeep Narwal",
    role: "Head of Operations",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=MandeepNarwal&backgroundColor=b6e3f4",
    linkedin: "https://www.linkedin.com/in/mandeep-singh-narwal/",
  },
  {
    name: "Baldev Singh",
    role: "Head of Communication",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=BaldevSingh&backgroundColor=c0aede",
    linkedin: "#",
  },
  {
    name: "Jitarun Singh, ACCA",
    role: "Account Lead",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=JitarunSingh&backgroundColor=d1d4f9",
    linkedin: "#",
  },
  {
    name: "Daljit Kaur",
    role: "Project Manager",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=DaljitKaur&backgroundColor=ffd5dc",
    linkedin: "#",
  },
  {
    name: "Mandeep Singh",
    role: "Joint Head of Finance",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=MandeepSingh&backgroundColor=ffdfbf",
    linkedin: "#",
  },
  {
    name: "Gugandeep Singh",
    role: "Joint Head of Finance",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=GugandeepSingh&backgroundColor=b6e3f4",
    linkedin: "#",
  },
  {
    name: "Gurvinder Singh",
    role: "Head of HR & Governance",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=GurvinderSingh&backgroundColor=c0aede",
    linkedin: "#",
  },
  {
    name: "Bapinder Singh",
    role: "Tech Manager",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=BapinderSingh&backgroundColor=d1d4f9",
    linkedin: "#",
  },
  {
    name: "Inderjit Singh",
    role: "Head of Self Defence Academy",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=InderjitSingh&backgroundColor=ffd5dc",
    linkedin: "#",
  },
  {
    name: "Amrit Singh",
    role: "Creative Lead",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=AmritSingh&backgroundColor=ffdfbf",
    linkedin: "#",
  },
  {
    name: "Gursimran Kaur",
    role: "Head of Kaurs Camp",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=GursimranKaur&backgroundColor=b6e3f4",
    linkedin: "#",
  },
  {
    name: "Benita",
    role: "Head of Kaurs Spaces",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=Benita&backgroundColor=c0aede",
    linkedin: "#",
  },
  {
    name: "Gurpreet Rana",
    role: "Head of Media",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=GurpreetRana&backgroundColor=d1d4f9",
    linkedin: "#",
  },
  {
    name: "Pritam Singh",
    role: "Head of Singhs Camp",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=PritamSingh&backgroundColor=ffd5dc",
    linkedin: "#",
  },
  {
    name: "Dr Taran Singh",
    role: "Head of Operations",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=DrTaranSingh&backgroundColor=ffdfbf",
    linkedin: "#",
  },
  {
    name: "Sat Singh",
    role: "Head of Partnerships",
    img: "https://api.dicebear.com/9.x/notionists/svg?seed=SatSingh&backgroundColor=b6e3f4",
    linkedin: "#",
  },
]

export function TeamSection() {
  return (
    <section id="team" className="py-24 md:py-32 bg-[#1a1f36]">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-300/60 mb-4">
            Our team
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-balance">
            Meet the People Behind{" "}
            <br className="hidden md:block" />
            the Mission
          </h2>
          <p className="text-base text-white/70 max-w-2xl leading-relaxed">
            Passionate individuals committed to empowering and supporting the next generation.
          </p>
        </div>

        {/* Background logos row */}
        <div aria-hidden="true" className="my-12 flex items-center gap-8 overflow-hidden">
          {backgrounds.map((bg, i) => (
            <span
              key={i}
              className="flex-shrink-0 text-sm font-semibold text-white/20 whitespace-nowrap"
            >
              {bg}
            </span>
          ))}
        </div>

        {/* Team member circles with real photos */}
        <div data-animate-stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-6 mb-12">
          {teamMembers.map((member, i) => (
            <div key={i} className="text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white/[0.08] mx-auto mb-4">
                <img
                  src={member.img || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-white text-sm mb-0.5">
                {member.name}
              </p>
              <p className="text-xs text-white/70 mb-1">{member.role}</p>
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`} className="inline-flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <Link href="/team"><Button
            variant="outline"
            className="rounded-full px-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Meet the full team <ArrowRight className="ml-2 h-4 w-4" />
          </Button></Link>
        </div>
      </div>
    </section>
  )
}
