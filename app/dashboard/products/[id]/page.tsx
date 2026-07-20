import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft, Edit, Archive, AlertTriangle, TrendingUp, DollarSign, Save } from "lucide-react"
import Link from "next/link"

interface ProductVariant {
  size?: string
  color?: string
  stock: number
  price: number
  sku: string
}

interface ProductDetail {
  id: string
  name: string
  category: string
  description: string
  basePrice: number
  variants: ProductVariant[]
  totalStock: number
  status: "active" | "draft"
  lowStockThreshold: number
  totalSold: number
  totalRevenue: number
  createdAt: string
  updatedAt: string
}

// Mock data - in production this would come from database
const mockProducts: Record<string, ProductDetail> = {
  "prod-001": {
    id: "prod-001",
    name: "Devanhaar Heritage Polo",
    category: "Clothing",
    description: "Premium quality polo shirt featuring the embroidered Devanhaar logo. Made from 100% organic cotton for comfort and durability. Perfect for camp activities, community events, or everyday wear.",
    basePrice: 35,
    variants: [
      { size: "S", color: "Navy", stock: 12, price: 35, sku: "DHP-NAV-S" },
      { size: "M", color: "Navy", stock: 18, price: 35, sku: "DHP-NAV-M" },
      { size: "L", color: "Navy", stock: 10, price: 35, sku: "DHP-NAV-L" },
      { size: "XL", color: "Navy", stock: 5, price: 35, sku: "DHP-NAV-XL" },
    ],
    totalStock: 45,
    status: "active",
    lowStockThreshold: 10,
    totalSold: 234,
    totalRevenue: 8190,
    createdAt: "2024-03-15",
    updatedAt: "2025-02-20",
  },
  "prod-002": {
    id: "prod-002",
    name: "Path of the Khalsa Book",
    category: "Books",
    description: "An inspiring journey through Sikh history, exploring the path of the Khalsa from its origins to modern day. Written by renowned historian Dr. Harpreet Singh.",
    basePrice: 18.99,
    variants: [],
    totalStock: 120,
    status: "active",
    lowStockThreshold: 20,
    totalSold: 89,
    totalRevenue: 1690.11,
    createdAt: "2024-01-10",
    updatedAt: "2025-02-15",
  },
  "prod-005": {
    id: "prod-005",
    name: "Golden Temple Art Print",
    category: "Home",
    description: "Museum-quality giclee print of the Golden Temple (Harmandir Sahib) at sunset. Printed on archival paper with fade-resistant inks. Available in A3 size.",
    basePrice: 45,
    variants: [],
    totalStock: 8,
    status: "active",
    lowStockThreshold: 15,
    totalSold: 42,
    totalRevenue: 1890,
    createdAt: "2024-06-01",
    updatedAt: "2025-02-18",
  },
  "prod-006": {
    id: "prod-006",
    name: "Children's Sikh Stories Set",
    category: "Books",
    description: "A beautifully illustrated collection of Sikh stories for young readers aged 5-10. Includes tales of the Gurus, stories of courage, and lessons in kindness.",
    basePrice: 29.99,
    variants: [],
    totalStock: 0,
    status: "draft",
    lowStockThreshold: 10,
    totalSold: 156,
    totalRevenue: 4678.44,
    createdAt: "2023-11-20",
    updatedAt: "2025-01-30",
  },
}

function getStockBadgeClass(stock: number, threshold: number): string {
  if (stock === 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  if (stock < threshold) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Get product from mock data (in production, fetch from database)
  const product = mockProducts[id] || mockProducts["prod-001"]
  const isLowStock = product.totalStock > 0 && product.totalStock < product.lowStockThreshold
  const isOutOfStock = product.totalStock === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Products</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <Badge
              variant={product.status === "active" ? "default" : "secondary"}
              className={product.status === "active" ? "bg-green-500" : ""}
            >
              {product.status === "active" ? "Active" : "Draft"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">{product.category} • Last updated: {product.updatedAt}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={product.name}
                  disabled
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                  value={product.description}
                  disabled
                  rows={4}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <input
                    type="text"
                    value={product.category}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base Price</label>
                  <input
                    type="text"
                    value={`£${product.basePrice.toFixed(2)}`}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          {product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Color</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{variant.sku}</td>
                          <td className="py-3 px-4 text-sm">{variant.size || "-"}</td>
                          <td className="py-3 px-4 text-sm">{variant.color || "-"}</td>
                          <td className="py-3 px-4 text-sm">£{variant.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStockBadgeClass(variant.stock, product.lowStockThreshold)}`}>
                              {variant.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Management */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-3xl font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-green-600"}`}>
                    {product.totalStock}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStockBadgeClass(product.totalStock, product.lowStockThreshold)}`}>
                    {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                  </span>
                </div>
              </div>

              {(isLowStock || isOutOfStock) && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${isOutOfStock ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"}`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    {isOutOfStock ? "Product is out of stock. Restock required." : "Stock is running low. Consider reordering."}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium text-muted-foreground">Adjust Stock</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <Button variant="outline" size="sm">Add</Button>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Low Stock Threshold</label>
                <input
                  type="number"
                  value={product.lowStockThreshold}
                  disabled
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sold</p>
                    <p className="text-lg font-semibold">{product.totalSold}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Generated</p>
                    <p className="text-lg font-semibold">£{product.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Archiving this product will remove it from the shop but preserve order history.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
