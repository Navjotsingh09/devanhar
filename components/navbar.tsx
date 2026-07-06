"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Menu, X, ShoppingBag, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { DonateButton } from "@/components/donate-button"
import { useCart } from "@/components/cart-provider"

type NavLink = {
  label: string
  href: string
  children?: { label: string; href: string; description?: string }[]
}

const MEGA_MENU_PROJECTS = [
  {
    title: "Singhs Camps",
    description: "Immersive residential camp for young Sikh men — brotherhood, Gurmat and physical discipline.",
    image: "/initiatives/singhs-camp-top.jpg",
    href: "/initiatives/singhs-camp",
    tag: "Flagship",
  },
  {
    title: "Kaurs Camps",
    description: "A dedicated space for young Sikh women to explore identity and deepen their connection to Sikhi.",
    image: "/initiatives/kaurs-camp-top.jpg",
    href: "/initiatives/kaurs-camp",
    tag: "Community",
  },
  {
    title: "Kids Camps",
    description: "Fun, engaging camps for younger Sikhs — heritage, storytelling and age-appropriate Gurmat.",
    image: "/initiatives/kids-camps-top.jpg",
    href: "/initiatives/kids-camps",
    tag: "Youth",
  },
  {
    title: "Roots Residential",
    description: "Five-day outdoor adventure for ages 12–16 — leadership, Sikh values and unforgettable memories.",
    image: "/initiatives/roots-top.jpg",
    href: "/initiatives/roots-residential",
    tag: "Youth",
  },
  {
    title: "Sikh Family Retreat",
    description: "Families united through Gurbani, Sikh history, seva and time in sangat.",
    image: "/initiatives/sikh-family-retreat-top.png",
    href: "/initiatives/sikh-family-retreat",
    tag: "Family",
  },
  {
    title: "Sikhi Vidyala",
    description: "Structured classes in Gurbani, Sikh history, Gurmukhi and Sikh philosophy for all ages.",
    image: "/initiatives/sikhi-vidyala-top.jpg",
    href: "/initiatives/sikhi-vidyala",
    tag: "Education",
  },
  {
    title: "Sikh Padel Association",
    description: "Community through padel — team tournaments, friendly competition and a live leaderboard.",
    image: "/initiatives/sikh-padel-association-top.jpg",
    href: "/initiatives/sikh-padel-association",
    tag: "Sports",
  },
]

const MEGA_MENU_COMING_SOON = [
  { title: "University Projects", href: "/initiatives/university-projects" },
  { title: "Gurmat Academy", href: "/initiatives/gurmat-academy" },
  { title: "Self Defence Academy", href: "/initiatives/self-defence-academy" },
  { title: "Sikh Professional Network", href: "/initiatives/sikh-professional-network" },
]

const navLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  {
    label: "Team",
    href: "/team",
    children: [
      { label: "Career", href: "/careers", description: "Open vacancies and volunteer roles" },
    ],
  },
  { label: "Events", href: "/events" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/"
  const { itemCount } = useCart()
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openDropdown = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setOpenMenu(label)
  }
  const closeDropdown = () => {
    closeTimerRef.current = setTimeout(() => setOpenMenu(null), 120)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isTransparent = isHome && !scrolled && !mobileOpen
  const bgClass = isTransparent
    ? "bg-gradient-to-b from-black/50 to-transparent"
    : "bg-white/95 backdrop-blur-md shadow-sm border-b border-black/[0.06]"
  const textClass = isTransparent ? "text-white" : "text-gray-800"
  const textMutedClass = isTransparent
    ? "text-white/70 hover:text-white"
    : "text-gray-600 hover:text-gray-900"
  const logoSrc = isTransparent
    ? "/logos/main-white-transparent.png"
    : "/logos/main-black-transparent.png"

  const isActive = (link: NavLink) =>
    pathname === link.href || (link.children?.some((c) => pathname === c.href) ?? false)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src={logoSrc}
                alt="Devanhaar"
                width={140}
                height={36}
                className="h-8 md:h-9 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link)
                const baseClasses = `px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  active
                    ? isTransparent
                      ? "text-white bg-white/15"
                      : "text-gray-900 bg-gray-100"
                    : textMutedClass
                }`

                if (link.children?.length) {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(link.label)}
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <Link
                        href={link.href}
                        className={`${baseClasses} inline-flex items-center gap-1`}
                        aria-haspopup="menu"
                        aria-expanded={openMenu === link.label}
                      >
                        {link.label}
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </Link>
                      {openMenu === link.label && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-64">
                          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-lg overflow-hidden">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`block px-4 py-3 transition-colors ${
                                  pathname === child.href
                                    ? "bg-gray-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="text-sm font-semibold text-gray-900">
                                  {child.label}
                                </div>
                                {child.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {child.description}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                if (link.label === "Projects") {
                  return (
                    <div
                      key="Projects"
                      onMouseEnter={() => openDropdown("Projects")}
                      onMouseLeave={closeDropdown}
                    >
                      <Link
                        href={link.href}
                        className={`${baseClasses} inline-flex items-center gap-1`}
                      >
                        {link.label}
                        <ChevronDown
                          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                            openMenu === "Projects" ? "rotate-180" : ""
                          }`}
                        />
                      </Link>
                    </div>
                  )
                }

                return (
                  <Link key={link.href} href={link.href} className={baseClasses}>
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => router.push("/shop")}
                className={`relative p-2 rounded-full transition-colors ${
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="Go to shop"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
              <DonateButton
                source="navbar"
                className={`rounded-full px-6 py-2 text-sm font-semibold ${
                  isTransparent
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              />
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${textClass}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {openMenu === "Projects" && (
          <div
            className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl hidden md:block"
            onMouseEnter={() => openDropdown("Projects")}
            onMouseLeave={closeDropdown}
          >
            <div className="container mx-auto px-6 lg:px-12 py-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-0.5">
                    Devanhaar
                  </p>
                  <h3 className="text-base font-bold text-gray-900">Our Initiatives</h3>
                </div>
                <Link
                  href="/projects"
                  onClick={() => setOpenMenu(null)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  View all projects
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {MEGA_MENU_PROJECTS.map((project) => (
                  <Link
                    key={project.href}
                    href={project.href}
                    onClick={() => setOpenMenu(null)}
                    className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                        {project.tag}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors leading-tight">
                        {project.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/projects"
                  onClick={() => setOpenMenu(null)}
                  className="group block rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">See All Projects</h4>
                    <p className="text-xs text-amber-700/80">11 initiatives and growing</p>
                  </div>
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                  Coming Soon
                </span>
                {MEGA_MENU_COMING_SOON.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setOpenMenu(null)}
                    className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                if (link.label === "Projects") {
                  const expanded = mobileExpanded === "Projects"
                  return (
                    <div key="Projects">
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : "Projects")}
                        className={`w-full px-4 py-3 text-lg font-medium rounded-xl transition-colors flex items-center justify-between ${
                          pathname.startsWith("/initiatives") || pathname === "/projects"
                            ? "text-gray-900 bg-gray-100"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Projects
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expanded && (
                        <div className="ml-3 mt-1 mb-2 flex flex-col gap-1 border-l border-gray-200 pl-3">
                          {MEGA_MENU_PROJECTS.map((project) => (
                            <Link
                              key={project.href}
                              href={project.href}
                              onClick={() => setMobileOpen(false)}
                              className={`px-4 py-2.5 text-base font-medium rounded-lg transition-colors ${
                                pathname === project.href
                                  ? "text-gray-900 bg-gray-100"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              {project.title}
                            </Link>
                          ))}
                          {MEGA_MENU_COMING_SOON.map((project) => (
                            <Link
                              key={project.href}
                              href={project.href}
                              onClick={() => setMobileOpen(false)}
                              className="px-4 py-2.5 text-base font-medium rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                            >
                              {project.title}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                Soon
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/projects"
                            onClick={() => setMobileOpen(false)}
                            className="px-4 py-2.5 text-sm font-semibold rounded-lg text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1"
                          >
                            See all projects <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                }

                if (link.children?.length) {
                  const expanded = mobileExpanded === link.label
                  return (
                    <div key={link.label}>
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : link.label)}
                        className={`w-full px-4 py-3 text-lg font-medium rounded-xl transition-colors flex items-center justify-between ${
                          isActive(link)
                            ? "text-gray-900 bg-gray-100"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {link.label}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expanded && (
                        <div className="ml-3 mt-1 mb-2 flex flex-col gap-1 border-l border-gray-200 pl-3">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`px-4 py-2.5 text-base font-medium rounded-lg transition-colors ${
                                pathname === child.href
                                  ? "text-gray-900 bg-gray-100"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 text-lg font-medium rounded-xl transition-colors ${
                      pathname === link.href
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  router.push("/shop")
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
              >
                <ShoppingBag className="w-5 h-5" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </button>
              <DonateButton
                source="navbar-mobile"
                className="w-full rounded-full px-6 py-3 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
