"use client"

import { ArrowRight, Volume2, VolumeX, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

const words = [
  { text: "Develop.", delay: 0 },
  { text: "Elevate.", delay: 0.15 },
  { text: "Empower.", delay: 0.3, accent: true },
  { text: "Connect.", delay: 0.45 },
]

const subtitles = [
  "Empowering Communities",
  "Building Together",
  "Creating Change",
  "Inspiring Generations",
]

export function HeroOptionD() {
  const [ready, setReady] = useState(false)
  const [muted, setMuted] = useState(true)
  const [subIdx, setSubIdx] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const vidRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setReady(true), 300)
    const t2 = setInterval(() => setSubIdx((p) => (p + 1) % subtitles.length), 4000)
    return () => {
      clearTimeout(t1)
      clearInterval(t2)
    }
  }, [])

  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return
    const onTime = () => {
      if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100)
    }
    vid.addEventListener("timeupdate", onTime)
    return () => vid.removeEventListener("timeupdate", onTime)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Option badge */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
        <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl text-white/70 text-xs tracking-widest uppercase font-semibold border border-white/5">
          Option D &mdash; Video Background
        </span>
      </div>

      {/* Video — tries local file first, falls back to Pexels */}
      <video
        ref={vidRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2s] ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        src="/hero-video.mp4"
        autoPlay
        loop
        muted={muted}
        playsInline
        onCanPlayThrough={() => setVideoLoaded(true)}
        onError={(e) => {
          const vid = e.currentTarget
          if (!vid.src.includes("pexels")) {
            vid.src =
              "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
          }
        }}
      />

      {/* Cinematic overlays (3 layers for depth) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />

      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/[0.08] blur-[120px] z-10"
        style={{ animation: "pulse 6s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/3 left-[15%] w-56 h-56 rounded-full bg-orange-500/[0.08] blur-[100px] z-10"
        style={{ animation: "pulse 5s ease-in-out infinite 1.5s" }}
      />

      {/* Corner accents — top-left */}
      <div className="absolute top-0 left-0 z-20 p-10 lg:p-14">
        <div
          className="w-20 h-[1px] bg-gradient-to-r from-white/20 to-transparent"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.2s",
          }}
        />
        <div
          className="w-[1px] h-20 bg-gradient-to-b from-white/20 to-transparent"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: "top",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.2s",
          }}
        />
      </div>

      {/* Corner accents — bottom-right */}
      <div className="absolute bottom-0 right-0 z-20 p-10 lg:p-14">
        <div
          className="w-20 h-[1px] bg-gradient-to-l from-white/10 to-transparent ml-auto"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "right",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.4s",
          }}
        />
        <div
          className="w-[1px] h-20 bg-gradient-to-t from-white/10 to-transparent ml-auto"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: "bottom",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1) 1.4s",
          }}
        />
      </div>

      {/* Mute toggle — glassmorphism with expanding label */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-6 right-6 z-30 group flex items-center gap-2 py-2.5 px-3.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        <span className="relative w-4 h-4">
          <Volume2
            className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
              muted ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}
          />
          <VolumeX
            className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
              muted ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          />
        </span>
        <span className="text-[10px] tracking-wider uppercase font-medium max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 whitespace-nowrap">
          {muted ? "Sound On" : "Sound Off"}
        </span>
      </button>

      {/* Main content area */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-8 lg:px-16 pb-24 pt-40">
        {/* Crossfading subtitle pill */}
        <div
          className="relative h-8 mb-7"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
          }}
        >
          {subtitles.map((sub, i) => (
            <span
              key={sub}
              className={`absolute left-0 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border bg-white/[0.03] backdrop-blur-xl text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-700 ${
                i === subIdx
                  ? "border-amber-400/20 text-white/70 opacity-100 translate-y-0"
                  : "border-white/5 text-white/0 opacity-0 -translate-y-3"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              {sub}
            </span>
          ))}
        </div>

        {/* Staggered word reveal with 3D perspective */}
        <h2 className="flex flex-wrap gap-x-3 md:gap-x-5 gap-y-1" style={{ perspective: "800px" }}>
          {words.map((w) => (
            <span
              key={w.text}
              className={`text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[0.9] ${
                w.accent
                  ? "bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                  : "text-white"
              }`}
              style={{
                opacity: ready ? 1 : 0,
                transform: ready
                  ? "translateY(0) rotateX(0deg)"
                  : "translateY(50px) rotateX(12deg)",
                transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${0.5 + w.delay}s`,
                transformOrigin: "bottom center",
              }}
            >
              {w.text}
            </span>
          ))}
        </h2>

        {/* Description with accent bar */}
        <div
          className="mt-7 flex items-start gap-5"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 1s",
          }}
        >
          <div className="hidden md:block w-12 h-[2px] rounded-full bg-gradient-to-r from-amber-400/50 to-transparent mt-3 shrink-0" />
          <p className="max-w-md text-white/40 text-sm lg:text-[15px] leading-relaxed font-light">
            A UK-based charity empowering generations through Sikh values,
            knowledge, and spiritual growth.
          </p>
        </div>

        {/* CTA buttons with hover effects */}
        <div
          className="mt-10 flex flex-wrap items-center gap-4"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 1.1s",
          }}
        >
          <Link href="/about">
            <Button className="group relative bg-white text-black hover:bg-white rounded-full pl-8 pr-6 py-6 text-sm font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.25)] hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-2">
                Learn More
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/10 group-hover:bg-black/15 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Button>
          </Link>
          <Link href="/#contact">
            <Button
              variant="ghost"
              className="group rounded-full px-8 py-6 text-sm font-semibold border border-white/[0.12] text-white/80 hover:bg-white/[0.08] hover:text-white hover:border-white/25 transition-all duration-300 backdrop-blur-sm"
            >
              Get Involved
            </Button>
          </Link>
        </div>
      </div>

      {/* Video progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/[0.03]">
        <div
          className="h-full bg-gradient-to-r from-amber-400/50 via-orange-400/50 to-amber-400/50 rounded-full"
          style={{ width: `${progress}%`, transition: "width 0.3s linear" }}
        />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease 1.6s" }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-medium">
          Scroll
        </span>
        <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
      </div>
    </section>
  )
}
