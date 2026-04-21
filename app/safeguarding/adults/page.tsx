import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Safeguarding Adults at Risk Policy | Devanhaar",
  description:
    "Devanhaar Safeguarding Adults at Risk Policy (2025–2026), approved by the Board of Trustees.",
  alternates: { canonical: "https://devanhaar.vercel.app/safeguarding/adults" },
}

export default function SafeguardingAdultsPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Safeguarding</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Safeguarding Adults at Risk Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              2025–2026 · Version 3.0 (Expanded) · Approved by Trustees 20/03/2026
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            <h2>1. Purpose</h2>
            <p>
              Devanhaar is committed to safeguarding adults at risk and promoting their wellbeing,
              rights, dignity, and safety. This policy sets out how the Charity protects adults at
              risk from abuse, neglect, and exploitation, and how concerns are identified,
              reported, and responded to.
            </p>

            <h2>2. Legal, Regulatory and Local Framework</h2>
            <p>
              This policy is informed by the Care Act 2014, the Mental Capacity Act 2005,
              Deprivation of Liberty Safeguards, Making Safeguarding Personal (MSP), Charity
              Commission safeguarding guidance, and Birmingham Safeguarding Adults Board (BSAB)
              arrangements.
            </p>

            <h2>3. Scope</h2>
            <p>
              This policy applies to all employees, volunteers, sevadaars, trustees, contractors,
              and anyone acting on behalf of the Charity who comes into contact with adults at
              risk.
            </p>

            <h2>4. Safeguarding Principles (Making Safeguarding Personal)</h2>
            <p>
              Safeguarding adults is about protecting a person&apos;s right to live in safety, free
              from abuse and neglect. The Charity adopts the Making Safeguarding Personal
              approach, which places the adult at risk at the centre of safeguarding decisions and
              promotes proportional, person-led responses.
            </p>

            <h2>5. Definitions</h2>
            <p>
              An adult at risk is a person aged 18 or over who has care and support needs, is
              experiencing or at risk of abuse or neglect, and is unable to protect themselves
              because of those needs.
            </p>

            <h2>6. Roles, Accountability and Governance</h2>
            <p>
              The Charity has multiple trained Designated Safeguarding Leads (DSLs) for adults. Any
              DSL may receive, assess, and act upon safeguarding concerns. DSLs are accountable to
              the Board of Trustees and the Governance Officer for the effective implementation of
              safeguarding arrangements. A Safeguarding Trustee provides board-level oversight,
              assurance, and challenge.
            </p>

            <h2>7. DBS and Training Requirements</h2>
            <p>
              All Designated Safeguarding Leads must hold a current Enhanced Disclosure and
              Barring Service (DBS) check appropriate to their role. Enhanced DBS checks for DSLs
              must be renewed at least every three years, or sooner where required by changes in
              role or safeguarding risk assessment.
            </p>
            <p>
              All employees and volunteers must complete Level 2 safeguarding adults training
              before or immediately upon commencing duties. Training records are maintained and
              reviewed as part of governance oversight.
            </p>

            <h2>8. Types of Abuse and Neglect</h2>
            <p>
              Abuse may take many forms, including physical, sexual, psychological, financial,
              discriminatory abuse, neglect, organisational abuse, self-neglect, domestic abuse,
              and modern slavery.
            </p>

            <h2>9. Recognising and Reporting Concerns</h2>
            <p>
              Any concern relating to the safety or wellbeing of an adult at risk must be reported
              to a DSL without delay. Concerns may arise from disclosures, observations, changes in
              behaviour, or third-party information.
            </p>

            <h2>10. Responding to Safeguarding Concerns</h2>
            <p>
              DSLs will assess concerns in line with Making Safeguarding Personal principles,
              considering risk, consent, mental capacity, and the wishes of the adult at risk.
            </p>
            <p>
              Emergency services will be contacted only where there is an immediate risk of serious
              harm or where delay would place the adult at further risk. Wherever possible, advice
              will be sought from local safeguarding partners before escalation.
            </p>

            <h2>11. Mental Capacity and Consent</h2>
            <p>
              Mental capacity will be assessed in line with the Mental Capacity Act 2005. Where an
              adult has capacity, their consent will be sought before information is shared, unless
              there is an overriding public interest or safeguarding duty.
            </p>

            <h2>12. Residential Events and Camps</h2>
            <p>
              Where adults at risk attend residential events, retreats, or camps, a minimum
              supervision ratio of 15 adults to 1 adult supervisor will apply. Clear safeguarding
              cover, behaviour expectations, gender-sensitive arrangements, transport risk
              assessments, and escalation procedures will be in place.
            </p>

            <h2>13. Prevent and Radicalisation</h2>
            <p>
              The Charity recognises its responsibility under the Prevent duty to safeguard adults
              from radicalisation. Concerns relating to extremism will be managed proportionately
              and in line with local safeguarding guidance.
            </p>

            <h2>14. Recording, Information Sharing and Confidentiality</h2>
            <p>
              Safeguarding concerns and actions must be recorded accurately and stored securely in
              line with UK GDPR. Information will be shared on a need-to-know basis and in
              accordance with statutory guidance.
            </p>

            <h2>15. Safeguarding Flowchart (One-Page Summary)</h2>
            <ol>
              <li>Concern identified → Report to DSL</li>
              <li>DSL assesses risk, capacity, and consent</li>
              <li>Immediate serious risk → Emergency services (only if necessary)</li>
              <li>Non-immediate concern → Local authority safeguarding referral / advice</li>
              <li>Record actions → Inform Governance Officer and Safeguarding Trustee</li>
            </ol>

            <h2>16. Related Policies</h2>
            <p>
              This policy should be read alongside the Complaints Policy, Disciplinary Procedure,
              Grievance Procedure, DBS Framework, Equality, Diversity &amp; Inclusion Policy, and
              Staff Declaration.
            </p>

            <h2>17. Review and Approval</h2>
            <p>This policy is reviewed annually and approved by the Board of Trustees.</p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
