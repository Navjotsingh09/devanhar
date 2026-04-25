/**
 * Server-side discount resolution for camp applications.
 *
 * Sources:
 *  - Sevadaar self-claim (currently 50% on trust, flagged for admin review)
 *  - Promo code lookup via env var CAMP_PROMO_CODES_JSON
 *      e.g. CAMP_PROMO_CODES_JSON='{"SEVA50":50,"CAMP2026":50}'
 *
 * The two stack via MAX (not additively) so a Sevadaar with a 50% code still
 * pays the same — prevents 100% bypass.
 */

const SEVADAAR_DISCOUNT_PERCENT = Number(process.env.CAMP_SEVADAAR_DISCOUNT_PERCENT || "50")
const MAX_DISCOUNT_PERCENT = Number(process.env.CAMP_MAX_DISCOUNT_PERCENT || "75")

export type DiscountResolution = {
  percent: number
  code: string | null
  isSevadaar: boolean
  source: "sevadaar" | "code" | "sevadaar+code" | null
}

function loadPromoCodes(): Record<string, number> {
  const raw = process.env.CAMP_PROMO_CODES_JSON
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") {
      const out: Record<string, number> = {}
      for (const [k, v] of Object.entries(parsed)) {
        const pct = Number(v)
        if (Number.isFinite(pct) && pct > 0 && pct <= 100) {
          out[String(k).trim().toUpperCase()] = Math.min(pct, MAX_DISCOUNT_PERCENT)
        }
      }
      return out
    }
  } catch (err) {
    console.warn("[Camp Discounts] Failed to parse CAMP_PROMO_CODES_JSON:", err)
  }
  return {}
}

export function lookupPromoCode(code: string | null | undefined): number {
  if (!code) return 0
  const codes = loadPromoCodes()
  return codes[code.trim().toUpperCase()] || 0
}

export function resolveDiscount(input: {
  isSevadaar?: boolean | string | null
  discountCode?: string | null
}): DiscountResolution {
  const isSevadaar =
    input.isSevadaar === true || input.isSevadaar === "yes" || input.isSevadaar === "true"
  const codeRaw = (input.discountCode || "").trim().toUpperCase()
  const sevadaarPct = isSevadaar ? SEVADAAR_DISCOUNT_PERCENT : 0
  const codePct = lookupPromoCode(codeRaw)

  const percent = Math.min(Math.max(sevadaarPct, codePct), MAX_DISCOUNT_PERCENT)
  const codeApplied = codePct > 0 ? codeRaw : null

  let source: DiscountResolution["source"] = null
  if (isSevadaar && codePct > 0) source = "sevadaar+code"
  else if (isSevadaar) source = "sevadaar"
  else if (codePct > 0) source = "code"

  return {
    percent,
    code: codeApplied,
    isSevadaar,
    source,
  }
}

export function applyDiscount(baseAmountPence: number, percent: number): number {
  if (!percent || percent <= 0) return baseAmountPence
  const safePct = Math.min(Math.max(percent, 0), MAX_DISCOUNT_PERCENT)
  return Math.round(baseAmountPence * (100 - safePct) / 100)
}
