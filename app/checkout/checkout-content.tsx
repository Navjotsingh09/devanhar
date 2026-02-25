"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Truck, CreditCard, Gift, CheckCircle, Lock, ArrowLeft, MapPin } from "lucide-react"
import { useCart } from "@/components/cart-provider"

interface ShippingForm {
  fullName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  postcode: string
}

interface CheckoutState {
  shipping: ShippingForm
  isGift: boolean
  giftMessage: string
  shippingMethod: "standard" | "express"
  isSubmitting: boolean
  isComplete: boolean
  orderNumber: string
}

const initialState: CheckoutState = {
  shipping: {
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
  },
  isGift: false,
  giftMessage: "",
  shippingMethod: "standard",
  isSubmitting: false,
  isComplete: false,
  orderNumber: "",
}

export function CheckoutContent() {
  const { items, subtotal, clearCart } = useCart()
  const [state, setState] = useState<CheckoutState>(initialState)

  const shippingCost = state.shippingMethod === "express" ? 9.99 : subtotal >= 50 ? 0 : 4.99
  const total = subtotal + shippingCost

  const updateShipping = (field: keyof ShippingForm, value: string) => {
    setState((s) => ({ ...s, shipping: { ...s.shipping, [field]: value } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((s) => ({ ...s, isSubmitting: true }))

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const orderNumber = `DEV-${Date.now().toString(36).toUpperCase()}`
    
    console.log("Order submitted:", {
      orderNumber,
      items,
      shipping: state.shipping,
      isGift: state.isGift,
      giftMessage: state.giftMessage,
      shippingMethod: state.shippingMethod,
      subtotal,
      shippingCost,
      total,
    })

    clearCart()
    setState((s) => ({ ...s, isSubmitting: false, isComplete: true, orderNumber }))
  }

  // Success state
  if (state.isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1120] to-[#1a1f2e] py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-white mb-4">Order Confirmed!</h1>
            <p className="text-gray-400 mb-2">Thank you for your purchase</p>
            <p className="text-amber-400 font-mono text-lg mb-8">{state.orderNumber}</p>
            <p className="text-gray-500 text-sm mb-8">
              You'll receive a confirmation email shortly. Redirecting to shop...
            </p>
            <Link
              href="/storefront"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1120] to-[#1a1f2e] py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-lg mx-auto text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h1 className="text-2xl font-light text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Add some items to checkout</p>
            <Link
              href="/storefront"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1120] to-[#1a1f2e] py-12 md:py-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/storefront"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-white">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Details */}
            <div className="bg-[#1a1f2e]/80 backdrop-blur border border-[#2a2f3e] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={state.shipping.fullName}
                    onChange={(e) => updateShipping("fullName", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={state.shipping.email}
                    onChange={(e) => updateShipping("email", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={state.shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="+44 7XXX XXXXXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={state.shipping.address1}
                    onChange={(e) => updateShipping("address1", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="Street address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={state.shipping.address2}
                    onChange={(e) => updateShipping("address2", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={state.shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Postcode *</label>
                  <input
                    type="text"
                    required
                    value={state.shipping.postcode}
                    onChange={(e) => updateShipping("postcode", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                  <input
                    type="text"
                    disabled
                    value="United Kingdom"
                    className="w-full px-4 py-3 bg-[#0d1120]/50 border border-[#2a2f3e] rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Currently shipping to UK only</p>
                </div>
              </div>
            </div>

            {/* Gift Options */}
            <div className="bg-[#1a1f2e]/80 backdrop-blur border border-[#2a2f3e] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Gift Options</h2>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={state.isGift}
                  onChange={(e) => setState((s) => ({ ...s, isGift: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#2a2f3e] bg-[#0d1120] text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                />
                <span className="text-gray-300">This order is a gift</span>
              </label>

              {state.isGift && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gift Message (Optional)</label>
                  <textarea
                    value={state.giftMessage}
                    onChange={(e) => setState((s) => ({ ...s, giftMessage: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                    placeholder="Add a personal message..."
                  />
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="bg-[#1a1f2e]/80 backdrop-blur border border-[#2a2f3e] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Shipping Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                  state.shippingMethod === "standard"
                    ? "border-amber-400 bg-amber-500/5"
                    : "border-[#2a2f3e] hover:border-gray-600"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={state.shippingMethod === "standard"}
                      onChange={() => setState((s) => ({ ...s, shippingMethod: "standard" }))}
                      className="w-4 h-4 text-amber-500 border-gray-600 focus:ring-amber-400"
                    />
                    <div>
                      <p className="text-white font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-400">3-5 business days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {subtotal >= 50 ? (
                      <>
                        <p className="text-green-400 font-medium">FREE</p>
                        <p className="text-xs text-gray-500 line-through">£4.99</p>
                      </>
                    ) : (
                      <p className="text-white font-medium">£4.99</p>
                    )}
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                  state.shippingMethod === "express"
                    ? "border-amber-400 bg-amber-500/5"
                    : "border-[#2a2f3e] hover:border-gray-600"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={state.shippingMethod === "express"}
                      onChange={() => setState((s) => ({ ...s, shippingMethod: "express" }))}
                      className="w-4 h-4 text-amber-500 border-gray-600 focus:ring-amber-400"
                    />
                    <div>
                      <p className="text-white font-medium">Express Delivery</p>
                      <p className="text-sm text-gray-400">1-2 business days</p>
                    </div>
                  </div>
                  <p className="text-white font-medium">£9.99</p>
                </label>
              </div>

              {subtotal < 50 && subtotal > 0 && (
                <p className="text-sm text-gray-400 mt-4">
                  Spend £{(50 - subtotal).toFixed(2)} more for free standard shipping
                </p>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-[#1a1f2e]/80 backdrop-blur border border-[#2a2f3e] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Payment</h2>
              </div>

              <div className="border-2 border-dashed border-[#2a2f3e] rounded-lg p-8 text-center">
                <Lock className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Stripe payment will be integrated here</p>
                <p className="text-xs text-gray-500 mb-4">Payment powered by Stripe - keys pending</p>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Your payment is secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1f2e]/80 backdrop-blur border border-[#2a2f3e] rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0d1120] flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      {item.selectedVariant && (
                        <p className="text-gray-500 text-xs">{item.selectedVariant}</p>
                      )}
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm font-medium">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#2a2f3e] pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-400" : "text-white"}>
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-[#2a2f3e]">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.isSubmitting}
                className="w-full mt-6 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
