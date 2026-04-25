import Image from "next/image"
import Link from "next/link"
import { FooterDonateLink } from "@/components/footer-donate-link"
import { NewsletterForm } from "@/components/newsletter-form"

export function SiteFooter() {
  const navColumns = [
    {
      title: "Navigate",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Our Projects", href: "/projects" },
        { label: "Media", href: "/media" },
        { label: "Shop", href: "/shop" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Projects",
      links: [
        { label: "Singhs Camps", href: "/initiatives/singhs-camp" },
        { label: "Kaurs Camps", href: "/initiatives/kaurs-camp" },
        { label: "Kids Camps", href: "/initiatives/kids-camps" },
        { label: "Sikhi Vidyala", href: "/initiatives/sikhi-vidyala" },
        { label: "Gurmat Academy", href: "/initiatives/gurmat-academy" },
        { label: "University Talks", href: "/initiatives/university-projects" },
      ],
    },
    {
      title: "Get Involved",
      links: [
        { label: "Donate", href: "/donate" },
        { label: "Volunteer", href: "/contact" },
        { label: "Our Team", href: "/team" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Instagram", href: "https://instagram.com/devanhaar", external: true },
        { label: "Twitter / X", href: "https://x.com/devanhaar", external: true },
        { label: "LinkedIn", href: "https://www.linkedin.com/company/devanhaar/?originalSubdomain=uk", external: true },
        { label: "YouTube", href: "https://youtube.com/@devanhaar", external: true },
      ],
    },
  ]

  return (
    <footer className="bg-[#0d1120] pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top: logo + newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pb-12 border-b border-white/[0.08]">
          <div>
            <Image
              src="/logos/main-white-transparent.png"
              alt="Devanhaar \u2014 UK Sikh Charity"
              width={160}
              height={40}
              unoptimized
              className="h-10 w-auto mb-6"
            />
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Rooted in Sikh values of seva, equality, and compassion \u2014
              empowering communities through education, camps, and grassroots
              projects across the UK and Europe.
            </p>
          </div>
          <div className="flex flex-col justify-end">
            <NewsletterForm />
          </div>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-12 border-b border-white/[0.08]">
          {navColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Donate CTA */}
        <div className="flex justify-center mb-16">
          <FooterDonateLink />
        </div>

        {/* Watermark */}
        <div
          className="text-center mb-12 select-none pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[clamp(3rem,12vw,8rem)] font-bold tracking-tight text-white/[0.03] leading-none">
            devanhaar
          </span>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-white/40">
            \u00a9 2024 Devanhaar. All rights reserved. UK Registered Charity.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-xs text-white/30">
              Site by{" "}
              <a
                href="https://5rv.digital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                5rv.digital
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
