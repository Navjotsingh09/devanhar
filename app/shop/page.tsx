import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ShopContent } from "@/components/shop-content"

export const metadata: Metadata = {
  title: "Shop - Devanhaar",
  description: "Support Devanhaar by purchasing our official merchandise. Every purchase directly funds our initiatives.",
}

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <ShopContent />
        <FooterSection />
      </main>
    </>
  )
}
