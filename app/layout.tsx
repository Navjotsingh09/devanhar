import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { DonationProvider } from "@/components/donation-provider"
import { CartProvider } from "@/components/cart-provider"
import { CartDrawer } from "@/components/cart-drawer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Devanhaar | Create, Develop, Empower",
  description:
    "A Sikh-led charity creating educational and community spaces for learning, growth, and service across the UK, Europe, and beyond.",
}

export const viewport: Viewport = {
  themeColor: "#1a1d2e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <DonationProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </DonationProvider>
      </body>
    </html>
  )
}
