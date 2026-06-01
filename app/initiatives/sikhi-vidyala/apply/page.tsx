"use client"

import { useState } from "react"
import { VidyalaApplicationForm } from "@/components/vidyala-application-form"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function VidyalaApplyPage() {
  const [open, setOpen] = useState(false)

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F9F7F4" }}>
      {/* Hero */}
      <section className="relative py-20 px-6 text-center" style={{ backgroundColor: "#1E3461" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image
              src="/logos/vidyala-logo.jpg"
              alt="Sikhi Vidyala"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Sikhi Vidyala 2026-2027 Program</h1>
          <p className="text-lg mb-8" style={{ color: "#F5A623" }}>
            Develop your Sikhi Knowledge and spread the essence of Sikhi.
          </p>
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="text-white font-semibold px-10 py-4 text-lg rounded-full shadow-lg hover:opacity-90 transition"
            style={{ backgroundColor: "#F5A623", color: "#1E3461" }}
          >
            Start your application for 2026-2027 Cohort
          </Button>
        </div>
      </section>

      {/* What to expect */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "#1E3461" }}>
          What to Expect
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Sikhi Education", desc: "Deep-dive sessions on Gurbani, Sikh history, and principles of Sikhi." },
            { title: "Parchaar Skills", desc: "Learn how to share Sikhi effectively with others in your community." },
            { title: "Community", desc: "Connect with like-minded Sikhs on the same journey of growth." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5A623" }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1E3461" }}>{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 text-center" style={{ backgroundColor: "#1E3461" }}>
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Apply?</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Fill in your application below. Applications are reviewed by our team and we will be in touch.
        </p>
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="font-semibold px-10 py-4 text-lg rounded-full hover:opacity-90 transition"
          style={{ backgroundColor: "#F5A623", color: "#1E3461" }}
        >
          Apply Now
        </Button>
      </section>

      {open && <VidyalaApplicationForm onClose={() => setOpen(false)} />}
    </main>
  )
}
