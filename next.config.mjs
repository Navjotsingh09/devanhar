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
      { source: "/initiatives/gurmat-academy", destination: "/ga", permanent: true },
      { source: "/gurmat-academy", destination: "/ga", permanent: true },
      { source: "/initiatives/kaurs-camp", destination: "/kc", permanent: true },
      { source: "/kaurs-camp", destination: "/kc", permanent: true },
      { source: "/initiatives/khalsa-catalyst", destination: "/kcat", permanent: true },
      { source: "/khalsa-catalyst", destination: "/kcat", permanent: true },
      { source: "/initiatives/kids-camps", destination: "/kids", permanent: true },
      { source: "/kids-camps", destination: "/kids", permanent: true },
      { source: "/initiatives/roots-residential", destination: "/rr", permanent: true },
      { source: "/roots-residential", destination: "/rr", permanent: true },
      { source: "/initiatives/self-defence-academy", destination: "/sda", permanent: true },
      { source: "/self-defence-academy", destination: "/sda", permanent: true },
      { source: "/initiatives/sikh-family-extravaganza", destination: "/sfe", permanent: true },
      { source: "/sikh-family-extravaganza", destination: "/sfe", permanent: true },
      { source: "/initiatives/sikh-family-initiative", destination: "/sfi", permanent: true },
      { source: "/sikh-family-initiative", destination: "/sfi", permanent: true },
      { source: "/initiatives/sikh-family-retreat", destination: "/sfr", permanent: true },
      { source: "/sikh-family-retreat", destination: "/sfr", permanent: true },
      { source: "/initiatives/sikh-padel-association", destination: "/spa", permanent: true },
      { source: "/sikh-padel-association", destination: "/spa", permanent: true },
      { source: "/initiatives/sikh-padel-association/leaderboard", destination: "/spa/leaderboard", permanent: true },
      { source: "/initiatives/sikh-padel-association/leaderboard/:playerId", destination: "/spa/leaderboard/:playerId", permanent: true },
      { source: "/initiatives/sikh-padel-association/tournaments", destination: "/spa/tournaments", permanent: true },
      { source: "/initiatives/sikh-padel-association/tournaments/:id", destination: "/spa/tournaments/:id", permanent: true },
      { source: "/initiatives/sikh-professional-network", destination: "/sikhpn", permanent: true },
      { source: "/sikh-professional-network", destination: "/sikhpn", permanent: true },
      { source: "/initiatives/sikhi-vidyala", destination: "/sv", permanent: true },
      { source: "/sikhi-vidyala", destination: "/sv", permanent: true },
      { source: "/initiatives/singhs-camp-eu", destination: "/sce", permanent: true },
      { source: "/singhs-camp-eu", destination: "/sce", permanent: true },
      { source: "/initiatives/singhs-camp", destination: "/sc", permanent: true },
      { source: "/singhs-camp", destination: "/sc", permanent: true },
      { source: "/initiatives/university-projects", destination: "/up", permanent: true },
      { source: "/university-projects", destination: "/up", permanent: true },
      { source: "/initiatives/wedding-fair", destination: "/wf", permanent: true },
      { source: "/wedding-fair", destination: "/wf", permanent: true },
      { source: "/initiatives/punjab-education-support", destination: "/pes", permanent: true },
      { source: "/punjab-education-support", destination: "/pes", permanent: true },
      { source: "/initiatives/forums", destination: "/forums", permanent: true },
      { source: "/initiatives/spn", destination: "/spn", permanent: true },
      { source: "/initiatives/sweb3", destination: "/sweb3", permanent: true },
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
