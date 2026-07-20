const fs = require("fs");
let form = fs.readFileSync("components/camp-application-form.tsx", "utf8");

const oldText = "Your monthly donation will be automatically deducted each month once your application is approved. Your Gift Aid declaration above also applies to your monthly donations.";
const newText = `Your monthly donation of <strong>£{form.monthly_donation_amount || '0'}</strong> will be automatically deducted each month once your application is approved. Your Gift Aid declaration above also applies to your monthly donations.
                      </p>
                    </div>

                    {/* Combined total summary */}
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Camp fee (one-off):</span>
                        <span className="font-semibold">£{form.donation_amount || '199'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Monthly donation:</span>
                        <span className="font-semibold">£{form.monthly_donation_amount || '0'}/month</span>
                      </div>
                      <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold">
                        <span>Total today:</span>
                        <span>£{form.donation_amount || '199'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        Camp fee charged on checkout. Monthly donation starts after approval.`;

form = form.replace(oldText, newText);
fs.writeFileSync("components/camp-application-form.tsx", form);
console.log("Added combined total UI to form");
