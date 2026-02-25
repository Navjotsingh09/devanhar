"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  { id: "all", label: "All" },
  { id: "clothing", label: "Clothing" },
  { id: "accessories", label: "Accessories" },
  { id: "books", label: "Books & Media" },
]

const products = [
  {
    id: 1,
    name: "Devanhaar Classic Tee",
    price: "£25.00",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    description: "Premium cotton tee with embroidered Devanhaar logo. Every purchase supports Sikh education.",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Seva Hoodie",
    price: "£45.00",
    category: "clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    description: "Cosy heavyweight hoodie with subtle Khanda detailing. Perfect for camp nights and events.",
    badge: null,
  },
  {
    id: 3,
    name: "Chardi Kala Cap",
    price: "£18.00",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&q=80",
    description: "Structured cap with ‘Chardi Kala’ embroidery. One size fits all.",
    badge: "New",
  },
  {
    id: 4,
    name: "Khalsa Enamel Pin Set",
    price: "£12.00",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&q=80",
    description: "Set of three enamel pins featuring Khanda, Ik Onkar, and Devanhaar crest.",
    badge: null,
  },
  {
    id: 5,
    name: "Singhs Camp Journal",
    price: "£15.00",
    category: "books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    description: "Premium hardcover journal for reflection and Nitnem tracking. 200 lined pages.",
    badge: null,
  },
  {
    id: 6,
    name: "Devanhaar Tote Bag",
    price: "£14.00",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80",
    description: "Organic cotton tote with Devanhaar branding. Carry your Seva essentials in style.",
    badge: null,
  },
]

export function ShopContent() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <section className="pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6">
            <ShoppingBag className="w-3.5 h-3.5" />
            Official Merchandise
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Shop <span className="text-primary">Devanhaar</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every purchase directly supports our Sikh education programmes, camps, and community initiatives across the UK.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{product.price}</span>
                  <span className="text-xs text-muted-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-muted/50 border rounded-3xl p-12">
          <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold">
            100% of Profits Fund Our Initiatives
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From Singhs Camp to Sikhi Vidyala, every item you purchase helps empower Sikh
            youth and strengthen communities across the UK.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Button asChild>
              <Link href="/donate">
                Donate Directly <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects">Our Initiatives</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
