import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Safeguarding & Security Statement - Devanhaar",
  description: "Devanhaar Safeguarding & Security Statement.",
}

type Block =
  | { t: "p"; c: string }
  | { t: "h3"; c: string }
  | { t: "ul"; c: string[] }
  | { t: "a"; label: string; href: string }

const sections: { h: string; blocks: Block[] }[] = [
  {
    h: "1. Our Commitment",
    blocks: [
      { t: "p", c: "Devanhaar is committed to creating and maintaining a safe, inclusive, respectful, and supportive environment for everyone who engages with our organisation." },
      { t: "p", c: "We recognise our responsibility to safeguard and promote the welfare of children, young people, and vulnerable adults who participate in our programmes, events, activities, services, and online platforms." },
      { t: "p", c: "We believe that every individual has the right to feel safe, valued, respected, and protected from harm, abuse, neglect, discrimination, exploitation, or inappropriate behaviour." },
    ],
  },
  {
    h: "2. Safeguarding Principles",
    blocks: [
      { t: "p", c: "Devanhaar is committed to:" },
      { t: "ul", c: ["Promoting the welfare and wellbeing of children, young people, and vulnerable adults.", "Providing a safe and welcoming environment for all participants.", "Preventing abuse, neglect, exploitation, bullying, harassment, and discrimination.", "Taking all safeguarding concerns seriously and responding appropriately.", "Encouraging a culture of openness, accountability, and respect.", "Ensuring concerns are reported, recorded, and managed responsibly.", "Working in accordance with applicable safeguarding legislation and best practice guidance."] },
    ],
  },
  {
    h: "3. Volunteer and Staff Responsibilities",
    blocks: [
      { t: "p", c: "All staff, volunteers, trustees, representatives, and individuals acting on behalf of Devanhaar are expected to:" },
      { t: "ul", c: ["Treat all individuals with dignity, fairness, and respect.", "Act in the best interests of children, young people, and vulnerable adults.", "Maintain appropriate professional boundaries at all times.", "Follow safeguarding procedures and organisational policies.", "Report safeguarding concerns immediately.", "Support a safe, inclusive, and positive environment for participants.", "Challenge and report inappropriate behaviour where necessary."] },
      { t: "p", c: "Failure to comply with safeguarding expectations may result in disciplinary action or termination of involvement with the organisation." },
    ],
  },
  {
    h: "4. Online Safety",
    blocks: [
      { t: "p", c: "We recognise the importance of safeguarding individuals in both physical and digital environments." },
      { t: "p", c: "We take reasonable steps to promote online safety through measures that may include:" },
      { t: "ul", c: ["Secure website hosting and infrastructure.", "Access controls and account protection measures.", "Encrypted communications where appropriate.", "Monitoring and moderation of online activities and discussions.", "Protection against unauthorised access to personal information.", "Appropriate management of digital content and communications."] },
      { t: "p", c: "Users engaging with our online platforms are expected to behave respectfully and responsibly at all times." },
    ],
  },
  {
    h: "5. Reporting Safeguarding Concerns",
    blocks: [
      { t: "p", c: "Any safeguarding concern involving a child, young person, or vulnerable adult should be reported as soon as possible." },
      { t: "p", c: "If you believe someone is at immediate risk of harm, contact the emergency services by calling 999." },
      { t: "p", c: "For safeguarding concerns relating to Devanhaar activities, events, programmes, volunteers, or representatives, please contact us immediately:" },
      { t: "a", label: "contact@devanhaar.com", href: "mailto:contact@devanhaar.com" },
      { t: "p", c: "All safeguarding concerns will be treated seriously, handled sensitively, and reviewed in accordance with our safeguarding procedures and legal obligations." },
    ],
  },
  {
    h: "6. Security and Data Protection",
    blocks: [
      { t: "p", c: "Devanhaar is committed to protecting personal information and maintaining appropriate security measures." },
      { t: "p", c: "We implement reasonable technical and organisational safeguards designed to protect information against:" },
      { t: "ul", c: ["Unauthorised access.", "Loss or theft.", "Alteration or destruction.", "Unauthorised disclosure.", "Misuse or unlawful processing."] },
      { t: "p", c: "Security controls are reviewed periodically to help ensure their continued effectiveness and appropriateness." },
      { t: "p", c: "For information about how we collect, use, and protect personal data, please refer to our Privacy Policy." },
    ],
  },
  {
    h: "7. Policy Review",
    blocks: [
      { t: "p", c: "This Safeguarding & Security Statement may be reviewed and updated periodically to reflect changes in legislation, organisational practices, or safeguarding requirements." },
      { t: "p", c: "The latest version will always be available on the Devanhaar website." },
    ],
  },
]

export default function SafeguardingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Safeguarding &amp; Security Statement</h1>
            <p className="text-sm text-muted-foreground">Last updated 10 June 2026</p>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            {sections.map((s, i) => (
              <div key={i}>
                <h2>{s.h}</h2>
                {s.blocks.map((b, j) => {
                  if (b.t === "p") return <p key={j}>{b.c}</p>
                  if (b.t === "h3") return <h3 key={j}>{b.c}</h3>
                  if (b.t === "a")
                    return (
                      <p key={j}>
                        <a href={b.href}>{b.label}</a>
                      </p>
                    )
                  return (
                    <ul key={j}>
                      {b.c.map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
