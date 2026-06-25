const fs = require("fs");
let lines = fs.readFileSync("components/camp-application-form.tsx", "utf8").split("\n");

// Find the key markers
let thankYouStart = -1;  // {Number(form.donation_amount) > 199 && (
let monthlyStart = -1;    // {/* Monthly Donation / Direct Debit Section */}
let totalEnd = -1;        // last </div> of combined total
let brokenClose = -1;     // the broken </div> )} </div> )} at the end

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Number(form.donation_amount) > 199")) thankYouStart = i;
  if (lines[i].includes("Monthly Donation / Direct Debit")) monthlyStart = i;
  if (lines[i].includes("Combined total summary")) totalEnd = i;
}

console.log("thankYouStart:", thankYouStart + 1);
console.log("monthlyStart:", monthlyStart + 1);
console.log("totalEnd:", totalEnd + 1);

// Strategy: 
// 1. Close the "thank you" div and conditional properly before the monthly section
// 2. Move the total outside the monthly_opted conditional
// 3. Fix the broken closing tags

// Find the line with "Thank you!" text end (the </p> after the thank you text)
let thankYouTextEnd = -1;
for (let i = thankYouStart; i < monthlyStart; i++) {
  if (lines[i].includes("fund camp activities and support")) {
    // Find the closing </p> - might be same line or next
    for (let j = i; j < monthlyStart; j++) {
      if (lines[j].includes("</p>")) {
        thankYouTextEnd = j;
        break;
      }
    }
    break;
  }
}
console.log("thankYouTextEnd:", thankYouTextEnd + 1);

// Now let's find the end of the total summary block (the </div> after "Monthly donation starts after approval")
let totalBlockEnd = -1;
for (let i = totalEnd; i < lines.length; i++) {
  if (lines[i].includes("Monthly donation starts after approval")) {
    // Find the next 3 closing tags: </p>, </div>, </div>
    let closings = 0;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === "</div>" || lines[j].trim() === "</p>") closings++;
      if (closings >= 2) {
        totalBlockEnd = j;
        break;
      }
    }
    break;
  }
}
console.log("totalBlockEnd:", totalBlockEnd + 1);

// Find the broken closing section after total: </div> )} </div> )}
// These are the ones that close: monthly_opted div, emerald-50 div, >199 conditional, payment section div, payment conditional
let brokenStart = -1;
for (let i = totalBlockEnd + 1; i < totalBlockEnd + 10; i++) {
  if (lines[i] && (lines[i].trim() === "</div>" || lines[i].trim() === ")}" || lines[i].trim() === ")}")) {
    if (brokenStart === -1) brokenStart = i;
  }
}
console.log("brokenStart:", brokenStart + 1);

// Now rebuild. The approach:
// Before thankYouStart: keep as-is
// thankYouStart to thankYouTextEnd: keep the >199 conditional + thank you message
// Insert proper closing: </div> )} after thank you
// monthlyStart onwards: Monthly section (outside the >199 conditional)
// Move total outside monthly_opted conditional
// Fix closing tags

// Let's rebuild the section from thankYouStart to the end of step 7
let before = lines.slice(0, thankYouStart);

// The thank you block - properly closed
let thankYouBlock = [
  "                  {Number(form.donation_amount) > 199 && (",
  '                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">',
  '                      <p className="text-sm text-emerald-800">',
  "                        <span className=\"font-semibold\">Thank you!</span> Your extra £{Number(form.donation_amount) - 199} helps fund camp activities and support those who need financial assistance.",
  "                      </p>",
  "                    </div>",
  "                  )}",
  "",
];

// Find the end of the monthly opted "yes" block content (before the combined total)
// We want to extract: monthly section header, yes/no buttons, amount selection, info text
// Then put total OUTSIDE the monthly_opted check

// Find where monthly_opted "yes" conditional starts
let monthlyOptedStart = -1;
for (let i = monthlyStart; i < lines.length; i++) {
  if (lines[i].includes('form.monthly_donation_opted === "yes"') && lines[i].includes("&&")) {
    monthlyOptedStart = i;
    break;
  }
}
console.log("monthlyOptedStart:", monthlyOptedStart + 1);

// The monthly section (outside >199 conditional)
let monthlySection = [];
// Header + yes/no buttons (from monthlyStart to monthlyOptedStart-1)
for (let i = monthlyStart; i < monthlyOptedStart; i++) {
  monthlySection.push(lines[i]);
}

// Monthly opted "yes" content - amounts, custom, info text (but NOT the total)
// Find the combined total marker
for (let i = monthlyOptedStart; i < lines.length; i++) {
  if (lines[i].includes("Combined total summary")) break;
  monthlySection.push(lines[i]);
}

// Close the monthly_opted div and conditional
monthlySection.push("                  </div>");
monthlySection.push("                )}");
monthlySection.push("");

// Now the total summary - ALWAYS visible (outside monthly_opted)
monthlySection.push("                {/* Order Summary */}");
monthlySection.push('                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4">');
monthlySection.push('                  <div className="flex justify-between text-sm">');
monthlySection.push("                    <span>Camp fee (one-off):</span>");
monthlySection.push("                    <span className=\"font-semibold\">£{form.donation_amount || '199'}</span>");
monthlySection.push("                  </div>");
monthlySection.push("                  {form.monthly_donation_opted === \"yes\" && Number(form.monthly_donation_amount) > 0 && (");
monthlySection.push('                    <div className="flex justify-between text-sm mt-1">');
monthlySection.push("                      <span>Monthly donation:</span>");
monthlySection.push("                      <span className=\"font-semibold\">£{form.monthly_donation_amount}/month</span>");
monthlySection.push("                    </div>");
monthlySection.push("                  )}");
monthlySection.push('                  <div className="border-t mt-2 pt-2 flex justify-between text-sm font-bold">');
monthlySection.push("                    <span>Total charged today:</span>");
monthlySection.push("                    <span>£{form.donation_amount || '199'}</span>");
monthlySection.push("                  </div>");
monthlySection.push("                  {form.monthly_donation_opted === \"yes\" && Number(form.monthly_donation_amount) > 0 && (");
monthlySection.push('                    <p className="text-xs text-muted-foreground mt-1 text-center">');
monthlySection.push("                      + £{form.monthly_donation_amount}/month starting after approval");
monthlySection.push("                    </p>");
monthlySection.push("                  )}");
monthlySection.push("                </div>");

// Close the monthly section div, then the payment section div, then the conditional
monthlySection.push("              </div>");  // close monthly section
monthlySection.push("                </div>");  // close payment support div
monthlySection.push("              )}");  // close requires_payment_support

// Find where step 7's closing </div> )} is and the rest of the file
let stepClose = -1;
for (let i = totalBlockEnd; i < lines.length; i++) {
  if (lines[i].includes("{error && (")) {
    stepClose = i;
    break;
  }
}

// Find the </div> and )} that close step 7 just before {error
let step7Close = stepClose;
// Go backwards to find </div> and )}
let closeLines = [];
for (let i = stepClose - 1; i > totalBlockEnd; i--) {
  let t = lines[i].trim();
  if (t === "</div>" || t === ")}" || t === "") {
    // skip
  } else {
    break;
  }
}

// Add the step 7 closing
monthlySection.push("            </div>");  // close step 7 space-y-4
monthlySection.push("          )}");  // close step === 7
monthlySection.push("");

// Rest of the file from {error && onwards
let after = lines.slice(stepClose);

let result = [...before, ...thankYouBlock, ...monthlySection, ...after];
fs.writeFileSync("components/camp-application-form.tsx", result.join("\n"));
console.log("Form structure fixed");
