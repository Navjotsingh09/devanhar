import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Printer,
  Send,
  MoreVertical,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

interface OrderItem {
  id: string
  name: string
  variant: string
  quantity: number
  price: number
  image: string
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: OrderStatus
  date: string
  customer: {
    name: string
    email: string
    phone: string
    address: {
      line1: string
      line2?: string
      city: string
      postcode: string
      country: string
    }
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  timeline: { status: string; date: string; completed: boolean }[]
}

// Dummy order data - replace with Supabase fetch later
const order: OrderDetail = {
  id: "1",
  orderNumber: "DEV-2024-0001",
  status: "shipped",
  date: "2024-02-22T14:30:00Z",
  customer: {
    name: "Harpreet Singh",
    email: "harpreet@example.com",
    phone: "+44 7700 900123",
    address: {
      line1: "123 High Street",
      line2: "Flat 4B",
      city: "Birmingham",
      postcode: "B1 2CD",
      country: "United Kingdom",
    },
  },
  items: [
    {
      id: "item1",
      name: "Singhs Camp 2024 T-Shirt",
      variant: "Navy / Large",
      quantity: 2,
      price: 24.99,
      image: "https://placehold.co/100x100/1a1a2e/e0e0e0.png?text=Product",
    },
    {
      id: "item2",
      name: "Devanhaar Hoodie",
      variant: "Black / Medium",
      quantity: 1,
      price: 39.99,
      image: "https://placehold.co/100x100/1a1a2e/e0e0e0.png?text=Product",
    },
  ],
  subtotal: 89.97,
  shipping: 4.99,
  total: 94.96,
  timeline: [
    { status: "Order Placed", date: "22 Feb 2024, 2:30 PM", completed: true },
    { status: "Payment Confirmed", date: "22 Feb 2024, 2:32 PM", completed: true },
    { status: "Processing", date: "22 Feb 2024, 4:15 PM", completed: true },
    { status: "Shipped", date: "23 Feb 2024, 9:00 AM", completed: true },
    { status: "Delivered", date: "", completed: false },
  ],
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100 border-yellow-200" },
  processing: { label: "Processing", color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200" },
  shipped: { label: "Shipped", color: "text-purple-700", bgColor: "bg-purple-100 border-purple-200" },
  delivered: { label: "Delivered", color: "text-green-700", bgColor: "bg-green-100 border-green-200" },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100 border-red-200" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OrderDetailPage() {
  const status = statusConfig[order.status]

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="w-4 h-4" />
            Send Email
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Order Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{order.orderNumber}</h1>
                <Badge variant="outline" className={`${status.bgColor} ${status.color} border`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-gray-500 mt-1">Placed on {formatDate(order.date)}</p>
            </div>
            <div>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white">
                <option value="pending">Update to: Pending</option>
                <option value="processing">Update to: Processing</option>
                <option value="shipped">Update to: Shipped</option>
                <option value="delivered">Update to: Delivered</option>
                <option value="cancelled">Update to: Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.variant}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {order.timeline.map((step, idx) => {
                  const isLast = idx === order.timeline.length - 1
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-12 ${
                              step.completed ? "bg-green-200" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-8">
                        <p
                          className={`font-medium ${
                            step.completed ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">{step.date}</p>
                        )}
                        {!step.completed && (
                          <p className="text-sm text-gray-400">Pending</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer Info */}
        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {order.customer.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>{order.customer.address.line1}</p>
                  {order.customer.address.line2 && (
                    <p>{order.customer.address.line2}</p>
                  )}
                  <p>{order.customer.address.city}</p>
                  <p>{order.customer.address.postcode}</p>
                  <p className="font-medium text-gray-900">
                    {order.customer.address.country}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gap-2" variant="outline">
                <Truck className="w-4 h-4" />
                Mark as Shipped
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Package className="w-4 h-4" />
                Update Tracking
              </Button>
              <Button className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" variant="outline">
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
