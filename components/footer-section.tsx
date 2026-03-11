import { Button } from "@/components/ui/button"
import { Mail, MapPin } from "lucide-react"
import { FooterDonateLink } from "@/components/footer-donate-link"
import { FooterContactForm } from "@/components/footer-contact-form"
import { NewsletterForm } from "@/components/newsletter-form"
import Image from "next/image"
import Link from "next/link"

export function FooterSection({ hideContact = false }: { hideContact?: boolean }) {
  return (
    <>
      {!hideContact && <>
      {/* Contact CTA */}
      <section id="contact" className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div data-animate className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[hsl(43,100%,29%)] mb-4">
                Get in touch
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Have a question or want to get involved?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-10">
                Whether you want to volunteer at our camps, attend a university
                talk, or learn more about Sikhi Vidyala — we would love to hear from you.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">
                      info@devanhaar.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      Birmingham, United Kingdom
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <FooterContactForm />
          </div>
        </div>
      </section>

      </>}
      {/* Dark massive footer - like Agridex */}
      <footer className="bg-[#0d1120] pt-20 pb-10">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Top: newsletter + logo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pb-12 border-b border-white/[0.08]">
            <div>
              <Image
                src="/logos/main-white-transparent.png"
                alt="Devanhaar"
                width={160}
                height={40}
                unoptimized
                className="h-10 w-auto mb-6"
              />
              <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                Creating, developing, and empowering individuals through Sikh
                values and community-led initiatives across the UK, Europe, and
                beyond.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <NewsletterForm />
            </div>
          </div>

          {/* Middle: navigation columns */}
          <div data-animate-stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-5">
                Navigate
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "About", href: "/about" },
                  { label: "Initiatives", href: "/projects" },
                  { label: "Team", href: "/team" },
                  { label: "Events", href: "/events" },
                  { label: "Shop", href: "/shop" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-5">
                Initiatives
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Camps", href: "/#projects" },
                  { label: "University Talks", href: "/#projects" },
                  { label: "Sikhi Vidyala", href: "/#projects" },
                  { label: "Gurmat Academy", href: "/#projects" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-5">
                Get Involved
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/#contact" className="text-white/50 hover:text-white transition-colors">
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <FooterDonateLink />
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-5">
                Connect
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://www.instagram.com/devanhaar" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@singhscampuk" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/devanhaar/?originalSubdomain=uk" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Giant text like Agridex "agridex international" */}
          <div className="mb-10">
            <p aria-hidden="true" className="text-6xl md:text-8xl lg:text-[10rem] font-bold text-white/[0.03] leading-none tracking-tight select-none">
              devanhaar
            </p>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/60">
              © 2025 Devanhaar. A registered charity organisation. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-[11px] text-white/60">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
