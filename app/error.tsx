"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          Something went wrong
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Oops!
        </h1>
        <p className="text-muted-foreground mb-8">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
        >
          Try Again
        </Button>
      </div>
    </main>
  )
}
