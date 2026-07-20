import { NextResponse } from "next/server"

export async function GET() {
  const stripeConnected = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
  const nowDonateConnected = Boolean(process.env.NOWDONATE_API_KEY)

  return NextResponse.json({
    stripeConnected,
    nowDonateConnected,
  })
}
