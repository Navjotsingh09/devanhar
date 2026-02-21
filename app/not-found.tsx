import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-primary mb-4">404</p>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  )
}
