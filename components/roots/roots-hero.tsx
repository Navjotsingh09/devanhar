'use client'

import { useEffect } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'

export function RootsHero() {
  useEffect(() => {
    const scrollToSection = () => {
      const id = window.location.hash.slice(1)
      if (!['booking-form', 'about-roots', 'residentials', 'roots-experience', 'roots-venue'].includes(id)) return
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }
    // The public route can stream a loading shell before its anchor exists.
    // Resolve deep links again after hydration, when the complete page is present.
    const frame = requestAnimationFrame(scrollToSection)
    window.addEventListener('hashchange', scrollToSection)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', scrollToSection)
    }
  }, [])
  return (
    <section className="roots-hero">
      <img src="/initiatives/roots-gallery-11.jpg" alt="Outdoor adventure in the woodland at Roots Residential" className="roots-hero-background" fetchPriority="high" />
      <div className="roots-hero-shade" />
      <div className="roots-hero-content">
        <p className="roots-eyebrow">Devanhaar presents · Roots Residential</p>
        <img src="/initiatives/roots-logo.jpg" alt="Roots — Adventure, Friendship, Identity" className="roots-hero-logo" />
        <h1>A little adventure.<br />A stronger sense<br />of <span>belonging.</span></h1>
        <p className="roots-hero-description">Adventure, friendship and Sikh identity for young people aged 12–16. Three days to explore, connect and grow.</p>
        <div className="roots-hero-actions"><a href="#booking-form" className="roots-gold-button">Register your child <ArrowRight aria-hidden="true" size={18} /></a><a href="#about-roots" className="roots-hero-discover">Discover Roots <span aria-hidden="true">↓</span></a></div>
        <p className="roots-hero-location"><MapPin size={15} aria-hidden="true" /> Hilston Park, Wales</p>
      </div>
      <div className="roots-hero-caption"><span>Step outside the everyday.</span><span>Come back with more.</span></div>
      <div className="roots-hero-facts"><div><strong>12–16</strong><span>Young people</span></div><div><strong>Three days</strong><span>Adventure &amp; connection</span></div><div><strong>Girls &amp; boys</strong><span>Separate residentials</span></div><div><strong>19–21 December 2026</strong><span>Residential dates</span></div></div>
    </section>
  )
}
