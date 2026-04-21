import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"

export const metadata: Metadata = {
  title: "Safeguarding Children & Young People Policy | Devanhaar",
  description:
    "Devanhaar Safeguarding Children & Young People Policy (2026–2027), approved by the Board of Trustees.",
  alternates: { canonical: "https://devanhaar.vercel.app/safeguarding/children" },
}

export default function SafeguardingChildrenPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Safeguarding</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Safeguarding Children &amp; Young People Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              2026–2027 · Version 3.4 (Expanded) · Approved by Trustees 20/03/2026
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl prose prose-gray dark:prose-invert">
            <h2>1. Purpose</h2>
            <p>
              Devanhaar is committed to safeguarding and promoting the welfare of all children and
              young people. Safeguarding means protecting children from maltreatment, preventing
              impairment of health or development, ensuring children grow up in circumstances
              consistent with safe and effective care, and taking action to enable all children to
              have the best outcomes.
            </p>

            <h2>2. Legal, Regulatory and Local Framework</h2>
            <p>
              This policy is informed by the Children Act 1989 and 2004, Working Together to
              Safeguard Children, Keeping Children Safe in Education (as relevant to delivery
              partners), Charity Commission safeguarding guidance, and Birmingham Safeguarding
              Children Partnership (BSCP) arrangements, including Right Help Right Time.
            </p>

            <h2>3. Scope</h2>
            <p>
              This policy applies to all employees, volunteers, sevadaars, trustees, contractors,
              and anyone acting on behalf of the Charity who comes into contact with children or
              young people.
            </p>

            <h2>4. Safeguarding Principles</h2>
            <p>
              The welfare of the child is paramount. All children have the right to be protected
              from physical abuse, emotional abuse, sexual abuse, neglect, exploitation,
              peer-on-peer abuse, and online harm. Safeguarding is everyone&apos;s responsibility.
            </p>

            <h2>5. Roles, Accountability and Governance</h2>
            <p>
              The Charity has multiple trained Designated Safeguarding Leads (DSLs). Any DSL may
              receive, assess, and act upon safeguarding concerns. DSLs are accountable to the
              Board of Trustees and the Governance Officer for the effective implementation of
              safeguarding arrangements. A Safeguarding Trustee provides oversight, assurance, and
              challenge at board level.
            </p>

            <h2>6. Training and Awareness</h2>
            <p>
              All employees and volunteers must complete Level 2 safeguarding training. Training
              covers recognising abuse, responding to disclosures, recording concerns, and
              understanding local safeguarding pathways. Designated Safeguarding Leads receive
              enhanced training appropriate to their role and responsibilities.
            </p>

            <h2>7. Recognising Abuse and Neglect</h2>
            <p>
              Indicators of abuse may include unexplained injuries, changes in behaviour,
              fearfulness, withdrawal, inappropriate sexual behaviour, neglect of basic needs, or
              online risks. Staff and volunteers must remain vigilant and report concerns promptly.
            </p>

            <h2>8. Responding to Safeguarding Concerns</h2>
            <p>
              Any safeguarding concern must be reported to a DSL without delay. DSLs will consider
              the concern in line with Right Help Right Time thresholds and determine the most
              appropriate response, which may include advice, early help, or referral to statutory
              services.
            </p>
            <p>
              Emergency services will be contacted only where there is an immediate risk of serious
              harm to a child or where delay would place the child at further risk. Wherever
              possible and appropriate, DSLs will seek guidance from local safeguarding partners
              before escalating.
            </p>

            <h2>9. Working with Parents and Carers</h2>
            <p>
              The Charity recognises the importance of working in partnership with parents and
              carers. Concerns will be shared openly where it is safe and appropriate to do so,
              unless doing so would place a child at further risk.
            </p>

            <h2>10. Allegations Against Staff or Volunteers</h2>
            <p>
              Any allegation that a staff member or volunteer has harmed a child or may pose a risk
              must be reported immediately to a DSL and referred to the Local Authority Designated
              Officer (LADO). Such matters will be managed in line with safeguarding and
              disciplinary procedures.
            </p>

            <h2>11. Residential Camps and Events</h2>
            <p>
              Residential camps and events will operate with a minimum supervision ratio of 10
              children to 1 adult. Each camp will have named DSL cover at all times, clear
              behaviour codes, gender-sensitive supervision, safe sleeping arrangements, transport
              risk assessments, and clear escalation procedures.
            </p>

            <h2>12. Online and Remote Safeguarding</h2>
            <p>
              Safeguarding responsibilities apply equally to online and remote interactions. Clear
              professional boundaries must be maintained when using digital platforms, messaging
              services, or social media. Online concerns must be reported and recorded in the same
              way as face-to-face concerns.
            </p>

            <h2>13. Recording, Information Sharing and Confidentiality</h2>
            <p>
              Safeguarding records must be factual, timely, and stored securely in accordance with
              UK GDPR. Information will be shared on a need-to-know basis and in line with
              statutory guidance.
            </p>

            <h2>14. Safeguarding Flowchart (One-Page Summary)</h2>
            <ol>
              <li>Concern identified → Report to DSL</li>
              <li>DSL assesses using Right Help Right Time</li>
              <li>Immediate serious risk → Emergency services (only if necessary)</li>
              <li>Non-immediate concern → Advice, early help, or referral as appropriate</li>
              <li>Record actions → Inform Governance Officer and Safeguarding Trustee</li>
            </ol>

            <h2>15. Review and Approval</h2>
            <p>This policy is reviewed annually and approved by the Board of Trustees.</p>

            <h2>DBS Requirements for Safeguarding Leads</h2>
            <p>
              All Designated Safeguarding Leads (DSLs) must hold a current Enhanced Disclosure and
              Barring Service (DBS) check appropriate to their role. Enhanced DBS checks for DSLs
              must be renewed at least every three years, or sooner where required due to changes
              in role, statutory guidance, or safeguarding risk assessment. DBS compliance is
              monitored as part of the Charity&apos;s safer recruitment, safeguarding, and governance
              arrangements.
            </p>

            <h2>Right Help Right Time (Birmingham Threshold Guidance)</h2>
            <p>
              Devanhaar continues to operate in line with Birmingham&apos;s Right Help Right Time
              (RHRT) framework, which remains the current threshold guidance used by Birmingham
              Safeguarding Children Partnership (BSCP).
            </p>
            <p>
              Right Help Right Time supports proportionate, timely responses to safeguarding
              concerns and helps ensure children, young people, and families receive the
              appropriate level of support at the right time.
            </p>
            <p>The four levels of Right Help Right Time are:</p>
            <ul>
              <li><strong>Universal</strong> – Children whose needs are met through universal services.</li>
              <li><strong>Additional</strong> – Children who may require additional support to prevent escalation.</li>
              <li><strong>Complex</strong> – Children who require coordinated multi-agency support.</li>
              <li><strong>Significant Harm</strong> – Children who are at risk of or experiencing significant harm and require statutory intervention.</li>
            </ul>
            <p>
              Designated Safeguarding Leads (DSLs) use Right Help Right Time to inform
              decision-making, determine appropriate actions, and decide whether concerns should be
              managed internally, supported through early help, or referred to Birmingham
              Children&apos;s Trust via the Children&apos;s Advice and Support Service (CASS).
            </p>
            <p>
              Use of Right Help Right Time ensures safeguarding responses are child-centred,
              proportionate, and consistent with local authority expectations.
            </p>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
