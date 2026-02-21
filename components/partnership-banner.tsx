import { Play } from "lucide-react"

export function PartnershipBanner() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-border">
          {/* Left card - dark panel */}
          <div className="bg-[#1a1f36] p-10 md:p-14 flex flex-col justify-between min-h-[320px]">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-balance leading-tight">
                Devanhaar partners with communities across the UK &amp; Europe
              </h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua ut
                enim ad minim veniam.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">D</span>
              </div>
              <span className="text-[11px] text-white/50 font-semibold uppercase tracking-wider">
                Devanhaar
              </span>
            </div>
          </div>

          {/* Right card - image with play button */}
          <div className="relative aspect-video lg:aspect-auto min-h-[320px] bg-muted">
            <img
              src="https://api.dicebear.com/9.x/shapes/svg?seed=devanhaar-partnership&backgroundColor=c0aede,d1d4f9,ffdfbf"
              alt="Sikh community volunteers serving and building together"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <p className="text-white text-sm font-medium max-w-xs">
                Learn How Devanhaar is Revolutionising Community Education
              </p>
              <button
                type="button"
                className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Play className="h-5 w-5 text-white ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
