const fs = require("fs");

// 1. Update API route - add customer_creation and setup_future_usage
let api = fs.readFileSync("app/api/camp-applications/route.ts", "utf8");

// Add customer_creation to checkout session
api = api.replace(
  "customer_email: body.email.trim().toLowerCase(),",
  "customer_email: body.email.trim().toLowerCase(),\n        customer_creation: 'always',"
);

// Add setup_future_usage to payment_intent_data
api = api.replace(
  "capture_method: 'manual',",
  "capture_method: 'manual',\n          setup_future_usage: 'off_session',"
);

// Add monthly donation info to metadata
api = api.replace(
  "gift_aid: body.gift_aid === 'yes' ? 'true' : 'false',",
  "gift_aid: body.gift_aid === 'yes' ? 'true' : 'false',\n          monthly_donation_opted: body.monthly_donation_opted === 'yes' ? 'true' : 'false',\n          monthly_donation_amount: body.monthly_donation_opted === 'yes' ? String(body.monthly_donation_amount || '0') : '0',"
);

// Update the line_items description to show monthly donation if opted
api = api.replace(
  "description: `${body.first_name} ${body.last_name}`,",
  "description: body.monthly_donation_opted === 'yes' ? `${body.first_name} ${body.last_name} (Camp fee + \\u00a3${body.monthly_donation_amount}/mo subscription)` : `${body.first_name} ${body.last_name}`,"
);

fs.writeFileSync("app/api/camp-applications/route.ts", api);
console.log("Updated: API route");

// 2. Update dashboard actions - create subscription on approval
let actions = fs.readFileSync("app/dashboard/submissions/actions.ts", "utf8");

// Add stripe_customer_id and monthly donation fields to the select query in captureApplicationPayment
actions = actions.replace(
  ".select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support')",
  ".select('stripe_payment_intent_id, status, first_name, last_name, email, requires_payment_support, monthly_donation_opted, monthly_donation_amount')"
);

// After the payment capture, add subscription creation
actions = actions.replace(
  "  sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true).catch(() => {})",
  `  // Create monthly subscription if opted in
  if (app.monthly_donation_opted && app.monthly_donation_amount > 0 && app.stripe_payment_intent_id) {
    try {
      const pi = await stripe.paymentIntents.retrieve(app.stripe_payment_intent_id, { expand: ['customer', 'payment_method'] })
      if (pi.customer && pi.payment_method) {
        const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer.id
        const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method.id
        await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: pmId } })
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price_data: { currency: 'gbp', unit_amount: Math.round(app.monthly_donation_amount * 100), product_data: { name: 'Devanhaar Monthly Donation' }, recurring: { interval: 'month' } } }],
          metadata: { camp_application_id: applicationId },
        })
        await supabase.from('camp_applications').update({ stripe_subscription_id: subscription.id }).eq('id', applicationId)
        console.log('[Subscription] Created monthly subscription:', subscription.id)
      }
    } catch (subErr) {
      console.error('[Subscription] Failed to create monthly subscription (non-blocking):', subErr)
    }
  }
  sendApprovalEmail(app.email, app.first_name, app.requires_payment_support === true).catch(() => {})`
);

// Need to ensure stripe is available even when no payment intent (move stripe init up)
// Currently stripe is only created inside the if block. Let's fix that.
actions = actions.replace(
  "if (app.stripe_payment_intent_id) { const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); await stripe.paymentIntents.capture(app.stripe_payment_intent_id) }",
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);\n  if (app.stripe_payment_intent_id) { await stripe.paymentIntents.capture(app.stripe_payment_intent_id) }"
);

fs.writeFileSync("app/dashboard/submissions/actions.ts", actions);
console.log("Updated: Dashboard actions");

// 3. Update the webhook to store stripe_customer_id
let webhook = fs.readFileSync("app/api/webhooks/stripe/route.ts", "utf8");

// After checkout.session.completed, also save stripe customer ID
webhook = webhook.replace(
  'status: "payment_pending",',
  'status: "payment_pending",\n            stripe_customer_id: session.customer ? String(session.customer) : null,'
);

fs.writeFileSync("app/api/webhooks/stripe/route.ts", webhook);
console.log("Updated: Stripe webhook");

console.log("All Stripe changes applied");
