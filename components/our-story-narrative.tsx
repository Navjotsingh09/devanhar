"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Milestone {
  year: number;
  theme: string;
  icon: string;
  headline: string;
  description: string;
  accent: string;
}

const milestones: Milestone[] = [
  {
    year: 2018,
    theme: "Genesis",
    icon: "\u{1F331}",
    headline: "The Seed Was Planted",
    description:
      "Devanhaar was born from a simple but powerful idea — that every person deserves the chance to build a better life through compassion, education, and opportunity.",
    accent: "emerald-500",
  },
  {
    year: 2019,
    theme: "Foundation",
    icon: "\u{1F4D6}",
    headline: "Building the Blueprint",
    description:
      "Formalized operations and crafted the strategic roadmap that would guide our mission for years to come.",
    accent: "blue-500",
  },
  {
    year: 2020,
    theme: "Resilience",
    icon: "\u{1F91D}",
    headline: "Standing Strong Through Crisis",
    description:
      "When the world faced unprecedented challenges, Devanhaar mobilized emergency relief — distributing supplies, funding, and hope where it was needed most.",
    accent: "amber-500",
  },
  {
    year: 2021,
    theme: "Education",
    icon: "\u{1F393}",
    headline: "Unlocking Potential",
    description:
      "Launched scholarships and education initiatives, opening doors for underprivileged students to access quality learning.",
    accent: "violet-500",
  },
  {
    year: 2022,
    theme: "Growth",
    icon: "\u{1F49C}",
    headline: "Expanding Our Reach",
    description:
      "Extended programs to new communities, building partnerships that amplified our impact across regions.",
    accent: "rose-500",
  },
  {
    year: 2023,
    theme: "Empowerment",
    icon: "\u{1F94B}",
    headline: "Empowering Communities",
    description:
      "Introduced vocational training and community development programs, helping individuals become self-sufficient.",
    accent: "teal-500",
  },
  {
    year: 2024,
    theme: "Innovation",
    icon: "\u{1F4BC}",
    headline: "Innovating for Impact",
    description:
      "Embraced technology and data-driven approaches to maximize our reach and effectiveness in serving communities.",
    accent: "orange-500",
  },
  {
    year: 2025,
    theme: "Momentum",
    icon: "\u{1F680}",
    headline: "Accelerating Change",
    description:
      "Scaling proven programs nationally while deepening local impact through grassroots engagement.",
    accent: "cyan-500",
  },
  {
    year: 2026,
    theme: "Vision",
    icon: "\u{1F30D}",
    headline: "A Future Without Limits",
    description:
      "Our vision for 2026 and beyond — a world where every individual has access to the resources, education, and support they need to thrive.",
    accent: "indigo-500",
  },
];

const totalPanels = milestones.length;

export default function OurStoryNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (!containerRef.current) return;
    const clamped = Math.max(0, Math.min(index, totalPanels - 1));
    setActiveIndex(clamped);
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goTo(activeIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, goTo]);

  /* Swipe / drag */
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    if (Math.abs(dx) > 40) {
      goTo(activeIndex + (dx < 0 ? 1 : -1));
    }
    pointerStart.current = null;
  };

  return (
    <section className="relative w-full bg-background">
      <div
        ref={containerRef}
        className="relative h-[85vh] flex flex-col"
        tabIndex={0}
      >
        {/* Top bar */}
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
              <p className="text-sm text-muted-foreground mt-1">2018 &ndash; 2026</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                aria-label="Previous milestone"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="p-2 rounded-full border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {/* Next */}
              <button
                aria-label="Next milestone"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === totalPanels - 1}
                className="p-2 rounded-full border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Counter + progress bar */}
              <span className="text-xs text-muted-foreground font-medium tabular-nums ml-2">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(totalPanels).padStart(2, "0")}
              </span>
              <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((activeIndex) / (totalPanels - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card carousel */}
        <div
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div
            ref={trackRef}
            className="flex h-full transition-transform duration-700 ease-out will-change-transform"
            style={{
              width: `${totalPanels * 100}%`,
              transform: `translateX(-${(activeIndex / totalPanels) * 100}%)`,
            }}
          >
            {milestones.map((m, i) => {
              const distance = Math.abs(i - activeIndex);
              const isActive = i === activeIndex;
              const opacity = isActive ? 1 : distance === 1 ? 0.55 : 0.3;
              const scale = isActive ? 1 : 0.92;
              return (
                <div
                  key={m.year}
                  className="flex-shrink-0 px-4 py-8 transition-all duration-700 cursor-pointer"
                  style={{
                    width: `${100 / totalPanels}%`,
                    opacity,
                    transform: `scale(${scale})`,
                    transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => goTo(i)}
                >
                  <div
                    className={`relative h-full rounded-2xl border p-8 flex flex-col justify-between ${isActive ? "shadow-2xl" : "shadow-none border-border/50"} transition-shadow duration-500`}
                  >
                    {/* Year watermark */}
                    <span
                      className={`absolute top-4 right-6 text-7xl font-black select-none pointer-events-none ${isActive ? "text-primary/10" : "text-muted/5"}`}
                    >
                      {m.year}
                    </span>

                    {/* Icon + badges */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">{m.icon}</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {m.year}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {m.theme}
                      </span>
                    </div>

                    {/* Headline + description */}
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{m.headline}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive timeline rail */}
        <div className="relative px-8 py-6">
          {/* Background rail line */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-border -translate-y-1/2" />
          {/* Active progress line */}
          <div
            className="absolute top-1/2 left-8 h-0.5 bg-primary -translate-y-1/2 transition-all duration-700"
            style={{ width: `${(activeIndex / (totalPanels - 1)) * 100}%` }}
          />
          {/* Timeline dots */}
          <div className="relative flex justify-between">
            {milestones.map((m, i) => {
              const isActive = i === activeIndex;
              const isPast = i <= activeIndex;
              return (
                <button
                  key={m.year}
                  onClick={() => goTo(i)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                      isActive
                        ? "bg-primary border-primary ring-4 ring-primary/20 scale-125"
                        : isPast
                          ? "bg-primary border-primary"
                          : "bg-background border-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? "text-primary font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {m.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
