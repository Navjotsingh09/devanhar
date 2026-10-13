import Link from "next/link"

export function FooterDonateLink({ href = "/donate" }: { href?: string }) {
  return (
    <Link
      href={href}
      target={href.startsWith("https://") ? "_blank" : undefined}
      rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
      className="text-white/50 hover:text-white transition-colors text-sm"
    >
      Donate
    </Link>
  )
}
