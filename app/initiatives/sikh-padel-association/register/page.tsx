"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { PadelRegistrationForm } from "@/components/padel-registration-form"

export default function PadelRegisterPage() {
  const router = useRouter()
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <PadelRegistrationForm
          onClose={() => router.push("/initiatives/sikh-padel-association")}
        />
      </main>
      <FooterSection />
    </>
  )
}
