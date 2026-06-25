"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Truck, Shield, CreditCard } from "lucide-react"
import { useCart } from "@/components/cart-provider"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price)
}

export function CartPageContent() {
  const {
    items,
    itemCount,
    total,
    isLoading,
    updateQuantity,
    removeItem,
  } = useCart()

  const FREE_SHIPPING_THRESHOLD = 50
  const ESTIMATED_SHIPPING = 4.99
  const subtotal = total
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : ESTIMATED_SHIPPING
  const orderTotal = subtotal + shipping
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-6" />
            <h1 className="text-3xl font-light text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Looks like you have not added anything to your cart yet. Explore our shop and find something you love.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-500"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4">Shopping Cart</h1>
          <div className="w-12 h-px bg-amber-400 mb-4" />
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <div className="mb-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Add <span className="font-semibold">{formatPrice(remainingForFreeShipping)}</span> more to qualify for free shipping!
              </p>
            </div>
            <div className="h-2 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 md:p-6">
                  {/* Product Image */}
                  <Link
                    href={`/shop/${item.slug}`}
                    className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          href={`/shop/${item.slug}`}
                          className="text-base md:text-lg font-medium text-foreground hover:text-amber-500 transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Variant: {item.variant}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-amber-600">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-red-500"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>

              {/* Summary Lines */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-foreground"}`}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-400 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-amber-500"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span>Free shipping on orders over £50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CreditCard className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span>All major payment methods accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
