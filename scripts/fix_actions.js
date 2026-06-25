const fs = require("fs");
let f = fs.readFileSync("app/dashboard/submissions/actions.ts", "utf8");

// Fix: use select('*') instead of specific columns for capture
f = f.replace(
  ".select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support, donation_amount, monthly_donation_opted, monthly_donation_amount')",
  ".select('*')"
);

// Make subscription code safe - check fields exist
f = f.replace(
  "if (app.monthly_donation_opted && app.monthly_donation_amount > 0 && app.stripe_payment_intent_id) {",
  "if (app.monthly_donation_opted && Number(app.monthly_donation_amount) > 0 && app.stripe_payment_intent_id) {"
);

// Also wrap the entire capture in try/catch to prevent Server Component crash
f = f.replace(
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);\n  if (app.stripe_payment_intent_id) { await stripe.paymentIntents.capture(app.stripe_payment_intent_id) }",
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);\n  if (app.stripe_payment_intent_id) {\n    try { await stripe.paymentIntents.capture(app.stripe_payment_intent_id) } catch (captureErr: any) {\n      if (captureErr?.code !== 'payment_intent_unexpected_state') throw captureErr\n      console.warn('[Capture] Payment intent already captured or in unexpected state')\n    }\n  }"
);

fs.writeFileSync("app/dashboard/submissions/actions.ts", f);
console.log("Fixed actions.ts");
