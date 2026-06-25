
with open("app/api/camp-applications/route.ts") as f:
    c = f.read()

# 1. Add donation amount parsing after campFeeGbp
# Replace the line_items section to use dynamic amount
old_amount = "unit_amount: campFeeGbp * 100,"
new_amount = "unit_amount: donationAmountPence,"
c = c.replace(old_amount, new_amount, 1)

# 2. Add donation amount calculation before Stripe session creation
# Find "// Create Stripe Checkout session"
old_stripe_comment = "// Create Stripe Checkout session"
new_stripe_setup = """// Calculate donation amount
    const requestedAmount = Number(body.donation_amount) || campFeeGbp
    const donationAmount = Math.max(requestedAmount, campFeeGbp) // minimum is camp fee
    const donationAmountPence = donationAmount * 100
    const isRecurring = body.donation_type === 'recurring'

    // Create Stripe Checkout session"""
c = c.replace(old_stripe_comment, new_stripe_setup, 1)

# 3. For recurring, change mode to subscription and remove manual capture
# We need to handle both cases. Replace the session creation.
# Find the mode and payment_intent_data section
old_mode_section = """mode: 'payment',
        payment_method_types: ['card'],
        payment_intent_data: {
          capture_method: 'manual',
          metadata: {
            camp_application_id: data.id,
          },
        },"""

new_mode_section = """mode: isRecurring ? 'subscription' : 'payment',
        payment_method_types: ['card'],
        ...(isRecurring ? {} : {
          payment_intent_data: {
            capture_method: 'manual',
            metadata: {
              camp_application_id: data.id,
            },
          },
        }),"""
c = c.replace(old_mode_section, new_mode_section, 1)

# 4. Update line_items to support recurring
old_line_items = """line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: donationAmountPence,
              product_data: {
                name: 'Devanhaar Donation',
                description: `${body.first_name} ${body.last_name}`,
              },
            },
            quantity: 1,
          },
        ],"""

new_line_items = """line_items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: donationAmountPence,
              product_data: {
                name: isRecurring ? 'Devanhaar Monthly Donation' : 'Devanhaar Donation',
                description: `${body.first_name} ${body.last_name}`,
              },
              ...(isRecurring ? { recurring: { interval: 'month' } } : {}),
            },
            quantity: 1,
          },
        ],"""
c = c.replace(old_line_items, new_line_items, 1)

with open("app/api/camp-applications/route.ts", "w") as f:
    f.write(c)

print("route.ts updated")
