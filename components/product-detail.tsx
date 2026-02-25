"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  X,
  Truck,
  Shield,
  RotateCcw,
  ChevronDown,
  Heart,
  Share2,
} from "lucide-react"

interface Product {
  id: number
  slug: string
  name: string
  price: number
  category: string
  images: string[]
  description: string
  longDescription: string
  careInstructions: string
  badge: string | null
  variants: string[]
  inStock: boolean
  stockCount: number
}

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left text-foreground font-medium hover:text-amber-500 transition-colors"
      >
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-4" : "max-h-0"}`}>
        <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((q) => Math.max(1, Math.min(q + delta, product.stockCount || 99)))
  }, [product.stockCount])

  const handleAddToCart = useCallback(() => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    // In production, integrate with cart state/API
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }, [])

  return (
    <div className="pt-24 pb-0">
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 lg:px-12 py-4 border-b border-border">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-6 lg:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16" data-animate>
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
                style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                priority
                unoptimized
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-amber-400 text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImage === idx
                        ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-500 mb-2 capitalize">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-foreground">
                  £{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">+ Free UK Delivery</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium text-sm">In Stock</span>
                  {product.stockCount <= 10 && (
                    <span className="text-amber-500 text-sm ml-2">Only {product.stockCount} left!</span>
                  )}
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium text-sm">Out of Stock</span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border" />

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Size: <span className="text-muted-foreground font-normal">{selectedVariant}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!product.inStock}
                      className={`min-w-[48px] h-12 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                        selectedVariant === variant
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      } ${!product.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center">
                <label className="sr-only">Quantity</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={!product.inStock || quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center font-medium text-foreground border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={!product.inStock || quantity >= product.stockCount}
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 h-12 px-8 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : product.inStock
                    ? "bg-amber-400 text-black hover:bg-amber-500"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-12 h-12 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="w-12 h-12 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200 flex items-center justify-center"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-muted-foreground">Free UK Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-muted-foreground">Secure Checkout</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-muted-foreground">30-Day Returns</span>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div>
              <Accordion title="Product Details" defaultOpen>
                <p>{product.longDescription}</p>
              </Accordion>
              <Accordion title="Care Instructions">
                <p>{product.careInstructions}</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <ul className="space-y-2">
                  <li>• Free standard UK delivery on all orders</li>
                  <li>• Express delivery available (1-2 business days)</li>
                  <li>• International shipping to selected countries</li>
                  <li>• 30-day hassle-free returns for unworn items</li>
                  <li>• Items must be returned in original packaging</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border">
          <div className="container mx-auto px-6 lg:px-12 py-16 md:py-24">
            <div className="mb-10" data-animate>
              <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-tight">
                You May Also Like
              </h2>
              <p className="text-muted-foreground mt-2">More from our {product.category} collection</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-animate>
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-semibold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-amber-500 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">£{item.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">{product.name}</p>
            <p className="text-lg font-semibold text-foreground">£{product.price.toFixed(2)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-6 h-12 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              addedToCart
                ? "bg-green-500 text-white"
                : product.inStock
                ? "bg-amber-400 text-black"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {addedToCart ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            {addedToCart ? "Added" : product.inStock ? "Add" : "Sold Out"}
          </button>
        </div>
      </div>

      {/* Bottom Padding for Mobile Sticky Bar */}
      <div className="h-24 lg:hidden" />
    </div>
  )
}
