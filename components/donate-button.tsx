import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface DonateButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  source?: string
}

export function DonateButton({
  children,
  className,
  variant = "default",
  size = "default",
}: DonateButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/donate">
        {children ?? (
          <>
            Donate Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Link>
    </Button>
  )
}
