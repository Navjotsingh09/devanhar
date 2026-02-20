"use client"

import { useDonation } from "@/components/donation-provider"

export function FooterDonateLink() {
  const { openDonation } = useDonation()

  return (
    <button
      type="button"
      onClick={() => openDonation("footer")}
      className="text-white/50 hover:text-white transition-colors text-sm text-left"
    >
      Donate
    </button>
  )
}
