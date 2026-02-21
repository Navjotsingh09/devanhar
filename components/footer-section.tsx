import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import { FooterDonateLink } from "@/components/footer-donate-link"
import { FooterContactForm } from "@/components/footer-contact-form"
import { NewsletterForm } from "@/components/newsletter-form"

export function FooterSection() {
  return (
    <>
      {/* Contact CTA */}
      <section id="contact" className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary mb-4">
                Get in touch
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Have a question or want to get involved?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-10">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-foreground">
                      +44 (0) 20 1234 5678
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
                      London, United Kingdom
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

      {/* Dark massive footer - like Agridex */}
      <footer className="bg-[#0d1120] pt-20 pb-10">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Top: newsletter + logo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pb-12 border-b border-white/[0.08]">
            <div>
              <img
                src="/logos/main-white-transparent.png"
                alt="Devanhaar - Discover Sikhi"
                className="h-10 w-auto mb-6"
              />
              <p className="text-sm text-white/40 leading-relaxed max-w-sm">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">
                Navigate
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "About", href: "/about" },
                  { label: "Projects", href: "/#projects" },
                  { label: "Team", href: "/#team" },
                  { label: "Foundation", href: "/#foundation" },
                  { label: "Shop", href: "/shop" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">
                Insights
              </h4>
              <ul className="space-y-3 text-sm">
                {["Education", "Community", "Leadership", "News"].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">
                Get Involved
              </h4>
              <ul className="space-y-3 text-sm">
                {["Volunteer", "Vacancies", "Contact"].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
                <li>
                  <FooterDonateLink />
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">
                Connect
              </h4>
              <ul className="space-y-3 text-sm">
                {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Giant text like Agridex "agridex international" */}
          <div className="mb-10">
            <p className="text-6xl md:text-8xl lg:text-[10rem] font-bold text-white/[0.03] leading-none tracking-tight select-none">
              devanhaar
            </p>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/30">
              © 2024 Devanhaar. A registered charity organisation. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-[11px] text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white/60 transition-colors">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
