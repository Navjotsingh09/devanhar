import pathlib

p = pathlib.Path('app/api/camp-applications/route.ts')
s = p.read_text()
orig = s

old_unconditional = """    sendApplicationUnderReviewEmail({
      to: body.email.trim().toLowerCase(),
      firstName: body.first_name.trim(),
      applicationId: String(data.id),
    }).catch((emailErr) => {
      console.error('[Camp Email] Failed to send under-review email (non-blocking):', emailErr)
    })

"""
new_unconditional = """    // Under-review email is intentionally NOT sent here. It is sent only after
    // a real payment signal is received (Stripe webhook checkout.session.completed),
    // or for branches that bypass Stripe (payment support / deferred / Stripe error).

"""
assert old_unconditional in s, "unconditional email block not found"
s = s.replace(old_unconditional, new_unconditional, 1)

review_email = """      sendApplicationUnderReviewEmail({
        to: body.email.trim().toLowerCase(),
        firstName: body.first_name.trim(),
        applicationId: String(data.id),
      }).catch((emailErr) => {
        console.error('[Camp Email] Failed to send under-review email (non-blocking):', emailErr)
      })

"""

old_support = """    // If payment support requested, skip Stripe
    if (body.requires_payment_support === 'yes') {
      return NextResponse.json(
"""
new_support = "    // If payment support requested, skip Stripe\n    if (body.requires_payment_support === 'yes') {\n" + review_email + "      return NextResponse.json(\n"
assert old_support in s
s = s.replace(old_support, new_support, 1)

old_deferred = """    if (\!isStripePaymentModeEnabled()) {
      await supabase.from('activity_log').insert({
        action: 'Camp application captured without immediate payment',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: 'CAMP_PAYMENT_MODE is not stripe',
          payment_mode: paymentMode,
        },
      })

      return NextResponse.json(
"""
new_deferred = """    if (\!isStripePaymentModeEnabled()) {
      await supabase.from('activity_log').insert({
        action: 'Camp application captured without immediate payment',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: 'CAMP_PAYMENT_MODE is not stripe',
          payment_mode: paymentMode,
        },
      })

""" + review_email + "      return NextResponse.json(\n"
assert old_deferred in s
s = s.replace(old_deferred, new_deferred, 1)

old_stripeerr = """    } catch (stripeError) {
      console.error('[Camp Application] Stripe checkout creation failed, falling back to deferred payment:', stripeError)

      await supabase.from('activity_log').insert({
        action: 'Camp application captured after Stripe checkout failure',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe checkout error',
          payment_mode: 'deferred',
        },
      })

      return NextResponse.json(
"""
new_stripeerr = """    } catch (stripeError) {
      console.error('[Camp Application] Stripe checkout creation failed, falling back to deferred payment:', stripeError)

      await supabase.from('activity_log').insert({
        action: 'Camp application captured after Stripe checkout failure',
        entity_type: 'camp_application',
        entity_id: data.id,
        metadata: {
          reason: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe checkout error',
          payment_mode: 'deferred',
        },
      })

""" + review_email + "      return NextResponse.json(\n"
assert old_stripeerr in s
s = s.replace(old_stripeerr, new_stripeerr, 1)

p.write_text(s)
print("route.ts updated, len before:", len(orig), "after:", len(s))
