import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { RegisterInterestForm } from "@/components/register-interest-form"
import { ArrowRight, MapPin, Clock, Calendar, Users, BookOpen, Mic2, Globe, Shield, Heart, Star } from "lucide-react"

export const metadata = {
  title: "Sikhi Vidyala | Devanhaar",
  description:
    "An educational institution providing knowledge on Sikh history, philosophy, and teachings to equip participants with parchaar skills.",
}

const NAVY = "#1E3461"
const GOLD = "#F5A623"

export default function SikhiVidyalaPage() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />
      <main>

        {/* ── HERO ── */}
        <section className="relative min-h-[520px] flex items-center justify-center overflow-hidden">
          <Image
            src="/initiatives/sikhi-vidyala-top.jpg"
            alt="Sikhi Vidyala"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(30,52,97,0.82) 0%, rgba(30,52,97,0.65) 60%, rgba(10,15,30,0.92) 100%)" }} />
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] mb-6"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              Applications Open
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Sikhi <em className="not-italic" style={{ color: GOLD }}>Vidyala</em>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">
              Develop your Sikhi Knowledge and spread the essence of Sikhi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/initiatives/sikhi-vidyala/apply"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition hover:opacity-90"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                Apply for Vidyala 2026-2027 <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/vidyala-handbook-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition hover:opacity-90 border-2"
                style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}
              >
                View Vidyala Handbook 2026 <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ── QUICK INFO STRIP ── */}
        <section className="py-8 border-b border-border" style={{ backgroundColor: "#f9f7f4" }}>
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: Calendar, label: "Schedule", value: "Mon – Fri, 9am – 5pm" },
                { icon: MapPin, label: "Location", value: "Birmingham, UK (Gurdwara-based)" },
                { icon: Clock, label: "Duration", value: "October 2026 to February 2027" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${NAVY}15` }}>
                    <Icon className="h-5 w-5" style={{ color: NAVY }} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COURSE OVERVIEW ── */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Left: description */}
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ backgroundColor: `${GOLD}22`, color: NAVY }}
                >
                  About the Course
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                  A full-time course in <em className="italic" style={{ color: NAVY }}>Sikhi & Parchaar</em>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The Vidyala is an educational institution where knowledge is provided on Sikh history, philosophy, and teachings. Our aim is to equip participants with the skills necessary to spread the message of Sikhi and inspire others.
                  </p>
                  <p>
                    The course includes understanding Gurbani, learning Sikh history, Santhiya, Q&A sessions, katha, community skills and more. The Vidyala was started in 2015 by Bhai Jagraj Singh of Basics of Sikhi. The course is run by a core team of speakers, workshop leads and facilitators with regular appearances with guests across the panth.
                  </p>
                  <p>
                    This course is open to anyone desiring to get involved in Seva or parchaar, whether for local Sikhi camps or becoming a full-time parchaarik. Global applicants must be aged 18+ and be willing to stay full-time in the UK for six months.
                  </p>
                  <p>
                    We have captured the best speakers and trainers from various organisations within the UK and beyond to help inspire and provide the skills necessary for the next generation to spread the message of Sikhi.
                  </p>
                  <p>
                    Anyone interested in learning more, please read{" "}
                    <a
                      href="/vidyala-handbook-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                      style={{ color: NAVY }}
                    >
                      this handbook
                    </a>{" "}
                    for further details about the course including a FAQ section.
                  </p>
                </div>
              </div>

              {/* Right: apply card */}
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: NAVY }}>
                <div className="p-8">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    Students
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3">Apply for Vidyala 2026-2027</h3>
                  <p className="text-white/70 mb-6 text-sm leading-relaxed">
                    Applications are reviewed by our team. We welcome anyone with a sincere desire to learn and do parchaar. Applicants must be 18+ and based in the UK for the full six months.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Open to ages 18+",
                      "Must be UK-based for 6 months",
                      "Full-time commitment required",
                      "Accommodation & support provided",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/initiatives/sikhi-vidyala/apply"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition hover:opacity-90"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="px-8 pb-8">
                  <p className="text-xs text-white/40 text-center">
                    All applications are considered by our admin team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

                {/* -- WEBINAR -- */}
        <section className="py-16 lg:py-20 border-b border-border">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ backgroundColor: `${GOLD}22`, color: NAVY }}
              >
                Free Event
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find Out More &mdash; <em className="italic" style={{ color: NAVY }}>Join our Webinar</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We are hosting a <strong>free &ldquo;Find Out More&rdquo; webinar</strong> on{" "}
                <strong>Wednesday 24th June at 5:30pm UK time</strong>. This is a great opportunity
                to ask questions and learn more about the Sikhi Vidyala before applying.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Register below to receive your invite. The recording of the webinar will be uploaded here after it has taken place.
              </p>
            </div>
            <div className="max-w-lg mx-auto rounded-2xl p-8 shadow-md" style={{ backgroundColor: "#f9f7f4", border: `1px solid ${GOLD}44` }}>
              <RegisterInterestForm
                camp="vidyala-webinar"
                heading="Register for the Webinar"
                description="Enter your details below and we will send you the webinar link."
                successMessage="You are registered\! We will send you the webinar link closer to the date."
                duplicateMessage="You are already registered for the webinar — we will send you the link closer to the date."
              />
            </div>
          </div>
        </section>

        {/* ── WHAT YOU WILL LEARN ── */}
        <section className="py-16 lg:py-24" style={{ backgroundColor: "#f9f7f4" }}>
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ backgroundColor: `${GOLD}22`, color: NAVY }}
              >
                Curriculum
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                What You&apos;ll <em className="italic" style={{ color: NAVY }}>Learn</em>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: "Gurbani & Santhiya", desc: "Deep study of Gurbani with correct pronunciation and understanding of arth." },
                { icon: Globe, title: "Sikh History", desc: "Comprehensive study of Sikh history from Guru Nanak Dev Ji to the present day." },
                { icon: Mic2, title: "Katha & Public Speaking", desc: "Learn to deliver katha and communicate Sikhi clearly to diverse audiences." },
                { icon: Users, title: "Community Skills", desc: "Practical skills for running Sikh camps, events and community outreach." },
                { icon: Heart, title: "Sikhi Philosophy", desc: "In-depth exploration of Sikh philosophy, Rehatname and puratan sources." },
                { icon: Shield, title: "Parchaar Skills", desc: "Real-world tools to inspire and guide others toward Sikhi in everyday life." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: NAVY }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${GOLD}33` }}>
                    <Icon className="h-5 w-5" style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEET THE TEACHERS ── */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="mb-10">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ backgroundColor: `${GOLD}22`, color: NAVY }}
              >
                Faculty
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Meet the <em className="italic" style={{ color: NAVY }}>Teachers</em>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Bhai Maan Singh", org: "Sikh History Series", photo: "/initiatives/vidyala-teacher-mann-singh.png", desc: "Experienced speaker in the UK on Sikh history & politics. Founder of Sikh History Series podcast." },
                { name: "Bhai Mandeep Singh", org: "Basics of Sikhi", photo: "/initiatives/vidyala-teacher-mandeep-singh.jpg", desc: "Former student of the Basics of Sikhi Vidyala. Qualified teacher with private and grammar school experience." },
                { name: "Bhai Sukhwinder Singh", org: "Guest Speaker", photo: "/initiatives/vidyala-teacher-sukhwinder-singh.jpg", desc: "World renowned speaker on Sikhi. 20+ years teaching Gurbani Santhiya, Kirtan, Sikh History, philosophy & Gurbani arth." },
                { name: "Giani Baljinder Singh", org: "Shaheedi Bunga", photo: "/initiatives/vidyala-teacher-baljinder-singh.png", desc: "Founder of Shaheedi Bunga. Currently teaches Gurbani Santhiya, Kirtan, Sikh History & Katha Granths." },
                { name: "Bhai Amandeep Singh", org: "Friday Night Sikhi", photo: "/initiatives/vidyala-teacher-amnadeep-singh.png", desc: "Founder of Friday Night Sikhi. Experienced in Sikh philosophy, Gurbani Santhiya, and history." },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl overflow-hidden group cursor-default">
                  <div className="relative w-full aspect-[3/4] bg-muted">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Permanent gradient overlay — name always visible, bio fades in on hover */}
                    <div className="absolute inset-0 flex flex-col justify-end" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, transparent 75%)" }}>
                      <div className="px-4 pb-4">
                        <p className="text-white/90 text-sm leading-snug mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.desc}</p>
                        <p className="font-bold text-white text-base leading-tight">{t.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: GOLD }}>{t.org}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-16 lg:py-24" style={{ backgroundColor: NAVY }}>
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ backgroundColor: `${GOLD}33`, color: GOLD }}
              >
                Student Voices
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Hear from <em className="italic" style={{ color: GOLD }}>Previous Students</em>
              </h2>
            </div>
            {/* Video testimonials */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                { src: "/vidyala-testimonial.mp4", label: "Vidyala Testimonial" },
                { src: "/vidyala-student-testimonial.mp4", label: "Student Testimonial" },
              ].map(({ src, label }) => (
                <div key={src} className="rounded-xl overflow-hidden aspect-video bg-black" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    aria-label={label}
                  >
                    <source src={src} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>

            {/* Text quotes */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "The opportunities have been the best part of the Sikhi Vidyala for me.", name: "Hukam Singh", role: "Previous Student" },
                { quote: "The highlight for me has been the Sangat of Gurmukhs.", name: "Gurveen Kaur", role: "Previous Student" },
                { quote: "Learning about the Rehatname and the puratan Singhs has been my highlight.", name: "Luvpreet Singh", role: "Previous Student" },
              ].map((t) => (
                <div key={t.name} className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <Star className="h-5 w-5 mb-4" style={{ color: GOLD }} />
                  <p className="text-white/85 italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: GOLD }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="mb-10">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ backgroundColor: `${GOLD}22`, color: NAVY }}
              >
                Gallery
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Life at the <em className="italic" style={{ color: NAVY }}>Vidyala</em>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "/initiatives/vidyala-highlight-1.jpg",
                "/initiatives/vidyala-highlight-2.jpg",
                "/initiatives/vidyala-highlight-4.jpg",
                "/initiatives/vidyala-highlight-5.jpg",
                "/initiatives/vidyala-highlight-6.jpg",
                "/initiatives/sikhi-vidyala-top.jpg",
              ].map((src, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <Image src={src} alt={`Sikhi Vidyala highlight ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="relative py-24 text-center overflow-hidden">
          <Image
            src="/initiatives/vidyala-outro.png"
            alt="Sikhi Vidyala"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(30,52,97,0.88) 0%, rgba(10,15,30,0.94) 100%)" }} />
          <div className="relative z-10 container mx-auto px-6">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ backgroundColor: `${GOLD}33`, color: GOLD }}
            >
              Applications Open
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be part of the next <em className="italic" style={{ color: GOLD }}>Vidyala cohort</em>
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Join a community of students dedicated to learning Sikhi and spreading Guru Ji&apos;s message.
            </p>
            <Link
              href="/initiatives/sikhi-vidyala/apply"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-base transition hover:opacity-90"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-white/40 text-xs mt-4">All applications are reviewed by our admin team</p>
          </div>
        </section>

      </main>
      <FooterSection />
    </>
  )
}
