import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/initiatives/sikh-family-initiative", destination: "/sikh-family-initiative", permanent: true },
      { source: "/initiatives/forums", destination: "/forums", permanent: true },
      { source: "/initiatives/gurmat-academy", destination: "/gurmat-academy", permanent: true },
      { source: "/initiatives/kaurs-camp", destination: "/kaurs-camp", permanent: true },
      { source: "/initiatives/khalsa-catalyst", destination: "/khalsa-catalyst", permanent: true },
      { source: "/initiatives/kids-camps", destination: "/kids-camps", permanent: true },
      { source: "/initiatives/roots-residential", destination: "/roots-residential", permanent: true },
      { source: "/initiatives/self-defence-academy", destination: "/self-defence-academy", permanent: true },
      { source: "/initiatives/sikh-family-extravaganza", destination: "/sikh-family-extravaganza", permanent: true },
      { source: "/initiatives/sikh-family-retreat", destination: "/sikh-family-retreat", permanent: true },
      { source: "/initiatives/sikh-padel-association", destination: "/sikh-padel-association", permanent: true },
      { source: "/initiatives/sikh-professional-network", destination: "/sikh-professional-network", permanent: true },
      { source: "/initiatives/sikhi-vidyala", destination: "/sikhi-vidyala", permanent: true },
      { source: "/initiatives/singhs-camp-eu", destination: "/singhs-camp-eu", permanent: true },
      { source: "/initiatives/singhs-camp", destination: "/singhs-camp", permanent: true },
      { source: "/initiatives/spn", destination: "/spn", permanent: true },
      { source: "/initiatives/sweb3", destination: "/sweb3", permanent: true },
      { source: "/initiatives/university-projects", destination: "/university-projects", permanent: true },
      { source: "/initiatives/wedding-fair", destination: "/wedding-fair", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/initiatives/sikh-padel-association",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ]
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
