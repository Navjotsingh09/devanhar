"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Plus, Search, Filter, Edit, Trash2, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import Link from "next/link"

interface ProductVariant {
  size?: string
  color?: string
  stock: number
  price: number
}

interface Product {
  id: string
  name: string
  category: string
  basePrice: number
  variants?: ProductVariant[]
  totalStock: number
  status: "active" | "draft"
  description: string
}

const initialProducts: Product[] = [
  {
    id: "prod-001",
    name: "Devanhaar Heritage Polo",
    category: "Clothing",
    basePrice: 35,
    variants: [
      { size: "S", color: "Navy", stock: 12, price: 35 },
      { size: "M", color: "Navy", stock: 18, price: 35 },
      { size: "L", color: "Navy", stock: 10, price: 35 },
      { size: "XL", color: "Navy", stock: 5, price: 35 },
    ],
    totalStock: 45,
    status: "active",
    description: "Premium quality polo with embroidered Devanhaar logo.",
  },
  {
    id: "prod-002",
    name: "Path of the Khalsa Book",
    category: "Books",
    basePrice: 18.99,
    totalStock: 120,
    status: "active",
    description: "An inspiring journey through Sikh history and spirituality.",
  },
  {
    id: "prod-003",
    name: "Sikh Heritage Calendar 2025",
    category: "Home",
    basePrice: 12.99,
    totalStock: 200,
    status: "active",
    description: "Beautiful calendar featuring Sikh art and important dates.",
  },
  {
    id: "prod-004",
    name: "Meditation Prayer Beads",
    category: "Accessories",
    basePrice: 24.99,
    totalStock: 78,
    status: "active",
    description: "Handcrafted wooden mala beads for meditation practice.",
  },
  {
    id: "prod-005",
    name: "Golden Temple Art Print",
    category: "Home",
    basePrice: 45,
    totalStock: 8,
    status: "active",
    description: "Museum-quality print of the Golden Temple at sunset.",
  },
  {
    id: "prod-006",
    name: "Children's Sikh Stories Set",
    category: "Books",
    basePrice: 29.99,
    totalStock: 0,
    status: "draft",
    description: "Collection of illustrated stories for young readers.",
  },
]

function getStockStatus(stock: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (stock === 0) return { label: "Out of Stock", variant: "destructive" }
  if (stock < 10) return { label: "Low Stock", variant: "secondary" }
  return { label: "In Stock", variant: "default" }
}

function getStockBadgeClass(stock: number): string {
  if (stock === 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  if (stock < 10) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  const totalProducts = products.length
  const inStock = products.filter((p) => p.totalStock >= 10).length
  const lowStock = products.filter((p) => p.totalStock > 0 && p.totalStock < 10).length
  const outOfStock = products.filter((p) => p.totalStock === 0).length

  const handleDeleteProduct = (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inStock}</p>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStock}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStock}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="accessories">Accessories</option>
                <option value="home">Home</option>
              </select>
              <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                <option value="">All Stock Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.totalStock)
          const stockBadgeClass = getStockBadgeClass(product.totalStock)

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Product Image Placeholder */}
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/50" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className={product.status === "active" ? "bg-green-500" : ""}
                  >
                    {product.status === "active" ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-4">
                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        £{product.basePrice.toFixed(2)}
                      </span>
                      {product.variants && product.variants.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">+ variants</span>
                      )}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockBadgeClass}`}>
                      {product.totalStock} in stock
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {product.totalStock > 0 && product.totalStock < 10 && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Low stock - reorder soon</span>
                    </div>
                  )}
                  {product.totalStock === 0 && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Out of stock - restock required</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Link href={`/dashboard/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
