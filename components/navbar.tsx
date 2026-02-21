"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useDonation } from "@/components/donation-provider"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { openDonation } = useDonation()

  return (
    <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-[1440px] px-4">
      <div className="rounded-2xl border border-foreground/[0.08] bg-background/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/main-black-transparent.png"
              alt="Devanhaar"
              width={120}
              height={40}
              className="h-10 w-auto"
              unoptimized
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/#projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <Link href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link>
            <Link href="/#foundation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Foundation</Link>
            <Link href="/#media" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Media</Link>
            <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
            <Button
              onClick={() => openDonation("navbar")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              Donate
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden border-t border-foreground/[0.08] bg-background/50 backdrop-blur-xl rounded-b-2xl">
          <nav className="px-6 py-6 flex flex-col gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/#projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Projects</Link>
            <Link href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Team</Link>
            <Link href="/#foundation" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Foundation</Link>
            <Link href="/#media" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Media</Link>
            <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Contact Us</Link>
            <Button
              onClick={() => {
                openDonation("navbar-mobile")
                setIsOpen(false)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full mt-2"
            >
              Donate
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
