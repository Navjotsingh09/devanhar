import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"

// Static product data (same structure as shop)
const products = [
  {
    id: 1,
    slug: "devanhaar-classic-tee",
    name: "Devanhaar Classic Tee",
    price: 25.00,
    category: "clothing",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
    description: "Premium cotton tee with embroidered Devanhaar logo. Every purchase supports Sikh education.",
    longDescription: "Our signature t-shirt featuring the Devanhaar logo embroidered on the chest. Made from 100% organic cotton sourced from sustainable farms, this comfortable everyday tee represents your support for Sikh education and community programmes. The fabric is pre-shrunk and garment-dyed for a vintage feel that gets softer with every wash.",
    careInstructions: "Machine wash cold with like colours. Tumble dry low. Do not bleach. Iron on low heat if needed. Do not dry clean.",
    badge: "Best Seller",
    variants: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
    stockCount: 45,
  },
  {
    id: 2,
    slug: "khanda-hoodie",
    name: "Khanda Hoodie",
    price: 55.00,
    category: "clothing",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
    ],
    description: "Cosy hoodie with subtle Khanda design. Premium quality, ethically made.",
    longDescription: "Stay warm while representing your faith with our premium Khanda hoodie. Features a subtle yet striking Khanda embroidered design on the chest. Made from a soft cotton-polyester blend for durability and comfort. Includes a kangaroo pocket and adjustable drawstring hood.",
    careInstructions: "Machine wash cold inside out. Tumble dry low. Do not iron directly on print. Do not bleach.",
    badge: null,
    variants: ["S", "M", "L", "XL", "2XL"],
    inStock: true,
    stockCount: 28,
  },
  {
    id: 3,
    slug: "seva-water-bottle",
    name: "Seva Water Bottle",
    price: 18.00,
    category: "accessories",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80",
    ],
    description: "Stainless steel bottle with \"Seva\" engraving. Keeps drinks cold for 24hrs.",
    longDescription: "Our double-walled stainless steel water bottle keeps your drinks cold for up to 24 hours or hot for 12 hours. Features a beautiful \"Seva\" engraving as a daily reminder of selfless service. BPA-free, leak-proof cap with carrying loop. 750ml capacity.",
    careInstructions: "Hand wash only with warm soapy water. Do not microwave. Do not freeze. Dry thoroughly before storing.",
    badge: "Eco-Friendly",
    variants: ["750ml"],
    inStock: true,
    stockCount: 62,
  },
  {
    id: 4,
    slug: "japji-sahib-journal",
    name: "Japji Sahib Journal",
    price: 15.00,
    category: "books",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=800&q=80",
    ],
    description: "Beautiful hardcover journal with Japji Sahib verses. Perfect for reflection.",
    longDescription: "A beautifully crafted hardcover journal featuring selected verses from Japji Sahib on each page. 200 lined pages on premium acid-free paper. Includes ribbon bookmark and elastic closure. Perfect for daily reflection, journaling, or as a thoughtful gift.",
    careInstructions: "Store in a cool, dry place. Keep away from direct sunlight to preserve cover quality.",
    badge: null,
    variants: ["Standard"],
    inStock: true,
    stockCount: 34,
  },
  {
    id: 5,
    slug: "community-cap",
    name: "Community Cap",
    price: 22.00,
    category: "clothing",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80",
    ],
    description: "Adjustable cap with Devanhaar community badge. One size fits all.",
    longDescription: "Show your Devanhaar pride with our adjustable community cap. Features an embroidered Devanhaar badge on the front and adjustable strap for the perfect fit. Made from durable cotton twill with a pre-curved brim. Breathable design perfect for outdoor events and seva.",
    careInstructions: "Spot clean only. Do not machine wash. Reshape while damp. Air dry only.",
    badge: "New",
    variants: ["One Size"],
    inStock: true,
    stockCount: 89,
  },
  {
    id: 6,
    slug: "sikhi-colouring-book",
    name: "Sikhi Colouring Book",
    price: 12.00,
    category: "books",
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
      "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800&q=80",
    ],
    description: "Educational colouring book teaching Sikhi basics to children.",
    longDescription: "Introduce children to the beauty of Sikhi through art. This educational colouring book features 50 pages of illustrations depicting Sikh history, values, and traditions. Each page includes simple explanations suitable for ages 4-10. Printed on thick paper that handles crayons, coloured pencils, and markers.",
    careInstructions: "Keep dry. Store flat to prevent page warping.",
    badge: "For Kids",
    variants: ["Standard"],
    inStock: false,
    stockCount: 0,
  },
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(currentSlug: string, category: string) {
  return products
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, 4)
}

export function getAllProducts() {
  return products
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found | Devanhaar Shop",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Devanhaar Shop`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0], width: 800, height: 800 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(slug, product.category)

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
    />
  )
}
