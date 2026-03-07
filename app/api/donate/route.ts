import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amount = searchParams.get("amount")
  const repeat = searchParams.get("repeat") || "o"
  const giftaid = searchParams.get("giftaid") || "false"

  if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
    return NextResponse.json(
      { error: "Invalid donation amount" },
      { status: 400 }
    )
  }

  const apiKey = process.env.NOWDONATE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Payment configuration error" },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    key: apiKey,
    currency: "GBP",
    amount: String(Number(amount)),
    repeat,
    giftaid,
  })

  try {
    const url = "https://www.donationmanager.co.uk/services/api/checkout/?" + params.toString()
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === "success" && data.url) {
      return NextResponse.json({ url: data.url })
    }

    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 502 }
    )
  } catch {
    return NextResponse.json(
      { error: "Payment service unavailable" },
      { status: 503 }
    )
  }
}
