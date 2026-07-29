import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"

export const metadata: Metadata = {
  title: "Terms of Service - Devanhaar",
  description: "Terms of Service for Devanhaar.",
}

type Block =
  | { t: "p"; c: string }
  | { t: "h3"; c: string }
  | { t: "ul"; c: string[] }
  | { t: "a"; label: string; href: string }

const sections: { h: string; blocks: Block[] }[] = [
  {
    h: "1. Acceptance of Terms",
    blocks: [
      { t: "p", c: "By accessing or using the Devanhaar website, you agree to comply with these Terms of Service." },
      { t: "p", c: "If you do not agree with these Terms, please do not use this website." },
    ],
  },
  {
    h: "2. About Devanhaar",
    blocks: [
      { t: "p", c: "Devanhaar is a community-focused organisation committed to supporting, educating, and empowering individuals through programmes, events, educational initiatives, community engagement, and related activities." },
    ],
  },
  {
    h: "3. Website Use",
    blocks: [
      { t: "p", c: "You agree to use this website lawfully and responsibly." },
      { t: "p", c: "You must not:" },
      { t: "ul", c: ["Attempt unauthorised access to any systems, servers, or databases connected to this website.", "Upload, transmit, or distribute malicious software, viruses, or harmful code.", "Misrepresent your identity or affiliation with any person or organisation.", "Use this website or its content for unlawful purposes.", "Interfere with the security, functionality, or operation of the website."] },
      { t: "p", c: "We reserve the right to restrict or terminate access to users who breach these Terms." },
    ],
  },
  {
    h: "4. Intellectual Property",
    blocks: [
      { t: "p", c: "All content, branding, logos, graphics, videos, publications, educational materials, documents, and website content are owned by or licensed to Devanhaar unless otherwise stated." },
      { t: "p", c: "You may access and view content for personal, educational, or non-commercial purposes only." },
      { t: "p", c: "You may not reproduce, modify, distribute, publish, or commercially exploit any content without prior written permission from Devanhaar." },
    ],
  },
  {
    h: "5. Events and Programmes",
    blocks: [
      { t: "p", c: "Participation in Devanhaar events, camps, workshops, educational programmes, volunteer activities, and community initiatives may be subject to additional registration requirements, safeguarding procedures, parental consent requirements, health and safety rules, and participant guidelines." },
      { t: "p", c: "We reserve the right to:" },
      { t: "ul", c: ["Refuse registrations where appropriate.", "Remove attendees whose behaviour is unsafe, disruptive, abusive, or inappropriate.", "Amend schedules, locations, speakers, activities, or programme content where reasonably necessary.", "Cancel or postpone events due to circumstances beyond our reasonable control."] },
      { t: "p", c: "Participants, parents, guardians, volunteers, and attendees are expected to comply with all applicable safeguarding, health and safety, and conduct requirements communicated by Devanhaar." },
      { t: "p", c: "Nothing in these Terms limits or excludes any safeguarding, health and safety, or legal responsibilities owed by Devanhaar under applicable law." },
      { t: "h3", c: "5.1 Camp Participation and Behaviour Expectations" },
      { t: "p", c: "Devanhaar is committed to providing a safe, respectful, and inclusive environment for all participants attending our camps, educational programmes, workshops, and community events." },
      { t: "p", c: "All participants are expected to:" },
      { t: "ul", c: ["Treat fellow participants, staff, volunteers, and visitors with respect.", "Follow programme rules and health and safety instructions.", "Respect facilities, equipment, and accommodation.", "Behave responsibly and contribute positively to the learning environment.", "Follow the reasonable instructions of authorised Devanhaar staff at all times."] },
      { t: "p", c: "Zero-Tolerance Behaviour Policy" },
      { t: "p", c: "Devanhaar operates a zero-tolerance policy towards behaviour that may compromise the safety or wellbeing of others. This includes, but is not limited to:" },
      { t: "ul", c: ["Bullying or intimidation", "Harassment or discrimination", "Physical or verbal abuse", "Threatening or aggressive behaviour", "Damage to property", "Possession or use of prohibited substances or dangerous items"] },
      { t: "p", c: "Where behaviour is considered unsafe or seriously disruptive, Devanhaar reserves the right to remove a participant from the programme or event. Parents or legal guardians may be required to arrange immediate collection where appropriate." },
      { t: "h3", c: "5.2 Emergency Medical Treatment" },
      { t: "p", c: "The health and wellbeing of participants is a priority for Devanhaar." },
      { t: "p", c: "Where a participant requires urgent medical attention during a programme or event and a parent or legal guardian cannot be contacted within a reasonable period, Devanhaar may arrange appropriate emergency medical assessment or treatment where it is reasonably believed to be in the participant's best interests." },
      { t: "p", c: "This may include contacting emergency services, arranging transport to a medical facility, administering appropriate first aid, and sharing relevant medical information with healthcare professionals where necessary." },
      { t: "p", c: "Devanhaar will make every reasonable effort to contact the participant's parent or legal guardian as soon as practicable." },
      { t: "h3", c: "5.3 Bookings, Payments and Cancellations" },
      { t: "p", c: "Bookings for camps, educational programmes, workshops, and events are subject to availability and any applicable registration requirements." },
      { t: "p", c: "Payment schedules, deposit requirements, cancellation terms, transfer arrangements, and refund eligibility may vary depending on the programme or event." },
      { t: "p", c: "The applicable booking conditions and payment information will be provided during the booking process or within the relevant programme information." },
      { t: "p", c: "Where programme-specific booking terms apply, those terms will take precedence over these general Terms of Service." },
      { t: "p", c: "Note: payment timelines, deposit requirements, and refund structures are determined by Devanhaar management and will be communicated at the time of booking." },
      { t: "h3", c: "5.4 Consumer Cancellation Rights" },
      { t: "p", c: "Where a booking is made online and qualifies as a distance contract under the Consumer Contracts Regulations 2013, customers may have a statutory right to cancel within the applicable 14-day cooling-off period, unless an exception applies under law." },
      { t: "p", c: "Cancellation requests can be submitted using our Statutory Cancellation Form, available on the website." },
    ],
  },
  {
    h: "6. User Conduct",
    blocks: [
      { t: "p", c: "Users, participants, volunteers, and attendees must behave respectfully towards:" },
      { t: "ul", c: ["Volunteers", "Staff", "Participants", "Community members", "Partner organisations"] },
      { t: "p", c: "The following conduct is prohibited:" },
      { t: "ul", c: ["Harassment", "Bullying", "Discrimination", "Hate speech", "Threatening behaviour", "Abuse of any kind", "Behaviour that places others at risk"] },
      { t: "p", c: "Devanhaar reserves the right to remove individuals from activities, programmes, or online platforms where such behaviour occurs." },
    ],
  },
  {
    h: "7. External Links",
    blocks: [
      { t: "p", c: "This website may contain links to third-party websites, resources, or services. These links are provided for convenience only." },
      { t: "p", c: "Devanhaar does not control and is not responsible for the content, availability, security, or privacy practices of third-party websites." },
      { t: "p", c: "Accessing third-party websites is done at your own risk." },
    ],
  },
  {
    h: "8. Disclaimer",
    blocks: [
      { t: "p", c: "The information published on this website is provided for general information and educational purposes only." },
      { t: "p", c: "While we make reasonable efforts to ensure the accuracy and currency of information, we do not guarantee that all content will always be complete, accurate, or up to date." },
      { t: "p", c: "Website content should not be relied upon as professional, legal, medical, financial, or safeguarding advice." },
    ],
  },
  {
    h: "9. Limitation of Liability",
    blocks: [
      { t: "p", c: "To the fullest extent permitted by law, Devanhaar shall not be liable for any indirect, consequential, incidental, or special losses arising from the use of this website, including reliance on website content, temporary unavailability of the website, or technical issues beyond our reasonable control." },
      { t: "p", c: "Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any liability that cannot legally be excluded or limited under the laws of England and Wales." },
      { t: "p", c: "For the avoidance of doubt, this limitation of liability applies only to the use of this website and does not affect any legal duties, safeguarding obligations, health and safety responsibilities, or other liabilities arising from Devanhaar's activities, events, programmes, camps, or services where such liability cannot lawfully be excluded." },
    ],
  },
  {
    h: "10. Privacy and Data Protection",
    blocks: [
      { t: "p", c: "Your use of this website is also governed by our Privacy Policy and Cookie Policy, which explain how we collect, process, store, and protect personal information." },
    ],
  },
  {
    h: "11. Changes to These Terms",
    blocks: [
      { t: "p", c: "Devanhaar may update these Terms of Service from time to time." },
      { t: "p", c: "Any changes will become effective upon publication on this page." },
      { t: "p", c: "Continued use of the website following publication of updated Terms constitutes acceptance of those changes." },
    ],
  },
  {
    h: "12. Governing Law",
    blocks: [
      { t: "p", c: "These Terms shall be governed by and interpreted in accordance with the laws of England and Wales." },
      { t: "p", c: "Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales." },
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="min-h-screen mt-20">
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated 10 June 2026</p>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            {sections.map((s, i) => (
              <div key={i} className={i > 0 ? "mt-12 pt-12 border-t border-border" : ""}>
                <h2 className="text-xl font-bold text-foreground mb-6">{s.h}</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-h3:text-foreground prose-h3:font-semibold prose-a:text-primary">
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
              </div>
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
