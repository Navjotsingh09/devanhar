"use client"

import React from "react"

import { useDonation } from "@/components/donation-provider"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface DonateButtonProps {
  source: string
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function DonateButton({
  source,
  children,
  className,
  variant = "default",
  size = "default",
}: DonateButtonProps) {
  const { openDonation } = useDonation()

  return (
    <Button
      onClick={() => openDonation(source)}
      variant={variant}
      size={size}
      className={className}
    >
      {children ?? (
        <>
          Donate Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
