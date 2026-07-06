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
    image: "/images/initiatives-hero.jpg",
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

  const featuredProject = MEGA_MENU_PROJECTS[0]
  const compactProjects = MEGA_MENU_PROJECTS.slice(1)

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
            className="absolute top-full left-1/2 hidden w-[min(960px,calc(100vw-3rem))] -translate-x-1/2 pt-4 md:block"
            onMouseEnter={() => openDropdown("Projects")}
            onMouseLeave={closeDropdown}
          >
            <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <div className="grid grid-cols-12 gap-0">
                <Link
                  href={featuredProject.href}
                  onClick={() => setOpenMenu(null)}
                  className="group relative col-span-4 min-h-[320px] overflow-hidden border-r border-black/[0.06]"
                >
                  <Image
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="inline-flex rounded-full bg-white/14 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-sm">
                      Featured
                    </span>
                    <h3 className="mt-3 text-xl font-semibold leading-tight">{featuredProject.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {featuredProject.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 transition-colors group-hover:text-amber-200">
                      Explore project
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>

                <div className="col-span-8 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                        Devanhaar Projects
                      </p>
                      <h3 className="mt-1 text-base font-bold text-gray-900">Browse by initiative</h3>
                    </div>
                    <Link
                      href="/projects"
                      onClick={() => setOpenMenu(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      View all
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {compactProjects.map((project) => (
                      <Link
                        key={project.href}
                        href={project.href}
                        onClick={() => setOpenMenu(null)}
                        className="group flex items-center gap-3 rounded-2xl border border-black/[0.06] p-2.5 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/50"
                      >
                        <div className="relative h-16 w-20 flex-none overflow-hidden rounded-xl bg-gray-100">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-amber-700">
                              {project.title}
                            </h4>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              {project.tag}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                            {project.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        Coming Soon
                      </span>
                      {MEGA_MENU_COMING_SOON.map((project) => (
                        <Link
                          key={project.href}
                          href={project.href}
                          onClick={() => setOpenMenu(null)}
                          className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                        >
                          {project.title}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/projects"
                      onClick={() => setOpenMenu(null)}
                      className="hidden text-sm font-semibold text-gray-700 transition-colors hover:text-amber-700 lg:inline-flex lg:items-center lg:gap-1"
                    >
                      All 11 initiatives
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
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
