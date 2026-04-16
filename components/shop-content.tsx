"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useSiteImages } from "@/hooks/use-site-images"

const categories = [
  { id: "all", label: "All" },
  { id: "clothing", label: "Clothing" },
  { id: "accessories", label: "Accessories" },
  { id: "books", label: "Books & Media" },
]

const products = [
  {
    id: 1,
    slug: "devanhaar-classic-tee",
    name: "Devanhaar Classic Tee",
    price: 25.00,
    category: "clothing",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Devanhaar+Classic+Tee",
    description: "Premium cotton tee with embroidered Devanhaar logo. Every purchase supports Sikh education.",
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: 2,
    slug: "khanda-hoodie",
    name: "Khanda Hoodie",
    price: 55.00,
    category: "clothing",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Khanda+Hoodie",
    description: "Cosy hoodie with subtle Khanda design. Premium quality, ethically made.",
    badge: null,
    inStock: true,
  },
  {
    id: 3,
    slug: "seva-water-bottle",
    name: "Seva Water Bottle",
    price: 18.00,
    category: "accessories",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Seva+Water+Bottle",
    description: "Stainless steel bottle with \"Seva\" engraving. Keeps drinks cold for 24hrs.",
    badge: "Eco-Friendly",
    inStock: true,
  },
  {
    id: 4,
    slug: "japji-sahib-journal",
    name: "Japji Sahib Journal",
    price: 15.00,
    category: "books",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Japji+Sahib+Journal",
    description: "Beautiful hardcover journal with Japji Sahib verses. Perfect for reflection.",
    badge: null,
    inStock: true,
  },
  {
    id: 5,
    slug: "community-cap",
    name: "Community Cap",
    price: 22.00,
    category: "accessories",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Community+Cap",
    description: "Adjustable cap with Devanhaar community badge. One size fits all.",
    badge: "New",
    inStock: true,
  },
  {
    id: 6,
    slug: "sikhi-colouring-book",
    name: "Sikhi Colouring Book",
    price: 12.00,
    category: "books",
    image: "https://placehold.co/600x600/1a1a2e/e0e0e0.png?text=Sikhi+Colouring+Book",
    description: "Educational colouring book teaching Sikhi basics to children.",
    badge: "For Kids",
    inStock: false,
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price)
}

export function ShopContent() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { addToCart } = useCart()
  const { images: shopImages } = useSiteImages("shop")

  const cmsImageMap: Record<string, string> = {}
  for (const img of shopImages) {
    if (img.category) cmsImageMap[img.category] = img.url
  }

  const getProductImage = (slug: string, fallback: string) => cmsImageMap[slug] || fallback

  const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  const handleQuickAdd = async (product: typeof products[0]) => {
    if (!product.inStock) return
    await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product.slug, product.image),
      variant: "Default",
      quantity: 1,
      slug: product.slug,
    })
  }

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
              <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={getProductImage(product.slug, product.image)}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {product.badge}
                  </span>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">Out of Stock</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View Details
                  </span>
                </div>
              </Link>
              <div className="p-6">
                <Link href={`/shop/${product.slug}`}>
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={!product.inStock}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      product.inStock
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.inStock ? "Add to Cart" : "Sold Out"}
                  </button>
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
            From Singhs Camp UK to Sikhi Vidyala, every item you purchase helps empower Sikh
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
