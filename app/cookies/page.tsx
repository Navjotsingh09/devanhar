import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Cookie Policy - Devanhaar",
  description: "Devanhaar Cookie Policy.",
}

type Block =
  | { t: "p"; c: string }
  | { t: "h3"; c: string }
  | { t: "ul"; c: string[] }
  | { t: "a"; label: string; href: string }
  | { t: "table"; caption: string; rows: string[][] }

const sections: { h: string; blocks: Block[] }[] = [
  {
    h: "1. What Are Cookies?",
    blocks: [
      { t: "p", c: "Cookies are small text files stored on your computer, smartphone, tablet, or other device when you visit a website." },
      { t: "p", c: "Cookies help websites function correctly, improve user experience, remember user preferences, enhance security, and provide information about how visitors use a website." },
      { t: "p", c: "Some cookies are essential for the operation of the website, while others help us analyse website performance and improve our services." },
    ],
  },
  {
    h: "2. Types of Cookies We Use",
    blocks: [
      { t: "h3", c: "Strictly Necessary Cookies" },
      { t: "p", c: "These cookies are essential for the operation, security, and functionality of our website. They cannot be disabled through our cookie preference centre." },
      { t: "p", c: "These cookies may be used to:" },
      { t: "ul", c: ["Maintain secure sessions", "Remember cookie consent preferences", "Enable website navigation", "Protect against security threats", "Support website administration"] },
      { t: "h3", c: "Analytics Cookies" },
      { t: "p", c: "Analytics cookies help us understand how visitors interact with our website by collecting anonymous information regarding:" },
      { t: "ul", c: ["Pages visited", "Time spent on pages", "User journeys", "Traffic sources", "Device and browser information", "Website performance"] },
      { t: "p", c: "Analytics cookies are only activated after user consent has been provided." },
      { t: "h3", c: "Functional Cookies" },
      { t: "p", c: "Functional cookies allow the website to remember user preferences and improve website functionality." },
      { t: "p", c: "These may include:" },
      { t: "ul", c: ["Language preferences", "Accessibility settings", "Form preferences", "User interface customisation"] },
      { t: "h3", c: "Marketing Cookies" },
      { t: "p", c: "Where applicable, marketing cookies may be used to measure campaign performance and improve communications." },
      { t: "p", c: "Marketing cookies are only activated after user consent has been provided." },
    ],
  },
  {
    h: "3. Cookie Audit Table",
    blocks: [
      { t: "p", c: "The following table provides details of the cookies that may be used on our website." },
      { t: "table", caption: "Strictly Necessary Cookies", rows: [["cookie_consent", "Devanhaar", "Stores cookie consent preferences", "12 months"], ["PHPSESSID", "Devanhaar", "Maintains user session functionality", "Session"], ["csrf_token", "Devanhaar", "Security and form protection", "Session"]] },
      { t: "table", caption: "Google Analytics Cookies", rows: [["_ga", "Google Analytics", "Distinguishes unique users", "2 years"], ["ga*", "Google Analytics", "Maintains session state and analytics reporting", "2 years"], ["_gid", "Google Analytics", "Distinguishes users", "24 hours"], ["_gat", "Google Analytics", "Throttles request rates", "1 minute"]] },
      { t: "table", caption: "Google Tag Manager Related Cookies", rows: [["gtm*", "Google Tag Manager", "Supports tag deployment and tracking configuration", "Varies"]] },
      { t: "table", caption: "Microsoft Clarity Cookies", rows: [["_clck", "Microsoft Clarity", "Persists user ID and preferences", "1 year"], ["_clsk", "Microsoft Clarity", "Connects multiple page views into a single session recording", "24 hours"], ["CLID", "Microsoft Clarity", "Identifies first-time visitor interactions", "1 year"], ["ANONCHK", "Microsoft", "Verifies whether data can be transferred anonymously", "10 minutes"], ["MUID", "Microsoft", "Identifies unique web browsers for analytics purposes", "1 year"]] },
      { t: "table", caption: "Functional Cookies", rows: [["language_preference", "Devanhaar", "Stores language preference", "12 months"], ["accessibility_settings", "Devanhaar", "Stores accessibility preferences", "12 months"]] },
      { t: "table", caption: "Marketing Cookies (If Enabled)", rows: [["_fbp", "Meta (Facebook)", "Tracks advertising performance and conversions", "90 days"], ["fr", "Meta (Facebook)", "Delivers and measures advertising", "90 days"], ["_gcl_au", "Google Ads", "Measures advertising effectiveness", "90 days"]] },
      { t: "p", c: "Note: The specific cookies used on this website may change as services are updated or new functionality is introduced." },
    ],
  },
  {
    h: "4. Analytics Providers",
    blocks: [
      { t: "h3", c: "Google Analytics" },
      { t: "p", c: "We use Google Analytics to understand how visitors interact with our website and to improve website performance and user experience." },
      { t: "p", c: "Google Analytics may collect information such as:" },
      { t: "ul", c: ["Website visits", "Pages viewed", "Time spent on pages", "Device information", "Browser information", "Approximate geographic location", "Referral sources"] },
      { t: "p", c: "Google Analytics does not provide us with information that directly identifies individual users." },
      { t: "h3", c: "Microsoft Clarity" },
      { t: "p", c: "We may use Microsoft Clarity to better understand user behaviour and website usability." },
      { t: "p", c: "Microsoft Clarity may collect information regarding:" },
      { t: "ul", c: ["Mouse movements", "Click behaviour", "Scroll activity", "Page interactions", "Session recordings", "Device information"] },
      { t: "p", c: "This information helps us improve website design, navigation, accessibility, and overall user experience." },
      { t: "h3", c: "Google Tag Manager" },
      { t: "p", c: "We use Google Tag Manager to manage website tags and scripts." },
      { t: "p", c: "Google Tag Manager itself does not typically collect personal information but may deploy analytics and marketing tags that do so, subject to user consent." },
    ],
  },
  {
    h: "5. Consent",
    blocks: [
      { t: "p", c: "When you first visit our website, you will be presented with a cookie banner allowing you to:" },
      { t: "ul", c: ["Accept all cookies", "Reject non-essential cookies", "Customise cookie preferences"] },
      { t: "p", c: "Non-essential cookies, including analytics and marketing cookies, will not be activated until consent has been provided." },
      { t: "p", c: "You may withdraw or update your consent at any time through our Cookie Preferences Centre." },
    ],
  },
  {
    h: "6. Managing Cookies",
    blocks: [
      { t: "p", c: "Most web browsers allow you to:" },
      { t: "ul", c: ["View stored cookies", "Delete cookies", "Block cookies", "Restrict third-party cookies"] },
      { t: "p", c: "You can manage cookies through your browser settings." },
      { t: "p", c: "Please note that disabling certain cookies may impact website functionality and user experience." },
    ],
  },
  {
    h: "7. Changes to This Cookie Policy",
    blocks: [
      { t: "p", c: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our website functionality." },
      { t: "p", c: "Any updates will be published on this page together with the revised \"Last Updated\" date." },
    ],
  },
  {
    h: "8. Contact Us",
    blocks: [
      { t: "p", c: "If you have any questions regarding this Cookie Policy or how cookies are used on our website, please contact us:" },
      { t: "a", label: "contact@devanhaar.com", href: "mailto:contact@devanhaar.com" },
    ],
  },
]

const tableHead = ["Cookie Name", "Provider", "Purpose", "Duration"]

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated 10 June 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
            <div className="space-y-14">
              {sections.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-1 rounded-full bg-primary shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">{s.h}</h2>
                  </div>
                  <div className="pl-4 space-y-4">
                    {s.blocks.map((b, j) => {
                      if (b.t === "p")
                        return (
                          <p key={j} className="text-muted-foreground leading-relaxed">
                            {b.c}
                          </p>
                        )
                      if (b.t === "h3")
                        return (
                          <h3 key={j} className="text-base font-semibold text-foreground pt-2">
                            {b.c}
                          </h3>
                        )
                      if (b.t === "a")
                        return (
                          <p key={j}>
                            <a href={b.href} className="text-primary font-medium hover:underline underline-offset-4">
                              {b.label}
                            </a>
                          </p>
                        )
                      if (b.t === "table")
                        return (
                          <div key={j} className="my-6">
                            <p className="text-sm font-semibold text-foreground mb-3">{b.caption}</p>
                            <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-primary/10">
                                    {tableHead.map((th, n) => (
                                      <th
                                        key={n}
                                        className="border-b border-border/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground"
                                      >
                                        {th}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {b.rows.map((row, r) => (
                                    <tr key={r} className="odd:bg-muted/20 hover:bg-muted/40 transition-colors">
                                      {row.map((cell, n) => (
                                        <td
                                          key={n}
                                          className={`border-b border-border/30 px-4 py-3 align-top text-muted-foreground${n === 0 ? " font-mono text-xs text-foreground" : ""}`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      return (
                        <ul key={j} className="space-y-1.5 pl-1">
                          {b.c.map((it, k) => (
                            <li key={k} className="flex items-start gap-2 text-muted-foreground">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
