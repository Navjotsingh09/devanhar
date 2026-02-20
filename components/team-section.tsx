import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
    name: "Harjinder Singh",
    role: "Founder & Director",
    img: "https://images.unsplash.com/photo-1612810436788-aa23a6900f2f?w=200&h=200&fit=crop&crop=face&q=80",
  },
  {
    name: "Gurpreet Kaur",
    role: "Head of Education",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face&q=80",
  },
  {
    name: "Rajveer Singh",
    role: "Operations Lead",
    img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face&q=80",
  },
  {
    name: "Simran Kaur",
    role: "Outreach Director",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face&q=80",
  },
  {
    name: "Amrit Singh",
    role: "Programs Manager",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face&q=80",
  },
  {
    name: "Jasleen Kaur",
    role: "Youth Lead",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face&q=80",
  },
]

export function TeamSection() {
  return (
    <section id="team" className="py-24 md:py-32 bg-[#1a1f36]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-300/60 mb-4">
            Our team
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-balance">
            Meet the People Behind{" "}
            <br className="hidden md:block" />
            the Mission
          </h2>
          <p className="text-base text-white/50 max-w-2xl leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Get to
            know the passionate volunteers who drive our impact.
          </p>
        </div>

        {/* Background logos row */}
        <div className="my-12 flex items-center gap-8 overflow-hidden">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
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
              <p className="text-xs text-white/40">{member.role}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <Button
            variant="outline"
            className="rounded-full px-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Meet the full team <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
