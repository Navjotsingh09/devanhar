import type { Metadata } from "next"
import { CartPageContent } from "./cart-page-content"

export const metadata: Metadata = {
  title: "Shopping Cart | Devanhaar",
  description: "Review your cart items and proceed to checkout. Free shipping on orders over £50.",
  openGraph: {
    title: "Shopping Cart | Devanhaar",
    description: "Review your cart items and proceed to checkout.",
    type: "website",
  },
}

export default function CartPage() {
  return <CartPageContent />
}
