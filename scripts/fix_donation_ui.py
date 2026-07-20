from pathlib import Path

txt = Path('components/camp-application-form.tsx').read_text()
lines = txt.splitlines(True)

start = None
for i, line in enumerate(lines):
    if 'Donation Amount</h4>' in line:
        start = i - 1
        break

if start is None:
    print('ERROR: not found')
    exit(1)

depth = 0
end = None
for i in range(start, len(lines)):
    depth += lines[i].count('<div') - lines[i].count('</div')
    if depth == 0:
        end = i
        break

P = chr(163)
B = chr(96)
E = chr(33)

new = []
new.append('                <div className="mt-6 pt-6 border-t">')
new.append('                  <div className="text-center mb-4">')
new.append('                    <h4 className="text-lg font-bold">Support Singhs Camp</h4>')
new.append('                    <p className="text-sm text-muted-foreground mt-1">')
new.append(f'                      The standard camp contribution is <strong>{P}199</strong>. If you are able to give more, your generosity directly funds activities, meals and facilities for all campers.')
new.append('                    </p>')
new.append('                  </div>')
new.append('')
new.append('                  <div className="grid grid-cols-3 gap-2 mb-3">')
new.append('                    {[199, 250, 350].map(amt => (')
new.append('                      <button')
new.append('                        key={amt}')
new.append('                        type="button"')
new.append('                        onClick={() => update("donation_amount", String(amt))}')
new.append('                        className={' + B + 'relative rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 ${form.donation_amount === String(amt) ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}' + B + '}')
new.append('                      >')
new.append('                        {amt === 199 && (')
new.append('                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Standard</span>')
new.append('                        )}')
new.append('                        {amt === 250 && (')
new.append('                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Popular</span>')
new.append('                        )}')
new.append('                        {amt === 350 && (')
new.append('                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Generous</span>')
new.append('                        )}')
new.append(f'                        <span className="text-xl font-bold">{P}' + '{amt}</span>')
new.append('                      </button>')
new.append('                    ))}')
new.append('                  </div>')
new.append('')
new.append('                  <button')
new.append('                    type="button"')
new.append('                    onClick={() => {')
new.append('                      if (["199", "250", "350"].includes(form.donation_amount)) {')
new.append('                        update("donation_amount", "")')
new.append('                      }')
new.append('                      setTimeout(() => {')
new.append('                        const el = document.getElementById("donation_amount") as HTMLInputElement')
new.append('                        if (el) { el.focus() }')
new.append('                      }, 50)')
new.append('                    }}')
new.append('                    className={' + B + 'w-full rounded-xl border-2 p-3 text-center transition-all duration-150 focus:outline-none ${' + E + '["199", "250", "350"].includes(form.donation_amount) ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30" : "border-muted hover:border-primary/40 hover:shadow-sm"}' + B + '}')
new.append('                  >')
new.append('                    <span className="text-sm font-medium text-muted-foreground">Custom amount</span>')
new.append('                  </button>')
new.append('')
new.append('                  {' + E + '["199", "250", "350"].includes(form.donation_amount) && (')
new.append('                    <div className="mt-3">')
new.append('                      <div className="relative">')
new.append(f'                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">{P}</span>')
new.append('                        <Input')
new.append('                          id="donation_amount"')
new.append('                          type="number"')
new.append('                          min="199"')
new.append('                          step="1"')
new.append('                          className="pl-7 text-center text-lg font-semibold"')
new.append('                          value={form.donation_amount}')
new.append('                          onChange={e => update("donation_amount", e.target.value)}')
new.append('                          autoFocus')
new.append('                        />')
new.append('                      </div>')
new.append('                      {Number(form.donation_amount) < 199 && form.donation_amount.length > 0 && (')
new.append(f'                        <p className="text-xs text-red-600 mt-1 text-center">Minimum contribution is {P}199</p>')
new.append('                      )}')
new.append('                    </div>')
new.append('                  )}')
new.append('')
new.append('                  {Number(form.donation_amount) > 199 && (')
new.append('                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">')
new.append('                      <p className="text-sm text-emerald-800">')
new.append(f'                        <span className="font-semibold">Thank you{E}</span> Your extra {P}' + '{Number(form.donation_amount) - 199} helps fund camp activities and support those who need financial assistance.')
new.append('                      </p>')
new.append('                    </div>')
new.append('                  )}')
new.append('                </div>')

new_lines = [l + chr(10) for l in new]
lines[start:end+1] = new_lines
with open('components/camp-application-form.tsx', 'w') as f:
    f.writelines(lines)
print(f'SUCCESS: Replaced {end - start + 1} lines with {len(new_lines)} lines')