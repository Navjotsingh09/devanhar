import Link from "next/link"

export function FooterDonateLink() {
  return (
    <Link
      href="/donate"
      className="text-white/50 hover:text-white transition-colors text-sm"
    >
      Donate
    </Link>
  )
}
