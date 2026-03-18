"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, Play, ChevronLeft, ChevronRight, Camera, Film, ArrowRight } from "lucide-react"

type GalleryCat = "all" | "camps" | "events" | "education" | "community"

interface GalleryImage {
  src: string
  alt: string
  category: Exclude<GalleryCat, "all">
  caption: string
}

interface VideoItem {
  id: string
  title: string
  duration: string
  description: string
}

interface Playlist {
  title: string
  description: string
  videos: VideoItem[]
}

const galleryImages: GalleryImage[] = [
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Singhs+Camp", alt: "Singhs Camp group", category: "camps", caption: "Singhs Camp 2024 \u2014 Brotherhood and Bonding" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Kaurs+Camp", alt: "Kaurs Camp workshop", category: "camps", caption: "Kaurs Camp \u2014 Empowering Young Sikh Women" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Kids+Camps", alt: "Kids learning", category: "education", caption: "Kids Camp \u2014 Learning Through Play" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Youth+Summit", alt: "Youth summit", category: "events", caption: "Youth Leadership Summit 2024" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Community+Gathering", alt: "Community gathering", category: "community", caption: "Community Gathering \u2014 United in Seva" },
  { src: "https://placehold.co/600x400/1a1a2e/e0e0e0.png?text=Workshop+Session", alt: "Workshop session", category: "events", caption: "Khalsa Catalyst Workshop" },
  { src: "https://placehold.co/600x400/1a1a2e/e0e0e0.png?text=Education+Session", alt: "Education session", category: "education", caption: "Sikhi Vidyala \u2014 Weekly Classes" },
  { src: "https://placehold.co/600x400/1a1a2e/e0e0e0.png?text=Team+Seva", alt: "Team seva", category: "community", caption: "Sevadaars Working Together" },
  { src: "https://placehold.co/600x400/1a1a2e/e0e0e0.png?text=Celebration", alt: "Celebration", category: "events", caption: "Vaisakhi Celebrations" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Sikhi+Vidyala", alt: "Study session", category: "education", caption: "Gurmat Academy \u2014 Deep Learning" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Khalsa+Catalyst", alt: "Panel discussion", category: "events", caption: "University Talk \u2014 Interfaith Dialogue" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Community+Kitchen", alt: "Community kitchen", category: "community", caption: "Langar Seva \u2014 Feeding the Community" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=University+Projects", alt: "University campus", category: "education", caption: "University Projects \u2014 Campus Outreach" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Gurmat+Academy", alt: "Library study", category: "education", caption: "Gurmat Academy Sessions" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=Heritage+Programme", alt: "School partnership", category: "community", caption: "Heritage Programme in Schools" },
  { src: "https://placehold.co/800x600/1a1a2e/e0e0e0.png?text=AGRI+Programme", alt: "AGRI programme", category: "community", caption: "AGRI \u2014 Sustainable Development" },
]

const playlists: Playlist[] = [
  {
    title: "Camp Highlights",
    description: "Relive the best moments from our residential camps across the UK.",
    videos: [
      { id: "dQw4w9WgXcQ", title: "Singhs Camp 2024 Highlights", duration: "8:42", description: "A look back at an incredible week of brotherhood, Sikhi, and seva." },
      { id: "jNQXAC9IVRw", title: "Kaurs Camp \u2014 Stories of Empowerment", duration: "12:15", description: "Young Sikh women share their transformative camp experiences." },
      { id: "9bZkp7q19f0", title: "Kids Camp Fun & Learning", duration: "5:30", description: "See how our youngest campers explore their heritage through play." },
      { id: "kJQP7kiw5Fk", title: "Night of Kirtan \u2014 Camp 2024", duration: "15:20", description: "A beautiful evening of Kirtan and spiritual connection at camp." },
    ],
  },
  {
    title: "Talks & Discussions",
    description: "Thought-provoking talks from Khalsa Catalyst and university events.",
    videos: [
      { id: "DLzxrzFCyOs", title: "What Does it Mean to be Khalsa Today?", duration: "22:10", description: "A Khalsa Catalyst panel exploring modern Sikh identity." },
      { id: "fJ9rUzIMcZQ", title: "University Talk \u2014 Sikhi & Social Justice", duration: "18:45", description: "Exploring the intersection of Sikh values and contemporary activism." },
      { id: "RgKAFK5djSk", title: "Gurmat Academy \u2014 Understanding Japji Sahib", duration: "35:00", description: "An in-depth exploration of the foundational Sikh prayer." },
    ],
  },
]

const categories: { label: string; value: GalleryCat }[] = [
  { label: "All", value: "all" },
  { label: "Camps", value: "camps" },
  { label: "Events", value: "events" },
  { label: "Education", value: "education" },
  { label: "Community", value: "community" },
]

function LightboxModal({ images, index, onClose, onPrev, onNext }: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const img = images[index]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <button aria-label="Close lightbox" onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      <button aria-label="Previous image" onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-4 md:left-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button aria-label="Next image" onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="relative w-full max-w-5xl mx-4 md:mx-8" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
          <Image src={img.src} alt={img.alt} fill className="object-contain" unoptimized />
        </div>
        <div className="mt-4 text-center">
          <p className="text-white text-sm md:text-base font-medium">{img.caption}</p>
          <p className="text-white/50 text-xs mt-1">{index + 1} / {images.length}</p>
        </div>
      </div>
    </div>
  )
}

export function MediaPageContent() {
  const [activeTab, setActiveTab] = useState<"gallery" | "videos">("gallery")
  const [category, setCategory] = useState<GalleryCat>("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activePlaylist, setActivePlaylist] = useState(0)
  const [activeVideo, setActiveVideo] = useState(0)

  const filtered = category === "all" ? galleryImages : galleryImages.filter((i) => i.category === category)

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null))
  }, [filtered.length])
  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null))
  }, [filtered.length])

  const currentPlaylist = playlists[activePlaylist]
  const currentVideo = currentPlaylist.videos[activeVideo]

  return (
    <div className="pt-24 pb-0">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl" data-animate>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-500 mb-4">Press &amp; Media</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">Media</h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              Explore our gallery, watch video highlights, and discover the stories behind our work.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[72px] z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex gap-0">
            {([
              { key: "gallery" as const, label: "Gallery", icon: Camera },
              { key: "videos" as const, label: "Videos", icon: Film },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <>
          {/* Category Filter */}
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="flex flex-wrap gap-2" data-animate>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    category === cat.value
                      ? "bg-amber-400 text-black"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <span className="ml-auto text-sm text-muted-foreground self-center">
                {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>

          {/* Masonry Grid */}
          <div className="container mx-auto px-6 lg:px-12 pb-20">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filtered.map((img, idx) => (
                <div
                  key={img.src}
                  className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-lg bg-muted"
                  onClick={() => openLightbox(idx)}
                >
                  <div className={`relative ${idx % 3 === 0 ? "aspect-[3/4]" : idx % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                      <p className="text-white/60 text-xs mt-1 capitalize">{img.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <div className="container mx-auto px-6 lg:px-12 py-12 md:py-20">
          {/* Playlist Selector */}
          <div className="flex gap-3 mb-10" data-animate>
            {playlists.map((pl, idx) => (
              <button
                key={pl.title}
                onClick={() => { setActivePlaylist(idx); setActiveVideo(0) }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activePlaylist === idx
                    ? "bg-amber-400 text-black"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {pl.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-animate>
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideo.id}?rel=0`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl md:text-2xl font-medium text-foreground mb-2">{currentVideo.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{currentVideo.description}</p>
              </div>
            </div>

            {/* Video List */}
            <div className="space-y-1">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground">{currentPlaylist.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{currentPlaylist.description}</p>
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
                {currentPlaylist.videos.map((video, idx) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(idx)}
                    className={`w-full flex gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                      activeVideo === idx
                        ? "bg-amber-400/10 ring-1 ring-amber-400/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {video.duration}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-2 ${activeVideo === idx ? "text-amber-600" : "text-foreground"}`}>
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Press Enquiries */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto" data-animate>
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6 tracking-tight">Press Enquiries</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              For media enquiries, interview requests, or press materials, please reach out to our communications team.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all underline underline-offset-4 decoration-1">
              Contact Us
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxModal
          images={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  )
}
