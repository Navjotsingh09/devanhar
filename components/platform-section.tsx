import Link from "next/link"
import { Users, Heart, Globe, BookOpen, Star, GraduationCap, School } from "lucide-react"

const initiatives = [
  {
    title: "Singhs Camp",
    description:
      "A brotherhood camp uniquely designed for every Sikh at any stage of their spiritual journey. Brotherhood, growth, and deeper connection with Maharaaj.",
    icon: <Users className="w-5 h-5" />,
    href: "/initiatives/singhs-camp",
  },
  {
    title: "Kaurs Camp",
    description:
      "An everlasting sisterhood with the aim of connecting to Sikhi and the Guru's Sangat. Spirituality, self-reflection and lifelong bonds.",
    icon: <Heart className="w-5 h-5" />,
    href: "/initiatives/kaurs-camp",
  },
  {
    title: "Kids Camps",
    description:
      "Instilling Sikhi values in the next generation through interactive sessions, arts, sports, Kirtan classes and Sikh history.",
    icon: <Globe className="w-5 h-5" />,
    href: "/initiatives/kids-camps",
  },
  {
    title: "Sikhi Vidyala",
    description:
      "An educational institution providing knowledge on Sikh history, philosophy and teachings. Originally started by Bhai Jagraj Singh.",
    icon: <BookOpen className="w-5 h-5" />,
    href: "/initiatives/sikhi-vidyala",
  },
  {
    title: "Khalsa Catalyst",
    description:
      "Developing, empowering and preparing the next generation of Sikh Visionaries through speech, synergy and strategy.",
    icon: <Star className="w-5 h-5" />,
    href: "/initiatives/khalsa-catalyst",
  },
  {
    title: "University Projects",
    description:
      "Uni Talk Series crisscrossing the UK, delving into 'The Essence of Sikhi' and supporting Sikh students at a defining time.",
    icon: <GraduationCap className="w-5 h-5" />,
    href: "/initiatives/university-projects",
  },
  {
    title: "Gurmat Academy",
    description:
      "A space for young students to develop their Sikhi through Gurbani Santhiya, Ithihaas, philosophy and Seva.",
    icon: <School className="w-5 h-5" />,
    href: "/initiatives/gurmat-academy",
  },
]

export function PlatformSection() {
  return (
    <section id="initiatives" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left: Dark card - STICKY */}
          <div className="lg:col-span-5 self-start lg:sticky lg:top-28">
            <div className="relative rounded-2xl overflow-hidden bg-[#1a1d2e] text-white min-h-[32rem] flex flex-col justify-between">
              {/* Background image overlay */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1590091215524-f1dca0e6d498?w=800&q=80"
                  alt="Sikh community gathering"
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d2e] via-[#1a1d2e]/90 to-[#1a1d2e]/70" />
              </div>

              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">
                <div>
                  <span className="inline-block text-[11px] font-bold tracking-[0.15em] text-primary/80 uppercase mb-4 border border-primary/30 rounded-full px-3 py-1">
                    OUR APPROACH TO COMMUNITY BUILDING
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold leading-[1.15] mb-4">
                    Devanhaar Initiatives
                  </h3>
                  <p className="text-white/60 text-[15px] leading-relaxed max-w-md">
                    Devanhaar is dedicated to inspiring individuals and
                    communities on their Sikhi journey. Through camps, education,
                    and leadership programmes, we build lasting bonds and deeper
                    spiritual connections.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                  {["Camps", "Education", "Leadership", "Community", "Youth", "Parchaar"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="text-xs text-white/50 border border-white/15 rounded-full px-3 py-1.5"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Scrolling initiative list */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-border/60">
              {initiatives.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-5 py-10 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mt-1">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-foreground/55 text-[15px] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-foreground/20 group-hover:text-primary mt-2 flex-shrink-0 transition-all group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
