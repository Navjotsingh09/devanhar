import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "igkpvudaqxkncxgslbvb.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // Suppresses source map upload logs during build
  silent: true,
  // Upload source maps to Sentry so stack traces show real code lines
  widenClientFileUpload: true,
  // Hides Sentry's own routes from the Next.js route listing
  hideSourceMaps: true,
  // Disable the Sentry tunnel route (not needed unless behind strict CSP)
  tunnelRoute: undefined,
  // Tree-shake Sentry debug code in production
  disableLogger: true,
  // Auth token for source map uploads — set SENTRY_AUTH_TOKEN in Vercel env vars
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
})
