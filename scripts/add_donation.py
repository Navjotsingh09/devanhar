
with open("components/camp-application-form.tsx") as f:
    ls = f.readlines()

# Insert donation UI after line 963 (0-indexed 963, which is the )} closing Gift Aid)
donation_ui = [
    '              {form.requires_payment_support \!== "yes" && (\n',
    '                <div className="mt-6 pt-6 border-t">\n',
    '                  <h4 className="font-semibold mb-2">Donation Amount</h4>\n',
    '                  <p className="text-sm text-muted-foreground mb-3">\n',
    '                    The standard camp donation is \u00a3199. You can increase your donation below if you wish.\n',
    '                  </p>\n',
    '                  <div>\n',
    '                    <Label htmlFor="donation_amount" className="mb-1.5 block">Donation amount (\u00a3) *</Label>\n',
    '                    <Input\n',
    '                      id="donation_amount"\n',
    '                      type="number"\n',
    '                      min="199"\n',
    '                      step="1"\n',
    '                      value={form.donation_amount}\n',
    '                      onChange={e => {\n',
    '                        const val = e.target.value\n',
    '                        update("donation_amount", val)\n',
    '                      }}\n',
    '                    />\n',
    '                    {Number(form.donation_amount) < 199 && form.donation_amount.length > 0 && (\n',
    '                      <p className="text-xs text-red-700 mt-1">Minimum donation is \u00a3199</p>\n',
    '                    )}\n',
    '                  </div>\n',
    '                  <div className="mt-4">\n',
    '                    <Label className="mb-1.5 block">Payment type *</Label>\n',
    '                    <div className="flex flex-wrap gap-4 mt-2">\n',
    '                      <label className="flex items-center gap-2 text-sm">\n',
    '                        <input\n',
    '                          type="radio"\n',
    '                          name="donation_type"\n',
    '                          value="one-off"\n',
    '                          checked={form.donation_type === "one-off"}\n',
    '                          onChange={e => update("donation_type", e.target.value)}\n',
    '                        />\n',
    '                        One-off payment\n',
    '                      </label>\n',
    '                      <label className="flex items-center gap-2 text-sm">\n',
    '                        <input\n',
    '                          type="radio"\n',
    '                          name="donation_type"\n',
    '                          value="recurring"\n',
    '                          checked={form.donation_type === "recurring"}\n',
    '                          onChange={e => update("donation_type", e.target.value)}\n',
    '                        />\n',
    '                        Recurring monthly donation\n',
    '                      </label>\n',
    '                    </div>\n',
    '                    {form.donation_type === "recurring" && (\n',
    '                      <p className="text-xs text-muted-foreground mt-2">\n',
    '                        A monthly Direct Debit will be set up for \u00a3{form.donation_amount || "199"} per month. You can cancel at any time.\n',
    '                      </p>\n',
    '                    )}\n',
    '                  </div>\n',
    '                </div>\n',
    '              )}\n',
]

# Insert after line 963 (0-indexed)
new_ls = ls[:964] + donation_ui + ls[964:]

with open("components/camp-application-form.tsx", "w") as f:
    f.writelines(new_ls)

print(f"Inserted {len(donation_ui)} lines. Total: {len(new_ls)}")
