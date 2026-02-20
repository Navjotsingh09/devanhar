"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useDonation } from "@/components/donation-provider"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { openDonation } = useDonation()

  return (
    <header className="fixed top-4 left-4 right-4 z-50 rounded-2xl border border-foreground/[0.08] bg-background/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Devanhaar - Discover Sikhi"
              className="h-10 w-auto"
            />
          </a>

          <nav className="hidden lg:flex items-center gap-10">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="/#projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</a>
            <a href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</a>
            <a href="/#foundation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Foundation</a>
            <a href="/#media" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Media</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
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
        <div className="lg:hidden border-t border-foreground/[0.08] bg-background/50 backdrop-blur-xl">
          <nav className="px-6 py-6 flex flex-col gap-4">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>About</a>
            <a href="/#projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Projects</a>
            <a href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Team</a>
            <a href="/#foundation" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Foundation</a>
            <a href="/#media" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Media</a>
            <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsOpen(false)}>Contact Us</a>
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
