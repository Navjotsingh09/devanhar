"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Package, Truck, CheckCircle, Clock, MapPin, Search, ArrowRight, ExternalLink, MessageCircle } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
}

interface TrackingStep {
  id: string
  label: string
  date?: string
  status: "completed" | "current" | "pending"
}

interface OrderDetails {
  orderId: string
  status: string
  estimatedDelivery: string
  carrier: string
  trackingNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  steps: TrackingStep[]
}

// Mock order data for demonstration
const mockOrder: OrderDetails = {
  orderId: "DEV-2024-0847",
  status: "In Transit",
  estimatedDelivery: "March 2, 2026",
  carrier: "Royal Mail Tracked 24",
  trackingNumber: "RM123456789GB",
  items: [
    {
      id: "1",
      name: "Devanhaar Heritage Hoodie - Navy",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop",
      quantity: 1,
      price: 45.00
    },
    {
      id: "2",
      name: "Khalsa Pride T-Shirt - White",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
      quantity: 2,
      price: 25.00
    },
    {
      id: "3",
      name: "Sikhi Vidyala Workbook Set",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop",
      quantity: 1,
      price: 18.00
    }
  ],
  subtotal: 113.00,
  shipping: 4.99,
  total: 117.99,
  steps: [
    { id: "placed", label: "Order Placed", date: "Feb 25, 2026", status: "completed" },
    { id: "processing", label: "Processing", date: "Feb 26, 2026", status: "completed" },
    { id: "shipped", label: "Shipped", date: "Feb 27, 2026", status: "completed" },
    { id: "transit", label: "Out for Delivery", status: "current" },
    { id: "delivered", label: "Delivered", status: "pending" }
  ]
}

export function OrdersContent() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState("")

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both your order ID and email address.")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // For demo, accept any input and show mock data
    setOrder({ ...mockOrder, orderId: orderId.toUpperCase() })
    setIsLoading(false)
  }

  const resetSearch = () => {
    setOrder(null)
    setOrderId("")
    setEmail("")
    setError("")
  }

  const getStepIcon = (step: TrackingStep) => {
    if (step.status === "completed") {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    }
    if (step.status === "current") {
      if (step.id === "transit") return <Truck className="w-6 h-6 text-amber-400 animate-pulse" />
      return <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
    }
    return <div className="w-6 h-6 rounded-full border-2 border-[#3a3f4e]" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1120] to-[#1a1f2e]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 border-b border-[#2a2f3e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-6">
              <Package className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 tracking-tight">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Enter your order details below to check the status of your Devanhaar shop order.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Order Lookup Form */}
            {!order && (
              <div className="bg-[#1a1f2e]/80 backdrop-blur-sm border border-[#2a2f3e] rounded-2xl p-8 md:p-12">
                <form onSubmit={handleTrackOrder} className="space-y-6">
                  <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-300 mb-2">
                      Order ID
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="DEV-2024-0001"
                      className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-500">Find this in your order confirmation email</p>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-[#0d1120] border border-[#2a2f3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-500">The email address used for your order</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Track Order
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Order Details */}
            {order && (
              <div className="space-y-8">
                {/* Back/Reset Button */}
                <button
                  onClick={resetSearch}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Track a different order
                </button>

                {/* Order Status Header */}
                <div className="bg-[#1a1f2e]/80 backdrop-blur-sm border border-[#2a2f3e] rounded-2xl p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Order ID</p>
                      <p className="text-xl font-semibold text-white">{order.orderId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 mb-8">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Estimated delivery: <span className="text-white font-medium">{order.estimatedDelivery}</span></span>
                  </div>

                  {/* Progress Tracker */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#2a2f3e]">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-amber-400 transition-all duration-500"
                        style={{
                          width: `${((order.steps.filter(s => s.status === "completed").length) / (order.steps.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {order.steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full ${
                            step.status === "completed" ? "bg-[#0d1120]" :
                            step.status === "current" ? "bg-[#0d1120]" :
                            "bg-[#1a1f2e]"
                          }`}>
                            {getStepIcon(step)}
                          </div>
                          <p className={`mt-3 text-xs font-medium text-center max-w-[80px] ${
                            step.status === "pending" ? "text-gray-500" : "text-white"
                          }`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="mt-1 text-[10px] text-gray-500">{step.date}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-[#1a1f2e]/80 backdrop-blur-sm border border-[#2a2f3e] rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" />
                    Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Carrier</p>
                      <p className="text-white font-medium">{order.carrier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Tracking Number</p>
                      <a
                        href="#"
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-2 transition-colors"
                      >
                        {order.trackingNumber}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-[#1a1f2e]/80 backdrop-blur-sm border border-[#2a2f3e] rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-[#0d1120]/50 rounded-xl"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#2a2f3e] flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-white font-semibold">
                          \u00a3{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-6 border-t border-[#2a2f3e] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">\u00a3{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">\u00a3{order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-amber-400">\u00a3{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Need Help */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">Need Help?</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Have questions about your order? Our team is here to help.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Contact Support
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
