import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface DonateButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  source?: string
  href?: string
}

export function DonateButton({
  children,
  className,
  variant = "default",
  size = "default",
  href = "/donate",
}: DonateButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>
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
