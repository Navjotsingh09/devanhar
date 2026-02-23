"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Product {
  name: string
  price: string
  category: string
  image: string
  slug: string
}

const categories = ["All", "Apparel", "Accessories", "Books", "Prints"]

const products: Product[] = [
  {
    name: "Heritage Tee",
    price: "£25.00",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    slug: "heritage-tee",
  },
  {
    name: "Empower Hoodie",
    price: "£45.00",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    slug: "empower-hoodie",
  },
  {
    name: "Khanda Pin Badge",
    price: "£8.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    slug: "khanda-pin-badge",
  },
  {
    name: "Sikh Heritage Journal",
    price: "£15.00",
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    slug: "sikh-heritage-journal",
  },
  {
    name: "Community Canvas Print",
    price: "£35.00",
    category: "Prints",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
    slug: "community-canvas-print",
  },
  {
    name: "Seva Tote Bag",
    price: "£12.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&q=80",
    slug: "seva-tote-bag",
  },
  {
    name: "Wisdom & Courage Book",
    price: "£18.00",
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    slug: "wisdom-courage-book",
  },
  {
    name: "Golden Temple Print",
    price: "£40.00",
    category: "Prints",
    image: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80",
    slug: "golden-temple-print",
  },
]
export function ShopContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <div className="pt-24 pb-20">
      {/* Page Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-32">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              Support Our Mission
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-foreground mb-8 tracking-tight">
              Shop
            </h1>
            <div className="w-16 h-px bg-amber-400 mb-8" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              Every purchase directly supports our community programmes
              and educational initiatives.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-8 py-6 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium tracking-wide whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <div className="mt-1 h-px w-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {filtered.map((product) => (
            <Link
              key={product.slug}
              href={"/shop/" + product.slug}
              className="group"
            >
              <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-4 h-4 text-black" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-500">
                  {product.category}
                </span>
                <h3 className="text-base font-medium text-foreground group-hover:underline underline-offset-4 decoration-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products in this category yet.</p>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6 tracking-tight">
              Every Purchase Makes a Difference
            </h2>
            <div className="w-12 h-px bg-amber-400 mx-auto mb-8" />
            <p className="text-lg text-muted-foreground font-light leading-relaxed mb-10">
              100% of profits go directly to funding our education, outreach,
              and community development programmes across the UK.
            </p>
            <Link href="/#contact">
              <Button className="rounded-full px-8 py-6 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90">
                Get Involved
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
