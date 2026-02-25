"use client"

import { Fragment, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "./cart-provider"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price)
}

export function CartDrawer() {
  const {
    items,
    itemCount,
    total,
    isLoading,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer()
    }
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleEscape)
    }
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-background shadow-2xl transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
              {itemCount > 0 && (
                <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-medium text-black">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Looks like you have not added anything to your cart yet.
                </p>
                <button
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-500"
                >
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    {/* Product Image */}
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeDrawer}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={closeDrawer}
                            className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                          >
                            {item.name}
                          </Link>
                          {item.variant && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.variant}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 p-1 text-muted-foreground transition-colors hover:text-red-500"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Shipping Note */}
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Shipping and taxes calculated at checkout
              </p>

              {/* Checkout Button */}
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-500"
              >
                Go to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeDrawer}
                className="mt-3 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}
