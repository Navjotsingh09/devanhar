

ALTER TABLE camp_applications
  ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT null,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT null;

COMMENT ON COLUMN camp_applications.stripe_customer_id IS 'Stripe Customer ID for subscription management';
COMMENT ON COLUMN camp_applications.stripe_subscription_id IS 'Stripe Subscription ID for monthly donations';
