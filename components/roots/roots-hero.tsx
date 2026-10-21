import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

export function RootsHero() {
  return (
    <section className="roots-hero">
      <img src="/initiatives/roots-gallery-11.jpg" alt="Outdoor adventure in the woodland at Roots Residential" className="roots-hero-background" fetchPriority="high" />
      <div className="roots-hero-shade" />
      <div className="roots-hero-content">
        <p className="roots-eyebrow">Devanhaar presents · Roots Residential</p>
        <img src="/initiatives/roots-logo.jpg" alt="Roots — Adventure, Friendship, Identity" className="roots-hero-logo" />
        <h1>A little adventure.<br />A stronger sense<br />of <span>belonging.</span></h1>
        <p className="roots-hero-description">Adventure, friendship and Sikh identity for young people aged 13–16. Four days to explore, connect and grow.</p>
        <div className="roots-hero-actions"><Link href="#booking-form" className="roots-gold-button">Register your child <ArrowRight aria-hidden="true" size={18} /></Link><Link href="#about-roots" className="roots-hero-discover">Discover Roots <span aria-hidden="true">↓</span></Link></div>
        <p className="roots-hero-location"><MapPin size={15} aria-hidden="true" /> Hilston Park, Wales</p>
      </div>
      <div className="roots-hero-caption"><span>Step outside the everyday.</span><span>Come back with more.</span></div>
      <div className="roots-hero-facts"><div><strong>13–16</strong><span>Young people</span></div><div><strong>Four days</strong><span>Adventure &amp; connection</span></div><div><strong>Girls &amp; boys</strong><span>Separate residentials</span></div><div><strong>£75</strong><span>Per participant · subject to confirmation</span></div></div>
    </section>
  )
}
