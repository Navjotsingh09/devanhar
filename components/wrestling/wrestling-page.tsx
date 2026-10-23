import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { wrestlingContent } from "@/lib/wrestling-content"
import "./wrestling-page.css"

export function WrestlingPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main className="wrestling-page">
        <section className="wrestling-hero" aria-labelledby="wrestling-title">
          <Image
            src="/wrestling/team-01.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="wrestling-hero-photo"
          />
          <div className="wrestling-hero-shade" />
          <div className="wrestling-container wrestling-hero-content">
            <p className="wrestling-eyebrow">Devanhaar presents</p>
            <Image src="/wrestling/logo.webp" alt="Devanhaar Wrestling" width={160} height={156} className="wrestling-logo" />
            <h1 id="wrestling-title">Devanhaar<br />Wrestling <span>Academy.</span></h1>
            <p className="wrestling-hero-description">
              {wrestlingContent.tagline}
            </p>
            <div className="wrestling-actions">
              <Link href="/contact" className="wrestling-button">
                Enquire About Classes <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#about-wrestling" className="wrestling-discover">
                Discover the academy <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <dl className="wrestling-container wrestling-hero-facts">
            <div><dt>Monday &amp; Wednesday</dt><dd>Weekly classes</dd></div>
            <div><dt>7:00pm – 8:30pm</dt><dd>Both evenings</dd></div>
            <div><dt>Primarily 15+</dt><dd>Beginners &amp; experienced wrestlers</dd></div>
            <div><dt>West Bromwich</dt><dd>Edward Street Gurdwara · B70 8NN</dd></div>
          </dl>
        </section>

        <nav className="wrestling-jumpnav" aria-label="Explore Wrestling Academy">
          <div className="wrestling-container">
            <a href="#about-wrestling">The academy</a>
            <a href="#wrestling-heritage">Our heritage</a>
            <a href="#classes">Classes &amp; timetable</a>
            <a href="#wrestling-media">Wrestlers in action</a>
            <Link href="/contact" className="wrestling-jump-cta">
              Enquire about classes <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <section id="about-wrestling" className="wrestling-section" aria-labelledby="wrestling-about-title">
          <div className="wrestling-container wrestling-story">
            <div>
              <p className="wrestling-eyebrow">Overview</p>
              <h2 id="wrestling-about-title">{wrestlingContent.tagline}</h2>
              <p className="wrestling-introduction">{wrestlingContent.introduction}</p>
              <Image src="/wrestling/banner.webp" alt="Devanhaar Wrestling Academy lion emblem in navy and gold" width={1600} height={710} className="wrestling-brand-banner" />
            </div>
            <div className="wrestling-story-copy">
              <p>{wrestlingContent.history}</p>
              <p>{wrestlingContent.overview}</p>
              <p>{wrestlingContent.organisation}</p>
              <a href="#wrestling-heritage" className="wrestling-text-link">
                Discover our heritage <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="wrestling-heritage" className="wrestling-section wrestling-heritage" aria-labelledby="wrestling-heritage-title">
          <div className="wrestling-container">
            <div className="wrestling-section-heading">
              <p className="wrestling-eyebrow">Our heritage</p>
              <h2 id="wrestling-heritage-title">A tradition of strength.<br />A foundation for the future.</h2>
            </div>
            <div className="wrestling-heritage-layout">
              <div className="wrestling-heritage-copy">
                {wrestlingContent.heritage.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                <p className="wrestling-heritage-closing">{wrestlingContent.heritageClosing}</p>
              </div>
              <Image src="/wrestling/heritage.webp" alt="Supplied artwork illustrating the Sikh wrestling tradition" width={768} height={1024} className="wrestling-heritage-art" />
            </div>
          </div>
        </section>

        <section id="classes" className="wrestling-section wrestling-classes" aria-labelledby="wrestling-classes-title">
          <div className="wrestling-container wrestling-class-layout">
            <div>
              <p className="wrestling-eyebrow">Train with us</p>
              <h2 id="wrestling-classes-title">Class Information<br />&amp; Timetable</h2>
              <p>
                Our aim is to create an accessible, supportive and challenging environment to develop wrestling
                ability, physical wellbeing and mental resilience.
              </p>
              <dl className="wrestling-class-details">
                <div><dt>Location</dt><dd>{wrestlingContent.location}</dd></div>
                <div><dt>Age range</dt><dd>{wrestlingContent.ageRange}</dd></div>
                <div><dt>Experience</dt><dd>{wrestlingContent.experience}</dd></div>
                <div><dt>What to bring</dt><dd>{wrestlingContent.whatToBring}</dd></div>
              </dl>
              <Link href="/contact" className="wrestling-button">
                Enquire About Classes <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="wrestling-class-sidebar">
            {wrestlingContent.sessions.length > 0 ? (
              <div className="wrestling-timetable" role="region" aria-label="Wrestling class timetable" tabIndex={0}>
                <table>
                  <caption className="sr-only">Wrestling class timetable</caption>
                  <thead>
                    <tr>{["Day", "Time", "Venue", "Group"].map(label => <th key={label} scope="col">{label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {wrestlingContent.sessions.map(session => (
                      <tr key={`${session.day}-${session.time}-${session.group}`}>
                        <td>{session.day}</td><td>{session.time}</td><td>{session.venue}</td><td>{session.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="wrestling-details-card">
                <p className="wrestling-eyebrow">Class details</p>
                <h3>Timetable to be confirmed</h3>
                <p>Class times and venue details will be shared here once confirmed.</p>
                <Link href="/contact" className="wrestling-text-link">
                  Contact the team about classes <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
              <div className="wrestling-details-card wrestling-membership">
                <p className="wrestling-eyebrow">Membership</p>
                <h3>Monthly or per session</h3>
                <dl>
                  {wrestlingContent.membership.map(option => (
                    <div key={option.group}>
                      <dt>{option.group}</dt>
                      <dd>{option.monthly} <span>or {option.session}</span></dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Image src="/wrestling/class-poster.webp" alt="Devanhaar Wrestling class poster: ages 15+, Monday and Wednesday, 19:00–20:30, Edward Street Gurdwara, B70 8NN" width={768} height={1024} className="wrestling-class-poster" />
            </div>
          </div>
        </section>

        <section id="wrestling-media" className="wrestling-section" aria-labelledby="wrestling-media-title">
          <div className="wrestling-container">
            <div className="wrestling-section-heading">
              <p className="wrestling-eyebrow">Life at the academy</p>
              <h2 id="wrestling-media-title">Our Wrestlers in Action</h2>
            </div>
            {wrestlingContent.media.length > 0 ? (
              <div className="wrestling-media-grid">
                {wrestlingContent.media.map(item => (
                  <figure key={item.src}>
                    {item.type === "video" ? (
                      <video src={item.src} aria-label={item.alt} controls preload="metadata" />
                    ) : (
                      <div className="wrestling-media-image">
                        <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
                      </div>
                    )}
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="wrestling-media-empty">
                <p>Photos and videos from the academy will be added here soon.</p>
                <p>Strength. Discipline. Sangat.</p>
              </div>
            )}
          </div>
        </section>

        <section className="wrestling-section wrestling-final-cta" aria-labelledby="wrestling-get-involved">
          <div className="wrestling-container">
            <div>
              <p className="wrestling-eyebrow">Get involved</p>
              <h2 id="wrestling-get-involved">Connect with Devanhaar<br />Wrestling Academy.</h2>
              <p>{wrestlingContent.tagline}</p>
            </div>
            <Link href="/contact" className="wrestling-button">
              Enquire About Classes <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  )
}
