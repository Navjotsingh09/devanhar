import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Cart item structure
interface CartItem {
  id: string
  productId: number
  name: string
  variant: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface Cart {
  items: CartItem[]
  updatedAt: Date
}

// In-memory storage (temporary until Supabase is set up)
const cartStorage = new Map<string, Cart>()

// Generate a unique session ID
function generateSessionId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session ID from cookies
async function getSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const cookieStore = await cookies()
  const existingId = cookieStore.get("cart_session")?.value
  
  if (existingId && cartStorage.has(existingId)) {
    return { sessionId: existingId, isNew: false }
  }
  
  const newId = generateSessionId()
  return { sessionId: newId, isNew: true }
}

// Get cart for session
function getCart(sessionId: string): Cart {
  return cartStorage.get(sessionId) || { items: [], updatedAt: new Date() }
}

// Save cart for session
function saveCart(sessionId: string, cart: Cart): void {
  cart.updatedAt = new Date()
  cartStorage.set(sessionId, cart)
}

// GET - Retrieve cart
export async function GET() {
  try {
    const { sessionId, isNew } = await getSessionId()
    const cart = getCart(sessionId)
    
    const response = NextResponse.json({
      success: true,
      cart: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
    
    if (isNew) {
      response.cookies.set("cart_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    }
    
    return response
  } catch (error) {
    console.error("GET /api/cart error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to retrieve cart" },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { sessionId, isNew } = await getSessionId()
    const cart = getCart(sessionId)
    const body = await request.json()
    
    const { productId, name, variant, price, quantity = 1, image, slug } = body
    
    if (!productId || !name || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Check if item with same productId and variant exists
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variant === variant
    )
    
    if (existingIndex > -1) {
      // Update quantity of existing item
      cart.items[existingIndex].quantity += quantity
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${productId}_${variant || "default"}_${Date.now()}`,
        productId,
        name,
        variant: variant || "",
        price,
        quantity,
        image: image || "",
        slug: slug || "",
      }
      cart.items.push(newItem)
    }
    
    saveCart(sessionId, cart)
    
    const response = NextResponse.json({
      success: true,
      cart: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
    
    if (isNew) {
      response.cookies.set("cart_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      })
    }
    
    return response
  } catch (error) {
    console.error("POST /api/cart error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

// PUT - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const { sessionId } = await getSessionId()
    const cart = getCart(sessionId)
    const body = await request.json()
    
    const { itemId, quantity } = body
    
    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing itemId or quantity" },
        { status: 400 }
      )
    }
    
    const itemIndex = cart.items.findIndex((item) => item.id === itemId)
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart" },
        { status: 404 }
      )
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }
    
    saveCart(sessionId, cart)
    
    return NextResponse.json({
      success: true,
      cart: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
  } catch (error) {
    console.error("PUT /api/cart error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await getSessionId()
    const cart = getCart(sessionId)
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing itemId" },
        { status: 400 }
      )
    }
    
    const itemIndex = cart.items.findIndex((item) => item.id === itemId)
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart" },
        { status: 404 }
      )
    }
    
    cart.items.splice(itemIndex, 1)
    saveCart(sessionId, cart)
    
    return NextResponse.json({
      success: true,
      cart: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
  } catch (error) {
    console.error("DELETE /api/cart error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove item" },
      { status: 500 }
    )
  }
}
