"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"

export interface CartItem {
  id: string
  productId: number
  name: string
  variant: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  isLoading: boolean
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  // Fetch cart from server
  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      
      if (data.success) {
        setItems(data.cart)
        setItemCount(data.itemCount)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load cart on mount
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Add item to cart
  const addToCart = useCallback(async (item: Omit<CartItem, "id">) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      const data = await response.json()
      
      if (data.success) {
        setItems(data.cart)
        setItemCount(data.itemCount)
        setTotal(data.total)
        openDrawer() // Open drawer when item is added
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [openDrawer])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    // Optimistic update
    const previousItems = [...items]
    const previousCount = itemCount
    const previousTotal = total
    
    const updatedItems = quantity <= 0
      ? items.filter((item) => item.id !== itemId)
      : items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
    
    setItems(updatedItems)
    setItemCount(updatedItems.reduce((sum, item) => sum + item.quantity, 0))
    setTotal(updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0))
    
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })
      const data = await response.json()
      
      if (!data.success) {
        // Rollback on failure
        setItems(previousItems)
        setItemCount(previousCount)
        setTotal(previousTotal)
        throw new Error(data.error)
      }
    } catch (error) {
      // Rollback on error
      setItems(previousItems)
      setItemCount(previousCount)
      setTotal(previousTotal)
      console.error("Failed to update quantity:", error)
      throw error
    }
  }, [items, itemCount, total])

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    // Optimistic update
    const previousItems = [...items]
    const previousCount = itemCount
    const previousTotal = total
    
    const updatedItems = items.filter((item) => item.id !== itemId)
    setItems(updatedItems)
    setItemCount(updatedItems.reduce((sum, item) => sum + item.quantity, 0))
    setTotal(updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0))
    
    try {
      const response = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      })
      const data = await response.json()
      
      if (!data.success) {
        // Rollback on failure
        setItems(previousItems)
        setItemCount(previousCount)
        setTotal(previousTotal)
        throw new Error(data.error)
      }
    } catch (error) {
      // Rollback on error
      setItems(previousItems)
      setItemCount(previousCount)
      setTotal(previousTotal)
      console.error("Failed to remove item:", error)
      throw error
    }
  }, [items, itemCount, total])

  const value: CartContextType = {
    items,
    itemCount,
    total,
    isLoading,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
