export function LogoTicker() {
  const logos = [
    { name: "CITADEL", style: "font-bold tracking-[0.15em] text-base md:text-lg" },
    { name: "Goldman\nSachs", style: "font-semibold text-xs md:text-sm text-center leading-tight" },
    { name: "SOLANA", style: "font-bold tracking-[0.08em] text-base md:text-lg" },
    { name: "Deutsche Bank", style: "font-medium text-sm md:text-base tracking-wide" },
    { name: "Google", style: "text-lg md:text-xl font-normal" },
    { name: "Trafigura", style: "font-medium text-base md:text-lg tracking-wide" },
    { name: "DeepMind", style: "font-medium text-sm md:text-base tracking-wide" },
  ]

  return (
    <section className="relative">
      <div className="bg-background/60 backdrop-blur-xl border-y border-border/50">
        <div className="flex items-center">
          {/* Label */}
          <div className="flex-shrink-0 pl-6 lg:pl-12 pr-6 lg:pr-10 py-5 border-r border-border/50">
            <p className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 whitespace-nowrap">
              Built by a team from
            </p>
          </div>

          {/* Logo row */}
          <div className="flex-1 flex items-center justify-between px-6 lg:px-12 py-4 gap-6 lg:gap-10 overflow-hidden">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex-shrink-0 flex items-center gap-2"
              >
                <span
                  className={`text-muted-foreground/50 whitespace-nowrap ${logo.style}`}
                >
                  {logo.name.includes("\n") ? (
                    <span className="flex flex-col items-center leading-none">
                      {logo.name.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  ) : (
                    logo.name
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
