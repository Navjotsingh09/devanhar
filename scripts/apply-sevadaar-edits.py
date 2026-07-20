#!/usr/bin/env python3
import pathlib, sys
FORM = pathlib.Path("components/camp-application-form.tsx")
src = FORM.read_text()
orig = src

old_props = """interface CampApplicationFormProps {
  initiativeSlug?: string
  onClose: () => void
}"""
new_props = """interface CampApplicationFormProps {
  initiativeSlug?: string
  onClose: () => void
  showDiscountPreview?: boolean
}"""
assert old_props in src, "props interface not found"
src = src.replace(old_props, new_props)

old_destr = """export function CampApplicationForm({
  initiativeSlug = "singhs-camp",
  onClose,
}: CampApplicationFormProps) {"""
new_destr = """export function CampApplicationForm({
  initiativeSlug = "singhs-camp",
  onClose,
  showDiscountPreview = false,
}: CampApplicationFormProps) {"""
assert old_destr in src, "destructure not found"
src = src.replace(old_destr, new_destr)

old_state = """    payment_support_details: "",
    own_transport_type: "",
    bjj_interest: "","""
new_state = """    payment_support_details: "",
    own_transport_type: "",
    is_sevadaar: false,
    discount_code: "",
    discount_code_applied: "",
    discount_percent: 0,
    bjj_interest: "","""
assert old_state in src, "state block not found"
src = src.replace(old_state, new_state)

old_anchor = """              {form.requires_payment_support === "yes" && (
                <div>
                  <Label htmlFor="payment_support_details" className="mb-1.5 block">Please explain your circumstances</Label>
                  <Textarea id="payment_support_details" rows={3}
                    placeholder="Tell us about your situation so we can help"
                    value={form.payment_support_details}
                    onChange={e => update("payment_support_details", e.target.value)} />
                </div>
              )}
            </div>
          )}
          {step === 5 && ("""

new_anchor = """              {form.requires_payment_support === "yes" && (
                <div>
                  <Label htmlFor="payment_support_details" className="mb-1.5 block">Please explain your circumstances</Label>
                  <Textarea id="payment_support_details" rows={3}
                    placeholder="Tell us about your situation so we can help"
                    value={form.payment_support_details}
                    onChange={e => update("payment_support_details", e.target.value)} />
                </div>
              )}
              {showDiscountPreview && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900">
                    <strong>Preview feature</strong> &mdash; Sevadaar discount &amp; promo code (UI only, not yet wired to backend).
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50">
                    <input
                      type="checkbox"
                      id="is_sevadaar"
                      className="mt-1 h-4 w-4"
                      checked={form.is_sevadaar as boolean}
                      onChange={e => update("is_sevadaar", e.target.checked)}
                    />
                    <div>
                      <Label htmlFor="is_sevadaar" className="cursor-pointer font-medium">
                        Are you a Sevadaar?
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Active Sevadaars receive a 50% discount on the camp donation. Subject to verification by the admin team.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="discount_code" className="mb-1.5 block">
                      Discount code <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="discount_code"
                        placeholder="Enter code"
                        value={form.discount_code as string}
                        onChange={e => update("discount_code", e.target.value.toUpperCase())}
                        disabled={!!form.discount_code_applied}
                      />
                      {form.discount_code_applied ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            update("discount_code", "")
                            update("discount_code_applied", "")
                            update("discount_percent", 0)
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const DEMO_CODES: Record<string, number> = { SEVA50: 50, CAMP2026: 50 }
                            const code = (form.discount_code as string).trim().toUpperCase()
                            const pct = DEMO_CODES[code]
                            if (pct) {
                              update("discount_code_applied", code)
                              update("discount_percent", pct)
                            } else {
                              alert("Invalid or expired code (preview check)")
                            }
                          }}
                          disabled={!(form.discount_code as string).trim()}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    {form.discount_code_applied && (
                      <p className="text-xs text-green-700 mt-1.5">
                        Code <strong>{form.discount_code_applied}</strong> applied &mdash; {form.discount_percent}% off
                      </p>
                    )}
                  </div>
                  {(() => {
                    const pct = Math.max(form.is_sevadaar ? 50 : 0, form.discount_percent as number)
                    const base = 199
                    const final = Math.round(base * (1 - pct / 100))
                    return (
                      <div className="rounded-lg bg-white border p-3 text-sm">
                        <div className="flex justify-between"><span>Base donation</span><span>&pound;{base}</span></div>
                        {pct > 0 && (
                          <div className="flex justify-between text-green-700"><span>Discount ({pct}%)</span><span>&minus;&pound;{base - final}</span></div>
                        )}
                        <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                          <span>Total</span><span>&pound;{final}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
          {step === 5 && ("""

assert old_anchor in src, "step 5 anchor not found"
src = src.replace(old_anchor, new_anchor)

assert src != orig, "no change!"
FORM.write_text(src)
print(f"wrote {len(src)} (was {len(orig)})")
back = FORM.read_text()
for m in ["showDiscountPreview", "is_sevadaar", "Are you a Sevadaar", "SEVA50", "discount_code_applied"]:
    assert m in back, f"missing: {m}"
print("all markers verified on disk")
