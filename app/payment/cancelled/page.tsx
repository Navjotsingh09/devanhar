"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, ArrowLeft } from "lucide-react"
import { Suspense } from "react"

function CancelledContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was not completed. No charges have been made. You can try again whenever you&apos;re ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CancelledPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      }
    >
      <CancelledContent />
    </Suspense>
  )
}
