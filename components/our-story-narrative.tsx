"use client";

import { useState } from "react";

interface Milestone {
  year: number;
  theme: string;
  icon: string;
  headline: string;
  description: string;
  accent: string;
  image: string;
}

const milestones: Milestone[] = [
  {
    year: 2018, theme: "Genesis", icon: "\u{1F331}",
    headline: "The Seed Was Planted",
    description: "Devanhaar was born from a simple but powerful idea \u2014 that every person deserves the chance to build a better life through compassion, education, and opportunity.",
    accent: "emerald-500",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
  },
  {
    year: 2019, theme: "Foundation", icon: "\u{1F4D6}",
    headline: "Building the Blueprint",
    description: "Formalized operations and crafted the strategic roadmap that would guide our mission for years to come.",
    accent: "blue-500",
    image: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=800&q=80",
  },
  {
    year: 2020, theme: "Resilience", icon: "\u{1F91D}",
    headline: "Standing Strong Through Crisis",
    description: "When the world faced unprecedented challenges, Devanhaar mobilized emergency relief \u2014 distributing supplies, funding, and hope.",
    accent: "amber-500",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
  },
  {
    year: 2021, theme: "Education", icon: "\u{1F393}",
    headline: "Unlocking Potential",
    description: "Launched scholarships and education initiatives, opening doors for underprivileged students to access quality learning.",
    accent: "violet-500",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  },
  {
    year: 2022, theme: "Growth", icon: "\u{1F49C}",
    headline: "Expanding Our Reach",
    description: "Extended programs to new communities, building partnerships that amplified our impact across regions.",
    accent: "rose-500",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
  },
  {
    year: 2023, theme: "Empowerment", icon: "\u{1F94B}",
    headline: "Empowering Communities",
    description: "Introduced vocational training and community development programs, helping individuals become self-sufficient.",
    accent: "teal-500",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
  },
  {
    year: 2024, theme: "Innovation", icon: "\u{1F4BC}",
    headline: "Innovating for Impact",
    description: "Embraced technology and data-driven approaches to maximize our reach and effectiveness in serving communities.",
    accent: "orange-500",
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80",
  },
  {
    year: 2025, theme: "Momentum", icon: "\u{1F680}",
    headline: "Accelerating Change",
    description: "Scaling proven programs nationally while deepening local impact through grassroots engagement.",
    accent: "cyan-500",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
  },
  {
    year: 2026, theme: "Vision", icon: "\u{1F30D}",
    headline: "A Future Without Limits",
    description: "Our vision for 2026 and beyond \u2014 a world where every individual has access to resources, education, and support they need to thrive.",
    accent: "indigo-500",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  },
];

export default function OurStoryNarrative() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="w-full">
      <div className="flex w-full bg-[#031625]" style={{ minHeight: "600px", height: "85vh" }}>
        {milestones.map((m, i) => {
          const isHovered = hoveredIndex === i;
          const hasHover = hoveredIndex !== null;
          const defaultWidth = 100 / milestones.length;
          const width = hasHover
            ? isHovered ? 30 : (100 - 30) / (milestones.length - 1)
            : defaultWidth;

          return (
            <div
              key={m.year}
              className="relative overflow-hidden text-white cursor-pointer"
              style={{
                width: `${width}%`,
                transition: "width 0.5s ease",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-[filter] duration-500"
                style={{
                  backgroundImage: `url(${m.image})`,
                  filter: isHovered ? "grayscale(0)" : "grayscale(100%)",
                }}
              />

              {/* Dark overlay */}
              <div
                className="absolute inset-0 bg-[#031625]/85 transition-opacity duration-500"
                style={{ opacity: isHovered ? 0 : 1 }}
              />

              {/* Bottom gradient */}
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 75%)",
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "translateY(0)" : "translateY(50%)",
                  transition: isHovered
                    ? "opacity 1s ease, transform 1s ease 0.25s"
                    : "opacity 0.5s ease, transform 0.5s ease",
                }}
              />

              {/* Year label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] text-center">
                <div className="border-t border-b border-white/60 py-3 px-6">
                  <p className="text-3xl md:text-4xl font-bold tracking-wider">{m.year}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] mt-2 text-white/60">{m.theme}</p>
              </div>

              {/* Content - revealed on hover */}
              <div
                className="absolute z-[2] text-center px-6"
                style={{
                  top: "55%",
                  left: 0,
                  right: 0,
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "translateY(0)" : "translateY(25px)",
                  transition: isHovered ? "all 0.75s ease 0.5s" : "all 0.3s ease",
                }}
              >
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-[#F59E0B] mb-2">
                  {m.headline}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
