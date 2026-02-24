"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { DonateButton } from "@/components/donate-button"

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Foundation", href: "/foundation" },
  { label: "Media", href: "/media" },
  { label: "Shop", href: "/shop" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isTransparent = isHome && !scrolled && !mobileOpen
  const bgClass = isTransparent
    ? "bg-transparent"
    : "bg-white/95 backdrop-blur-md shadow-sm border-b border-black/[0.06]"
  const textClass = isTransparent ? "text-white" : "text-gray-800"
  const textMutedClass = isTransparent
    ? "text-white/70 hover:text-white"
    : "text-gray-600 hover:text-gray-900"
  const logoSrc = isTransparent
    ? "/logos/main-white-transparent.png"
    : "/logos/main-black-transparent.png"

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
                unoptimized
                className="h-8 md:h-9 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    pathname === link.href
                      ? isTransparent
                        ? "text-white bg-white/15"
                        : "text-gray-900 bg-gray-100"
                      : textMutedClass
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
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
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
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
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
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
