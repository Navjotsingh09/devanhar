import Link from 'next/link'
import {ArrowDown, ArrowUpRight, MoveUpRight} from 'lucide-react'
import {Navbar} from '@/components/navbar'
import {FooterSection} from '@/components/footer-section'
import {wrestlingContent as content} from '@/lib/wrestling-content'
import styles from './wrestling.module.css'

export function WrestlingPage(){
 return <div className={styles.page}>
  <a href="#wrestling-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-4">Skip to Wrestling Academy</a>
  <Navbar/>
  <main id="wrestling-main">
   <section className={styles.hero} aria-labelledby="wrestling-title">
    <div className={styles.heroInner}>
     <div className={styles.heroCopy}>
      <p className={styles.eyebrow}><span/> Devanhaar · Wrestling Academy</p>
      <h1 id="wrestling-title">Strength<br/>in our <em>roots.</em></h1>
      <p className={styles.heroIntro}>{content.introduction}</p>
      <div className={styles.actions}>
       <a href="#classes" className={styles.primary}>Explore the academy <ArrowDown size={17} aria-hidden="true"/></a>
       <a href="#heritage" className={styles.textLink}>Our heritage <MoveUpRight size={17} aria-hidden="true"/></a>
      </div>
     </div>
     <div className={styles.matPanel}>
      <div className={styles.matLabel}><span>Rooted in tradition</span><span>Driven by discipline</span></div>
      <div className={styles.matArtwork} aria-hidden="true"><div className={styles.outerCircle}><div className={styles.innerCircle}><span>DEVANHAAR</span><strong>WRESTLING<br/>ACADEMY</strong><i>Freestyle · Community · Heritage</i></div></div></div>
      <p className={styles.matFoot}>One mat.<br/><strong>A shared sense of belonging.</strong></p>
     </div>
    </div>
    <div className={styles.heroBottom}><span>Freestyle wrestling</span><span>Sikh & Punjabi heritage</span><span>Community-led</span></div>
   </section>

   <nav className={styles.sectionNav} aria-label="Explore the Wrestling Academy"><div>
    <a href="#academy"><span>01</span> The academy</a><a href="#heritage"><span>02</span> Our heritage</a><a href="#classes"><span>03</span> Classes</a><a href="#in-action"><span>04</span> In action</a>
   </div></nav>

   <section id="academy" className={`${styles.section} ${styles.about}`} aria-labelledby="academy-heading">
    <div><p className={styles.kicker}>01 / The initiative</p><h2 id="academy-heading">More than a sport.<br/><em>A connection.</em></h2></div>
    <div className={styles.aboutCopy}><p>{content.overview}</p><p>Part of the wider Devanhaar organisation, the academy carries forward our commitment to Sikhi, education, sport and community development.</p>
     <div className={styles.values}>{[['Develop','Skill & discipline'],['Strengthen','Body & mind'],['Connect','With the sangat']].map(([title,description])=><div key={title}><h3>{title}</h3><p>{description}</p></div>)}</div>
    </div>
   </section>

   <section id="heritage" className={styles.heritage} aria-labelledby="heritage-heading"><div className={styles.section}>
    <div className={styles.heritageHeading}><div><p className={styles.kicker}>02 / Our heritage</p><h2 id="heritage-heading">A tradition of strength.<br/><em>A purpose beyond it.</em></h2></div><p>Wrestling has deep roots in Sikh history. Physical strength, discipline and resilience have long been valued alongside spiritual development.</p></div>
    <div className={styles.heritageCards}>{content.heritage.map((item,index)=><article key={item.name}><span className={styles.cardNumber}>0{index+1}</span><p className={styles.heritageName}>{item.name}</p><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
    <p className={styles.heritageClosing}>Honouring that heritage means carrying it forward — through practice, character and community.</p>
   </div></section>

   <section id="classes" className={`${styles.section} ${styles.classes}`} aria-labelledby="classes-heading">
    <div><p className={styles.kicker}>03 / Classes & timetable</p><h2 id="classes-heading">Find your place<br/><em>on the mat.</em></h2><p className={styles.sectionIntro}>Freestyle wrestling in an environment built around learning, challenge and shared progress.</p></div>
    <div className={styles.classCard}><div className={styles.classCardHeader}><span>Devanhaar Wrestling Academy</span><span className={styles.smallPill}>Freestyle</span></div>
     {content.sessions.length?<div className={styles.tableWrap}><table><caption className="sr-only">Wrestling class timetable</caption><thead><tr><th scope="col">Day & time</th><th scope="col">Group</th><th scope="col">Venue</th></tr></thead><tbody>{content.sessions.map(session=><tr key={`${session.day}-${session.time}-${session.group}`}><td><strong>{session.day}</strong><br/>{session.time}</td><td>{session.group}</td><td>{session.venue}</td></tr>)}</tbody></table></div>:<div className={styles.classDetails}><h3>Class information</h3><p>For current class times, the training venue, age groups and joining information, please get in touch with the Devanhaar team.</p><Link href="/contact" className={styles.darkButton}>Ask about classes <ArrowUpRight size={18} aria-hidden="true"/></Link></div>}
     <div className={styles.classCardFoot}>Train with purpose. Grow together.</div>
    </div>
   </section>

   <section id="in-action" className={styles.mediaSection} aria-labelledby="action-heading"><div className={styles.section}>
    <div className={styles.mediaHeading}><div><p className={styles.kicker}>04 / The academy in action</p><h2 id="action-heading">The effort.<br/><em>The shared progress.</em></h2></div><p>A glimpse of training, technique and the community behind the academy.</p></div>
    {content.media.length?<div className={styles.mediaGrid}>{content.media.map(item=><figure key={item.src}>{item.type==='video'?<video controls preload="none" aria-label={item.alt}><source src={item.src}/><a href={item.src}>Watch {item.caption}</a></video>:<img src={item.src} alt={item.alt} loading="lazy"/>}<figcaption>{item.caption}</figcaption></figure>)}</div>:<div className={styles.mediaAwaiting}><span className={styles.outlineWord} aria-hidden="true">ON THE MAT.</span><div><span className={styles.mediaDot}/><p>Academy photos & videos</p><span>Gallery to follow</span></div></div>}
   </div></section>

   <section className={styles.join} aria-labelledby="join-heading"><div><p className={styles.kicker}>Part of something stronger</p><h2 id="join-heading">Heritage in our hearts.<br/>Purpose in our training.</h2><Link href="/contact" className={styles.primary}>Get in touch <ArrowUpRight size={18} aria-hidden="true"/></Link></div></section>
  </main>
  <FooterSection/>
 </div>
}
