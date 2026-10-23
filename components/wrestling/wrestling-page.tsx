import Link from "next/link"
import { InitiativePageLayout } from "@/components/initiative-page-layout"
import { wrestlingContent } from "@/lib/wrestling-content"

export function WrestlingPage() {
  return (
    <InitiativePageLayout
      title="Devanhaar Wrestling Academy"
      tagline="Freestyle wrestling rooted in our heritage. Strength, discipline and connection within the sangat."
      heroImage="/initiatives/self-defence-top.png"
      ctaText="Enquire About Classes"
      ctaHref="/contact"
      description={[
        wrestlingContent.introduction,
        wrestlingContent.overview,
        "The academy forms part of the wider Devanhaar organisation, which runs programmes focused on Sikhi, education, sport and community development.",
      ]}
      additionalSections={
        <>
          <section className="py-16 bg-[#f8f8f8]" aria-labelledby="wrestling-heritage">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 id="wrestling-heritage" className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Heritage</h2>
              <p className="max-w-3xl text-base md:text-lg text-muted-foreground leading-relaxed mb-10">Wrestling has deep roots in Sikh history. Physical strength, discipline and resilience have long been valued alongside spiritual development.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {wrestlingContent.heritage.map(item => (
                  <article key={item.name} className="bg-background rounded-xl p-6 border border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{item.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section id="classes" className="py-16 lg:py-24 scroll-mt-28" aria-labelledby="wrestling-classes">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-3xl">
                <h2 id="wrestling-classes" className="text-3xl md:text-4xl font-bold text-foreground mb-6">Class Information &amp; Timetable</h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">Our aim is to create an accessible, supportive and challenging environment to develop wrestling ability, physical wellbeing and mental resilience.</p>
                {wrestlingContent.sessions.length > 0 ? (
                  <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Wrestling class timetable</caption><thead><tr>{['Day','Time','Venue','Group'].map(label => <th key={label} scope="col" className="border-b p-3 font-semibold">{label}</th>)}</tr></thead><tbody>{wrestlingContent.sessions.map(session => <tr key={`${session.day}-${session.time}-${session.group}`}><td className="border-b p-3">{session.day}</td><td className="border-b p-3">{session.time}</td><td className="border-b p-3">{session.venue}</td><td className="border-b p-3">{session.group}</td></tr>)}</tbody></table></div>
                ) : <p className="text-muted-foreground leading-relaxed">Class times and venue details will be shared here once confirmed. <Link href="/contact" className="font-medium text-primary underline underline-offset-4">Contact the team about classes.</Link></p>}
              </div>
            </div>
          </section>
          <section className="py-16 bg-[#f8f8f8]" aria-labelledby="wrestling-media">
            <div className="container mx-auto px-6 lg:px-12">
              <h2 id="wrestling-media" className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Wrestlers in Action</h2>
              {wrestlingContent.media.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{wrestlingContent.media.map(item => <figure key={item.src}>{item.type === 'video' ? <video src={item.src} aria-label={item.alt} controls preload="metadata" className="w-full aspect-[4/3] rounded-xl object-cover"/> : <img src={item.src} alt={item.alt} loading="lazy" className="w-full aspect-[4/3] rounded-xl object-cover"/>}<figcaption className="mt-3 text-sm text-muted-foreground">{item.caption}</figcaption></figure>)}</div> : <p className="max-w-3xl text-muted-foreground leading-relaxed">Photos and videos from the academy will be added here soon.</p>}
            </div>
          </section>
        </>
      }
    />
  )
}
