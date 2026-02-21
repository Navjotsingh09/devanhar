"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ShoppingBag, ArrowRight, Star, Heart } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Devanhaar Classic Tee",
    price: 26.00,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/116/379/Men_sShortSleeveShirt-Front-Black__11338.1695161629.jpg",
    category: "Clothing",
    badge: "New",
  },
  {
    id: 2,
    name: "Devanhaar Hoodie",
    price: 41.50,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/115/376/FleecePulloverHoodie-Front__47117.1695161490.jpg",
    category: "Clothing",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Devanhaar Joggers",
    price: 54.00,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/113/370/Joggers-Front-Black__85498.1695160890.jpg",
    category: "Clothing",
  },
  {
    id: 4,
    name: "Devanhaar Jacket",
    price: 249.99,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/111/361/LightweightJacket-Front-Black__64161.1695160397.jpg",
    category: "Clothing",
    badge: "Featured",
  },
  {
    id: 5,
    name: "Devanhaar Insulated Jacket",
    price: 500.00,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/112/366/PurpleInsulatedJacket_Front__24717.1695160578.jpg",
    category: "Clothing",
    badge: "Premium",
  },
  {
    id: 6,
    name: "Devanhaar Sticker Pack",
    price: 4.00,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/117/383/Rainbow_Sticker__18498.1695161712.jpg",
    category: "Stickers",
  },
  {
    id: 7,
    name: "Devanhaar Unisex Joggers",
    price: 34.00,
    image: "https://cdn11.bigcommerce.com/s-89nvgelf3p/images/stencil/1080w/products/114/373/Joggers-Front-Purple__37942.1695161158.jpg",
    category: "Clothing",
  },
]

const categories = ["All", "Clothing", "Stickers", "Accessories"]

function ProductCard({ product, featured = false }: { product: typeof products[0]; featured?: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 ${
        featured ? "row-span-2" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden ${featured ? "h-full min-h-[600px]" : "aspect-[3/4]"}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {product.badge && (
          <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => setIsLiked(!isLiked)}
          title="Add to wishlist"
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all duration-300"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${isHovered ? "translate-y-0" : "translate-y-2"}`}>
          <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-xl">${product.price.toFixed(2)}</span>
            <button className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold transition-all duration-300 hover:bg-primary/90 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ShopContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Hero Bento Grid */}
      <section className="container mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[700px]">
          {/* Large left tile */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl group cursor-pointer min-h-[400px] md:min-h-0">
            <Image
              src={products[3].image}
              alt={products[3].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                Featured Collection
              </span>
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-2">{products[3].name}</h2>
              <div className="flex items-center justify-between">
                <span className="text-primary text-3xl font-bold">${products[3].price.toFixed(2)}</span>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Right stacked tiles */}
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 overflow-hidden rounded-3xl group cursor-pointer min-h-[200px]">
              <Image
                src={products[4].image}
                alt={products[4].name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-bold mb-1">{products[4].name}</h3>
                <span className="text-primary font-bold text-lg">${products[4].price.toFixed(2)}</span>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-3xl group cursor-pointer min-h-[200px]">
              <Image
                src={products[1].image}
                alt={products[1].name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-xl font-bold mb-1">{products[1].name}</h3>
                <span className="text-primary font-bold text-lg">${products[1].price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Banner */}
      <section className="bg-primary py-4 overflow-hidden my-8">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-8 text-primary-foreground font-bold text-lg tracking-wider uppercase flex items-center gap-4">
              <Star className="w-4 h-4 fill-current" />
              Support a Cause
              <Star className="w-4 h-4 fill-current" />
              Official Merch
              <Star className="w-4 h-4 fill-current" />
              Every Purchase Matters
            </span>
          ))}
        </div>
      </section>

      {/* Horizontal Scroll Carousel */}
      <section className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
          <button className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-[280px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter + Product Grid */}
      <section className="container mx-auto px-6 lg:px-12 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Collection</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every purchase directly supports Devanhaar&apos;s mission to create lasting change in communities.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#1a1f2e] py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Wear Your <span className="text-primary">Impact</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            100% of proceeds from our merchandise collection go directly to funding Devanhaar&apos;s community initiatives and programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              Donate Directly
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Scrollbar hide + marquee styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
